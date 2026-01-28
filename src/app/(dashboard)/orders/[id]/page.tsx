import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { deepSerialize } from "@/lib/utils";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteOrder } from "@/lib/actions";

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    await dbConnect();
    const Order = await import("@/lib/models").then(m => m.Order);

    const order = await Order.findById(params.id).populate('uploadedBy', 'name position').lean();
    if (!order) notFound();

    const safeOrder = deepSerialize(order);
    const canDelete = session?.user?.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/orders">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">รายละเอียดคำสั่ง / ประกาศ</h2>
                    <p className="text-slate-500">{safeOrder.orderNumber}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="border-b bg-slate-50">
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                                {safeOrder.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 bg-slate-100 min-h-[600px]">
                            {/* PDF Preview */}
                            <iframe
                                src={`${safeOrder.fileUrl}#toolbar=0`}
                                className="w-full h-full min-h-[600px] border-none"
                                title="Document Preview"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>ข้อมูลทั่วไป</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-1">เลขที่คำสั่ง</h4>
                                <p className="font-medium">{safeOrder.orderNumber}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-1">วันที่ลงนาม/ประกาศ</h4>
                                <p className="font-medium">{format(new Date(safeOrder.createdAt), 'dd MMMM yyyy HH:mm', { locale: th })}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 mb-1">ผู้ลงรายการ</h4>
                                <p className="font-medium">{safeOrder.uploadedBy.name}</p>
                                <p className="text-xs text-slate-400">{safeOrder.uploadedBy.position}</p>
                            </div>
                            {safeOrder.description && (
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-500 mb-1">รายละเอียดสังเขป</h4>
                                    <p className="text-sm whitespace-pre-wrap text-slate-700">{safeOrder.description}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100 space-y-2">
                                <a href={safeOrder.fileUrl} target="_blank" download className="block">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        <Download className="mr-2 h-4 w-4" /> ดาวน์โหลดเอกสาร
                                    </Button>
                                </a>

                                {canDelete && (
                                    <form action={async () => {
                                        "use server";
                                        await deleteOrder(safeOrder._id);
                                    }}>
                                        <Button variant="destructive" className="w-full">
                                            <Trash2 className="mr-2 h-4 w-4" /> ลบคำสั่ง
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
