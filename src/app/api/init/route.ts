import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function GET() {
    await dbConnect();

    const userCount = await User.countDocuments();
    if (userCount > 0) {
        return NextResponse.json({ message: "System already initialized" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("admin1234", 10);

    const admin = await User.create({
        name: "System Admin",
        email: "admin@obtor.go.th",
        passwordHash: hashedPassword,
        role: "ADMIN",
        position: "IT Manager",
        department: "Information Technology",
        isActive: true
    });

    return NextResponse.json({
        message: "Admin user created",
        user: { email: admin.email, role: admin.role, password: "admin1234 (Please change immediately)" }
    });
}
