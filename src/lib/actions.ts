"use server";
// 'use client'

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import { Document, DocumentRecipient, AuditLog, User } from "@/lib/models";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Create Document
// Create Document
export async function createDocument(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "SARABAN" && session.user.role !== "ADMIN")) {
        throw new Error("Unauthorized");
    }

    const file = formData.get('file') as File;
    const storageType = formData.get('storageType') as string;
    const recipients = JSON.parse(formData.get('recipients') as string) as string[];

    let fileUrl = "";

    if (file && file.size > 0) {
        if (storageType === 'cloudinary') {
            const { uploadToCloudinary } = await import("./cloudinary");
            fileUrl = await uploadToCloudinary(file, "saraban/documents");
        } else {
            // Local storage
            fileUrl = await saveFile(file);
        }
    }

    await dbConnect();

    const doc = await Document.create({
        docNumber: formData.get('docNumber'),
        title: formData.get('title'),
        description: formData.get('description'),
        fileUrl: fileUrl,
        originalName: file?.name || "",
        createdBy: session.user.id
    });

    const docObj = doc.toJSON();

    // Create recipients
    const recipientEntries = recipients.map(userId => ({
        documentId: doc._id,
        userId,
        status: "PENDING"
    }));

    await DocumentRecipient.insertMany(recipientEntries);

    // Audit Log
    await AuditLog.create({
        documentId: doc._id,
        userId: session.user.id,
        action: "SEND",
        refId: doc._id,
        refModel: "Document",
        ipAddress: "N/A"
    });

    revalidatePath("/dashboard");
    revalidatePath("/documents/sent");
    return { success: true, docId: docObj._id.toString() };
}

// Update Document Status (Read/Receive)
export async function updateRecipientStatus(recipientId: string, status: "READ" | "RECEIVED") {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    await dbConnect();

    const update: Record<string, any> = { status };
    if (status === "READ") update.readAt = new Date();
    if (status === "RECEIVED") update.receivedAt = new Date();

    const recipient = await DocumentRecipient.findOneAndUpdate(
        { _id: recipientId, userId: session.user.id },
        update,
        { new: true }
    );

    if (!recipient) throw new Error("Recipient record not found");

    // Audit Log
    await AuditLog.create({
        documentId: recipient.documentId,
        userId: session.user.id,
        action: status === "READ" ? "READ" : "RECEIVE",
    });

    revalidatePath("/dashboard");
    revalidatePath("/inbox");
    revalidatePath(`/documents/${recipient.documentId}`);
    return { success: true };
}

// Get Users for Recipients
export async function getUsers() {
    await dbConnect();
    const users = await User.find({ isActive: true }).select("name position department role").lean();
    return users.map((user: Record<string, any>) => ({
        ...user,
        _id: user._id.toString()
    }));
}

// --- Order System Actions ---

import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

// Helper to save file
async function saveFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/\s+/g, '-');

    // Ensure upload dir exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch {
        // Ignore if exists
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
}

export async function createOrder(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const file = formData.get('file') as File;
    if (!file) throw new Error("File is required");

    // Limit file size (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) throw new Error("File size too large (max 10MB)");

    const docNumber = formData.get('orderNumber') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Save file
    const fileUrl = await saveFile(file);

    await dbConnect();

    // Check duplicate
    const existing = await import("@/lib/models").then(m => m.Order.findOne({ orderNumber: docNumber }));
    if (existing) throw new Error("Duplicate Order Number");

    const Order = await import("@/lib/models").then(m => m.Order);
    const AuditLog = await import("@/lib/models").then(m => m.AuditLog);

    const newOrder = await Order.create({
        orderNumber: docNumber,
        title,
        description,
        documentDate: formData.get('documentDate') ? new Date(formData.get('documentDate') as string) : new Date(),
        fileUrl,
        originalName: file.name,
        uploadedBy: session.user.id
    });

    // Audit Log
    await AuditLog.create({
        userId: session.user.id,
        action: "CREATE_ORDER",
        refId: newOrder._id,
        refModel: "Order",
        ipAddress: "N/A"
    });

    revalidatePath("/orders");
    revalidatePath("/dashboard");
    return { success: true, id: newOrder._id.toString() };
}

