import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DailyLog } from "@/lib/models";

export async function GET(req: NextRequest) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Can filter by user or date if needed via query params
        const logs = await DailyLog.find({ user: session.user.id })
            .sort({ date: -1 });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { date, content, note } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const newLog = await DailyLog.create({
            date: date ? new Date(date) : new Date(),
            content,
            note,
            user: session.user.id
        });

        return NextResponse.json(newLog, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create daily log" }, { status: 500 });
    }
}
