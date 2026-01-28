import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password, position, department } = body;

        // Validate required fields
        if (!name || !email || !password || !position || !department) {
            return NextResponse.json(
                { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "รูปแบบอีเมลไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "อีเมลนี้ถูกใช้งานแล้ว" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            name,
            email,
            passwordHash: hashedPassword,
            position,
            department,
            role: "STAFF",
            isActive: false, // Requires admin approval
        });

        return NextResponse.json({
            success: true,
            message: "สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ",
            user: {
                id: newUser._id.toString(),
                name: newUser.name,
                email: newUser.email,
            }
        }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
            { status: 500 }
        );
    }
}