export async function getOrders(search?: string) {
    await dbConnect();
    const Order = await import("@/lib/models").then(m => m.Order);

    let query = {};
    if (search) {
        query = {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { orderNumber: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };
    }

    const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .populate('uploadedBy', 'name')
        .lean();

    return orders.map((order: Record<string, any>) => ({
        ...order,
        _id: order._id.toString(),
        uploadedBy: {
            ...order.uploadedBy,
            _id: order.uploadedBy._id.toString()
        },
        documentDate: order.documentDate ? order.documentDate.toISOString() : order.createdAt.toISOString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
    }));
}

export async function deleteOrder(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') throw new Error("Unauthorized");

    await dbConnect();
    const Order = await import("@/lib/models").then(m => m.Order);

    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    // Try deleting file
    try {
        const filePath = join(process.cwd(), 'public', order.fileUrl);
        await unlink(filePath);
    } catch (error) {
        console.error("Failed to delete file:", error);
    }

    await Order.findByIdAndDelete(id);

    // Audit Log
    const AuditLog = await import("@/lib/models").then(m => m.AuditLog);
    await AuditLog.create({
        userId: session.user.id,
        action: "DELETE_ORDER",
        ipAddress: "N/A"
    });

    revalidatePath("/orders");
    return { success: true };
}

// --- Memorandum System Actions ---

export async function createMemorandum(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const file = formData.get('file') as File;
    if (!file) throw new Error("File is required");

    // Limit file size (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) throw new Error("File size too large (max 10MB)");

    const memoNumber = formData.get('memoNumber') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Save file
    const fileUrl = await saveFile(file);

    await dbConnect();

    // Check duplicate
    const existing = await import("@/lib/models").then(m => m.Memorandum.findOne({ memoNumber }));
    if (existing) throw new Error("Duplicate Memo Number");

    const Memorandum = await import("@/lib/models").then(m => m.Memorandum);
    const AuditLog = await import("@/lib/models").then(m => m.AuditLog);

    const newMemo = await Memorandum.create({
        memoNumber,
        title,
        description,
        documentDate: formData.get('documentDate') ? new Date(formData.get('documentDate') as string) : new Date(),
        fileUrl,
        originalName: file.name,
        uploadedBy: session.user.id
    });

    // Audit Log
    await AuditLog.create({
        userId: session.user.id,
        action: "CREATE_MEMO",
        refId: newMemo._id,
        refModel: "Memorandum",
        ipAddress: "N/A"
    });

    revalidatePath("/memos");
    revalidatePath("/dashboard");
    return { success: true, id: newMemo._id.toString() };
}

export async function getMemorandums(search?: string) {
    await dbConnect();
    const Memorandum = await import("@/lib/models").then(m => m.Memorandum);

    let query = {};
    if (search) {
        query = {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { memoNumber: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        };
    }

    const memos = await Memorandum.find(query)
        .sort({ createdAt: -1 })
        .populate('uploadedBy', 'name')
        .lean();

    return memos.map((memo: Record<string, any>) => ({
        ...memo,
        _id: memo._id.toString(),
        uploadedBy: {
            ...memo.uploadedBy,
            _id: memo.uploadedBy._id.toString()
        },
        documentDate: memo.documentDate ? memo.documentDate.toISOString() : memo.createdAt.toISOString(),
        createdAt: memo.createdAt.toISOString(),
        updatedAt: memo.updatedAt.toISOString(),
    }));
}

export async function deleteMemorandum(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') throw new Error("Unauthorized");

    await dbConnect();
    const Memorandum = await import("@/lib/models").then(m => m.Memorandum);

    const memo = await Memorandum.findById(id);
    if (!memo) throw new Error("Memorandum not found");

    // Try deleting file
    try {
        const filePath = join(process.cwd(), 'public', memo.fileUrl);
        await unlink(filePath);
    } catch (error) {
        console.error("Failed to delete file:", error);
    }

    await Memorandum.findByIdAndDelete(id);

    // Audit Log
    const AuditLog = await import("@/lib/models").then(m => m.AuditLog);
    await AuditLog.create({
        userId: session.user.id,
        action: "DELETE_MEMO",
        ipAddress: "N/A"
    });

    revalidatePath("/memos");
    return { success: true };
}

// --- Letter System Actions ---

export async function createLetter(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Unauthorized");

    const file = formData.get('file') as File;
    if (!file) throw new Error("File is required");

    // Limit file size (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) throw new Error("File size too large (max 10MB)");

    const letterNumber = formData.get('letterNumber') as string;
    const title = formData.get('title') as string;
    const to = formData.get('to') as string;
    const dateStr = formData.get('date') as string;

    // Save file
    const fileUrl = await saveFile(file);

    await dbConnect();

    // Check duplicate
    const existing = await import("@/lib/models").then(m => m.Letter.findOne({ letterNumber }));
    if (existing) throw new Error("Duplicate Letter Number");

    const Letter = await import("@/lib/models").then(m => m.Letter);
    const AuditLog = await import("@/lib/models").then(m => m.AuditLog);

    const newLetter = await Letter.create({
        letterNumber,
        title,
        to,
        date: dateStr ? new Date(dateStr) : new Date(),
        fileUrl,
        sender: session.user.id
    });

    // Audit Log
    await AuditLog.create({
        userId: session.user.id,
        action: "CREATE_LETTER",
        refId: newLetter._id,
        refModel: "Letter",
        ipAddress: "N/A"
    });

    revalidatePath("/letters");
    revalidatePath("/dashboard");
    return { success: true, id: newLetter._id.toString() };
}

export async function getLetters(search?: string) {
    await dbConnect();
    const Letter = await import("@/lib/models").then(m => m.Letter);

    let query = {};
    if (search) {
        query = {
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { letterNumber: { $regex: search, $options: 'i' } },
                { to: { $regex: search, $options: 'i' } }
            ]
        };
    }

    const letters = await Letter.find(query)
        .sort({ createdAt: -1 })
        .populate('sender', 'name position')
        .lean();

    return letters.map((letter: Record<string, any>) => ({
        ...letter,
        _id: letter._id.toString(),
        sender: {
            ...letter.sender,
            _id: letter.sender._id.toString()
        },
        date: letter.date.toISOString(),
        createdAt: letter.createdAt.toISOString(),
        updatedAt: letter.updatedAt.toISOString(),
    }));
}

export async function deleteLetter(id: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') throw new Error("Unauthorized");

    await dbConnect();
    const Letter = await import("@/lib/models").then(m => m.Letter);

    const letter = await Letter.findById(id);
    if (!letter) throw new Error("Letter not found");

    // Try deleting file
    try {
        const filePath = join(process.cwd(), 'public', letter.fileUrl);
        await unlink(filePath);
    } catch (error) {
        console.error("Failed to delete file:", error);
    }

    await Letter.findByIdAndDelete(id);

    // Audit Log
    const AuditLog = await import("@/lib/models").then(m => m.AuditLog);
    await AuditLog.create({
        userId: session.user.id,
        action: "DELETE_LETTER",
        ipAddress: "N/A"
    });

    revalidatePath("/letters");
    return { success: true };
}
