import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrders, deleteOrder } from "@/lib/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { Plus, Download, Trash2 } from "lucide-react";
import { deepSerialize } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string } }) {
    const session = await getServerSession(authOptions);
    const orders = await getOrders(searchParams.q);
    const safeOrders = deepSerialize(orders);

    const canCreate = session?.user?.role === 'ADMIN' || session?.user?.role === 'SARABAN';
    const canDelete = session?.user?.role === 'ADMIN';

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">คำสั่ง / ประกาศ</h2>
                    <p className="text-slate-500 text-sm">รายการคำสั่งและประกาศทั้งหมด</p>
                </div>
                <div className="flex items-center gap-3">
                    <SearchBar placeholder="ค้นหาเลขที่หรือชื่อเรื่อง..." />
                    {canCreate && (
                        <Link href="/orders/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                                <Plus className="mr-2 h-4 w-4" /> เพิ่มคำสั่งใหม่
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[150px]">เลขที่คำสั่ง</TableHead>
                            <TableHead>เรื่อง</TableHead>
                            <TableHead>วันที่ลงนาม/ประกาศ</TableHead>
                            <TableHead>ผู้ลงรายการ</TableHead>
                            <TableHead className="text-right">ดาวน์โหลด</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {safeOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                                    ไม่มีรายการคำสั่ง
                                </TableCell>
                            </TableRow>
                        ) : (
                            safeOrders.map((order: Record<string, any>) => (
                                <TableRow key={order._id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/orders/${order._id}`} className="text-blue-600 hover:underline">
                                            {order.orderNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/orders/${order._id}`} className="hover:text-blue-600 block">
                                            <div className="font-medium">{order.title}</div>
                                            {order.description && <div className="text-xs text-slate-500 truncate max-w-[300px]">{order.description}</div>}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.documentDate), 'dd MMM yyyy', { locale: th })}
                                    </TableCell>
                                    <TableCell>{order.uploadedBy.name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <a href={order.fileUrl} target="_blank" download>
                                                <Button variant="outline" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </a>
                                            {canDelete && (
                                                <form action={async () => {
                                                    "use server";
                                                    await deleteOrder(order._id);
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
