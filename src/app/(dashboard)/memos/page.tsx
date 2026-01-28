import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMemorandums, deleteMemorandum } from "@/lib/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { Plus, Download, Trash2 } from "lucide-react";
import { deepSerialize } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";

export default async function MemorandumsPage({ searchParams }: { searchParams: { q?: string } }) {
    const session = await getServerSession(authOptions);
    const memos = await getMemorandums(searchParams.q);
    const safeMemos = deepSerialize(memos);

    const canCreate = session?.user?.role === 'ADMIN' || session?.user?.role === 'SARABAN';
    const canDelete = session?.user?.role === 'ADMIN';

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">บันทึกข้อความ</h2>
                    <p className="text-slate-500 text-sm">รายการบันทึกข้อความทั้งหมด</p>
                </div>
                <div className="flex items-center gap-3">
                    <SearchBar placeholder="ค้นหาเลขที่หรือชื่อเรื่อง..." />
                    {canCreate && (
                        <Link href="/memos/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                                <Plus className="mr-2 h-4 w-4" /> เพิ่มบันทึกข้อความ
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[150px]">เลขที่บันทึก</TableHead>
                            <TableHead>เรื่อง</TableHead>
                            <TableHead>วันที่บันทึก</TableHead>
                            <TableHead>ผู้บันทึก</TableHead>
                            <TableHead className="text-right">ดาวน์โหลด</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {safeMemos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                                    ไม่มีรายการบันทึกข้อความ
                                </TableCell>
                            </TableRow>
                        ) : (
                            safeMemos.map((memo: Record<string, any>) => (
                                <TableRow key={memo._id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/memos/${memo._id}`} className="text-blue-600 hover:underline">
                                            {memo.memoNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/memos/${memo._id}`} className="hover:text-blue-600 block">
                                            <div className="font-medium">{memo.title}</div>
                                            {memo.description && <div className="text-xs text-slate-500 truncate max-w-[300px]">{memo.description}</div>}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(memo.documentDate), 'dd MMM yyyy', { locale: th })}
                                    </TableCell>
                                    <TableCell>{memo.uploadedBy.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <a href={memo.fileUrl} target="_blank" download>
                                                <Button variant="outline" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </a>
                                            {canDelete && (
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteMemorandum(memo._id);
                                                }}>
                                                    <Button variant="destructive" size="sm" type="submit">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
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
