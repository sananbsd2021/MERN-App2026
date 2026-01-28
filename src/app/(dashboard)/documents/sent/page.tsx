import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Document, DocumentRecipient } from "@/lib/models";
import { deepSerialize } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default async function SentDocumentsPage() {
    const session = await getServerSession(authOptions);
    await dbConnect();

    const documents = await Document.find({ createdBy: session?.user?.id })
        .sort({ createdAt: -1 })
        .lean();

    // Get recipient counts for each doc and map to plain objects
    const docsWithStats = await Promise.all(documents.map(async (doc: Record<string, any>) => {
        const recipients = await DocumentRecipient.find({ documentId: doc._id }).lean();
        const total = recipients.length;
        const received = recipients.filter((r: Record<string, any>) => r.status === 'RECEIVED').length;
        const read = recipients.filter((r: Record<string, any>) => r.status === 'READ').length;

        // Ensure doc itself is serialized first
        const serializedDoc = deepSerialize(doc);

        return {
            ...serializedDoc,
            stats: { total, received, read }
        };
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">หนังสือที่ส่งแล้ว</h2>
                    <p className="text-slate-500">ติดตามสถานะการรับทราบของผู้รับทุกคน</p>
                </div>
                <Link href="/documents/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">สร้างหนังสือใหม่</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[150px]">เลขที่หนังสือ</TableHead>
                            <TableHead>หัวข้อเรื่อง</TableHead>
                            <TableHead>วันที่ส่ง</TableHead>
                            <TableHead>สถานะการตอบรับ (รวม)</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {docsWithStats.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                                    ไม่มีประวัติการส่งหนังสือ
                                </TableCell>
                            </TableRow>
                        ) : (
                            docsWithStats.map((doc: Record<string, any>) => (
                                <TableRow key={doc._id}>
                                    <TableCell className="font-medium">{doc.docNumber}</TableCell>
                                    <TableCell>{doc.title}</TableCell>
                                    <TableCell>
                                        {format(new Date(doc.createdAt), 'dd MMM yy HH:mm', { locale: th })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">รับแล้ว {doc.stats.received}/{doc.stats.total}</span>
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{ width: `${(doc.stats.received / doc.stats.total) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/documents/${doc._id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            ดูรายละเอียด
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
