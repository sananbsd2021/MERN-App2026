import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLetters, deleteLetter } from "@/lib/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import Link from "next/link";
import { Plus, FileText, Send, CalendarIcon, Trash2 } from "lucide-react";
import { deepSerialize } from "@/lib/utils";

export default async function LettersPage() {
    const session = await getServerSession(authOptions);
    const letters = await getLetters();
    const safeLetters = deepSerialize(letters);

    const canCreate = session?.user?.role === 'ADMIN' || session?.user?.role === 'SARABAN';
    const canDelete = session?.user?.role === 'ADMIN';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">ทะเบียนหนังสือส่ง</h1>
                    <p className="text-slate-500">จัดการรายการหนังสือส่งออกทั้งหมด</p>
                </div>
                {canCreate && (
                    <Link href="/letters/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> ลงทะเบียนหนังสือส่ง
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {safeLetters.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                            <Send className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">ยังไม่มีหนังสือส่ง</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-4">เริ่มต้นด้วยการลงทะเบียนหนังสือส่งฉบับแรกของคุณ</p>
                        {canCreate && (
                            <Link href="/letters/new">
                                <Button variant="outline">ลงทะเบียนหนังสือส่ง</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    safeLetters.map((letter: Record<string, any>) => (
                        <Card key={letter._id} className="hover:shadow-md transition-shadow relative">
                            {canDelete && (
                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                    <form action={async () => {
                                        "use server";
                                        await deleteLetter(letter._id);
                                    }}>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            )}
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-semibold line-clamp-1 pr-6">
                                    {letter.letterNumber}
                                </CardTitle>
                                <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Send className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="font-medium mb-2 line-clamp-2 h-12">{letter.title}</h3>
                                <div className="text-sm text-slate-500 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>{format(new Date(letter.date), "d MMM yyyy", { locale: th })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-700">ถึง:</span>
                                        <span className="truncate">{letter.to}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                    <span className="text-xs text-slate-400">ผู้ส่ง: {letter.sender?.name}</span>
                                    <a
                                        href={letter.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <FileText className="h-3 w-3" /> เปิดไฟล์
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
