import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { AuditLog } from "@/lib/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

const actionMap = {
    'SEND': 'ส่งหนังสือ',
    'RECEIVE': 'รับหนังสือ',
    'READ': 'เปิดอ่านหนังสือ',
    'LOGIN': 'เข้าสู่ระบบ',
    'LOGOUT': 'ออกจากระบบ',
    'CREATE_ORDER': 'สร้างคำสั่ง/ประกาศ',
    'DELETE_ORDER': 'ลบคำสั่ง/ประกาศ',
    'CREATE_MEMO': 'สร้างบันทึกข้อความ',
    'DELETE_MEMO': 'ลบบันทึกข้อความ',
};

export default async function AdminAuditLogsPage() {
    await getServerSession(authOptions);
    await dbConnect();

    const logs = await AuditLog.find({})
        .populate('userId', 'name role')
        .populate('documentId', 'docNumber')
        .populate('refId', 'docNumber orderNumber memoNumber')
        .sort({ createdAt: -1 })
        .limit(100);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Audit Logs</h2>
                <p className="text-slate-500">ตรวจสอบความเคลื่อนไหวทั้งหมดในระบบ</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>ลำดับ</TableHead>
                            <TableHead>วัน-เวลา</TableHead>
                            <TableHead>ผู้ใช้งาน</TableHead>
                            <TableHead>การกระทำ</TableHead>
                            <TableHead>เอกสารอ้างอิง</TableHead>
                            <TableHead>IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                                    ไม่มีประวัติการทำรายการ
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log: Record<string, any>, index: number) => (
                                <TableRow key={log._id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: th })}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{log.userId?.name}</p>
                                            <p className="text-[10px] text-slate-500">{log.userId?.role}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-[10px] font-semibold",
                                            log.action === "LOGIN" ? "bg-green-100 text-green-700" :
                                                log.action === "SEND" ? "bg-blue-100 text-blue-700" :
                                                    log.action.includes("DELETE") ? "bg-red-100 text-red-700" :
                                                        "bg-slate-100 text-slate-700"
                                        )}>
                                            {actionMap[log.action as keyof typeof actionMap] || log.action}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {log.refId?.docNumber || log.refId?.orderNumber || log.refId?.memoNumber || log.documentId?.docNumber || '-'}
                                    </TableCell>
                                    <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
