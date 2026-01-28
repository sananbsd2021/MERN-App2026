
import { deepSerialize } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DocumentRecipient } from "@/lib/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default async function InboxPage() {
    const session = await getServerSession(authOptions);
    await dbConnect();

    const recipients = await DocumentRecipient.find({ userId: session?.user?.id })
        .populate({
            path: 'documentId',
            populate: { path: 'createdBy', select: 'name' }
        })
        .sort({ createdAt: -1 })
        .lean();

    // Map to plain objects to ensure serializability
    const plainRecipients = deepSerialize(recipients);

    const statusMap = {
        'PENDING': { label: 'ยังไม่ได้เปิด', color: 'bg-slate-200 text-slate-700' },
        'READ': { label: 'เปิดอ่านแล้ว', color: 'bg-blue-100 text-blue-700' },
        'RECEIVED': { label: 'รับทราบแล้ว', color: 'bg-green-100 text-green-700' }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h2 className="text-xl md:text-2xl font-bold">กล่องรับหนังสือ (Inbox)</h2>
                <p className="text-slate-500 text-sm">หนังสือราชการที่ส่งถึงคุณ</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[150px]">เลขที่หนังสือ</TableHead>
                            <TableHead>หัวข้อเรื่อง</TableHead>
                            <TableHead>ผู้ส่ง</TableHead>
                            <TableHead>วันที่ส่ง</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plainRecipients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                                    ไม่มีหนังสือในกล่องรับทราบ
                                </TableCell>
                            </TableRow>
                        ) : (
                            plainRecipients.map((rec: Record<string, any>) => (
                                <TableRow key={rec._id}>
                                    <TableCell className="font-medium">{rec.documentId.docNumber}</TableCell>
                                    <TableCell>{rec.documentId.title}</TableCell>
                                    <TableCell>{rec.documentId.createdBy?.name}</TableCell>
                                    <TableCell>
                                        {format(new Date(rec.createdAt), 'dd MMM yy HH:mm', { locale: th })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={statusMap[rec.status as keyof typeof statusMap].color}>
                                            {statusMap[rec.status as keyof typeof statusMap].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/documents/${rec.documentId._id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            เปิดดู
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
