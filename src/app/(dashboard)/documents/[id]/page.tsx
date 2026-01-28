
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Document, DocumentRecipient, AuditLog } from "@/lib/models";
import { deepSerialize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateRecipientStatus } from "@/lib/actions";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { FileText, User, Eye } from "lucide-react";
import { notFound } from "next/navigation";
import AcknowledgeButton from "@/components/AcknowledgeButton";

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    await dbConnect();

    const doc = await Document.findById(params.id).populate('createdBy', 'name position').lean();
    if (!doc) notFound();

    const recipients = await DocumentRecipient.find({ documentId: doc._id }).populate('userId', 'name position department').lean();
    const userRecipient = recipients.find((r: Record<string, any>) => r.userId._id.toString() === session?.user?.id);
    const auditLogs = await AuditLog.find({ documentId: doc._id }).populate('userId', 'name').sort({ createdAt: -1 }).lean();

    // Map to plain values to ensure serializability
    const plainDoc = deepSerialize(doc);
    const plainRecipients = deepSerialize(recipients);
    const plainAuditLogs = deepSerialize(auditLogs);

    const statusMap = {
        'PENDING': { label: 'ยังไม่ได้เปิด', color: 'bg-slate-200 text-slate-700' },
        'READ': { label: 'เปิดอ่านแล้ว', color: 'bg-blue-100 text-blue-700' },
        'RECEIVED': { label: 'รับทราบแล้ว', color: 'bg-green-100 text-green-700' }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                            {plainDoc.docNumber}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold">{plainDoc.title}</h2>
                    <p className="text-slate-500">สร้างโดย {plainDoc.createdBy?.name} เมื่อ {format(new Date(plainDoc.createdAt), 'dd MMMM yyyy HH:mm', { locale: th })}</p>
                </div>

                {userRecipient && userRecipient.status !== 'RECEIVED' && (
                    <div className="flex gap-2">
                        {userRecipient.status === 'PENDING' && (
                            <form action={async () => {
                                "use server";
                                await updateRecipientStatus(userRecipient._id.toString(), 'READ');
                            }}>
                                <Button variant="outline" type="submit" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                    <Eye className="mr-2 h-4 w-4" /> ทำเครื่องหมายว่าอ่านแล้ว
                                </Button>
                            </form>
                        )}
                        <AcknowledgeButton recipientId={userRecipient._id.toString()} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-blue-600" /> เนื้อหาเอกสาร
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="bg-slate-100 rounded-lg overflow-hidden min-h-[600px] border border-slate-200">
                                <iframe
                                    src={`${plainDoc.fileUrl}#toolbar=0`}
                                    className="w-full h-[600px] border-none"
                                    title="Document Preview"
                                />
                            </div>
                            {plainDoc.description && (
                                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <h4 className="font-semibold text-sm mb-2">บันทึกข้อความ / รายละเอียด</h4>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{plainDoc.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Tabs defaultValue="recipients">
                        <TabsList className="w-full">
                            <TabsTrigger value="recipients" className="flex-1">ผู้รับ ({plainRecipients.length})</TabsTrigger>
                            <TabsTrigger value="logs" className="flex-1">ประวัติ</TabsTrigger>
                        </TabsList>
                        <TabsContent value="recipients">
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    {plainRecipients.map((rec: Record<string, any>) => (
                                        <div key={rec._id} className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-slate-50">
                                            <div className="flex gap-3">
                                                <div className="bg-slate-100 p-2 rounded-full">
                                                    <User className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{rec.userId.name}</p>
                                                    <p className="text-[10px] text-slate-500">{rec.userId.position}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className={`text-[10px] ${statusMap[rec.status as keyof typeof statusMap].color}`}>
                                                {statusMap[rec.status as keyof typeof statusMap].label}
                                            </Badge>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="logs">
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    {plainAuditLogs.length === 0 ? (
                                        <p className="text-center py-4 text-slate-400 text-sm">ไม่มีประวัติ</p>
                                    ) : (
                                        plainAuditLogs.map((log: Record<string, any>) => (
                                            <div key={log._id} className="flex gap-3 text-xs">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                    <div className="w-0.5 h-full bg-slate-200" />
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium text-slate-900">
                                                        {log.userId.name} - {log.action}
                                                    </p>
                                                    <p className="text-slate-500">
                                                        {format(new Date(log.createdAt), 'dd MMM yy HH:mm', { locale: th })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
