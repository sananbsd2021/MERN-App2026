"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createMemorandum } from "@/lib/actions";
import { Loader2, FileUp, Save } from "lucide-react";

export default function CreateMemorandumPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            await createMemorandum(formData);
            toast({ title: "สำเร็จ", description: "บันทึกข้อมูลเรียบร้อยแล้ว" });
            router.push("/memos");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล";
            toast({ title: "ข้อผิดพลาด", description: errorMessage, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold">เพิ่มบันทึกข้อความใหม่</h2>
                <p className="text-slate-500">กรอกข้อมูลและแนบไฟล์บันทึกข้อความ</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>ข้อมูลบันทึกข้อความ</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="memoNumber">เลขที่บันทึก</Label>
                            <Input id="memoNumber" name="memoNumber" placeholder="เช่น บก 01/2567" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">เรื่อง</Label>
                            <Input id="title" name="title" placeholder="ระบุชื่อเรื่อง" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">รายละเอียดสังเขป</Label>
                            <Textarea id="description" name="description" placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="documentDate">วันที่บันทึก</Label>
                            <Input
                                id="documentDate"
                                name="documentDate"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">แนบไฟล์ (PDF/DOCX)</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <FileUp className="h-10 w-10 text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600 mb-1">คลิกเพื่อเลือกไฟล์</p>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        required
                                        className="cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button variant="outline" type="button" onClick={() => router.back()}>ยกเลิก</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                บันทึกข้อมูล
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
