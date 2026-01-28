import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DocumentRecipient, Document } from "@/lib/models";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Inbox, Send, Clock, FileStack, BookOpen, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { DashboardCharts } from "@/components/DashboardCharts";

export default async function DashboardPage() {

    const session = await getServerSession(authOptions);
    await dbConnect();

    const userId = session?.user?.id;

    // Stats
    const inboxCount = await DocumentRecipient.countDocuments({ userId, status: 'PENDING' });
    const sentCount = await Document.countDocuments({ createdBy: userId });

    const Order = await import("@/lib/models").then(m => m.Order);
    const Memorandum = await import("@/lib/models").then(m => m.Memorandum);
    const orderCount = await Order.countDocuments({});
    const memoCount = await Memorandum.countDocuments({});

    const stats = [
        { name: "หนังสือเข้าใหม่", value: inboxCount, icon: Inbox, color: "text-primary", bg: "bg-primary/10" },
        { name: "หนังสือส่ง (Letter)", value: sentCount, icon: Send, color: "text-secondary", bg: "bg-secondary/10" },
        { name: "คำสั่ง / ประกาศ", value: orderCount, icon: FileStack, color: "text-amber-600", bg: "bg-amber-100" },
        { name: "บันทึกข้อความ", value: memoCount, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-100" },
    ];

    const chartData = [
        { name: "หนังสือเข้า", value: inboxCount },
        { name: "หนังสือส่ง", value: sentCount },
        { name: "คำสั่ง", value: orderCount },
        { name: "บันทึกข้อความ", value: memoCount },
    ];

    // Recent Activity
    const AuditLog = await import("@/lib/models").then(m => m.AuditLog);
    const recentLogs = await AuditLog.find({
        $or: [
            { userId },
            { action: { $in: ['CREATE_ORDER', 'CREATE_MEMO'] } }
        ]
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name role')
        .populate('documentId', 'title docNumber')
        .lean();

    const actionText: Record<string, string> = {
        'SEND': 'ส่งหนังสือ',
        'RECEIVE': 'รับหนังสือ',
        'READ': 'เปิดอ่านหนังสือ',
        'LOGIN': 'เข้าสู่ระบบ',
        'LOGOUT': 'ออกจากระบบ',
        'CREATE_ORDER': 'ลงรายการคำสั่งใหม่',
        'DELETE_ORDER': 'ลบคำสั่ง',
        'CREATE_MEMO': 'ลงรายการบันทึกข้อความใหม่',
        'DELETE_MEMO': 'ลบบันทึกข้อความ',
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="bg-gradient-to-r from-primary to-slate-800 p-4 md:p-8 rounded-xl md:rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-2">สวัสดีคุณ {session?.user?.name}</h2>
                    <p className="text-slate-300 text-sm md:text-base max-w-md">ยินดีต้อนรับเข้าสู่ระบบ e-Saraban วันนี้คุณมีหนังสือใหม่ {inboxCount} ฉบับ</p>
                </div>
                <div className="absolute right-[-20px] top-[-20px] opacity-10 hidden md:block">
                    <FileStack size={200} />
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="shadow-md border-none bg-white hover:bg-slate-50 transition-colors cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {stat.name}
                            </CardTitle>
                            <div className={`${stat.bg} p-2.5 rounded-xl`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <DashboardCharts data={chartData} />


            <Card className="col-span-4 border-none shadow-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-6 bg-secondary rounded-full" />
                        ความเคลื่อนไหวล่าสุด
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {recentLogs.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="font-medium">ยังไม่มีข้อมูลความเคลื่อนไหวในขณะนี้</p>
                            <p className="text-xs">รายการรับ-ส่งหนังสือของคุณจะปรากฏที่นี่</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {recentLogs.map((log: { _id: { toString: () => string }; action: string; userId?: { name?: string }; createdAt: Date; refId?: string; refModel?: string }) => (
                                <div key={log._id.toString()} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                            {log.action.includes('ORDER') ? <FileStack className="h-5 w-5" /> :
                                                log.action.includes('MEMO') ? <BookOpen className="h-5 w-5" /> :
                                                    <FileText className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">
                                                {log.userId?.name} <span className="font-normal text-slate-500">{actionText[log.action] || log.action}</span>
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: th })}
                                            </p>
                                        </div>
                                    </div>
                                    {log.refId && (
                                        <Link
                                            href={log.refModel === 'Order' ? `/orders/${log.refId}` : log.refModel === 'Memorandum' ? `/memos/${log.refId}` : `/documents/${log.refId}`}
                                            className="text-xs font-medium text-primary hover:underline"
                                        >
                                            ดูรายละเอียด
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
