"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createLetter } from "@/lib/actions";

export default function NewLetterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            await createLetter(formData);

            toast({
                title: "สำเร็จ",
                description: "ลงทะเบียนหนังสือส่งเรียบร้อยแล้ว",
            });
            router.push("/letters");
        } catch (error) {
            console.error(error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ChevronLeft className="mr-2 h-4 w-4" /> ย้อนกลับ
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>ลงทะเบียนหนังสือส่งใหม่</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="letterNumber">เลขที่หนังสือ</Label>
                                <Input
                                    id="letterNumber"
                                    name="letterNumber"
                                    required
                                    placeholder="เช่น ศธ 1234/5678"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">ลงวันที่</Label>
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                    defaultValue={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="to">เรียน (ถึงใคร)</Label>
                            <Input
                                id="to"
                                name="to"
                                required
                                placeholder="ระบุผู้รับ"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">เรื่อง</Label>
                            <Input
                                id="title"
                                name="title"
                                required
                                placeholder="ระบุชื่อเรื่อง"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">ไฟล์เอกสารแนบ (PDF)</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors text-center cursor-pointer relative">
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    required
                                    accept=".pdf"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-slate-400" />
                                    <span className="text-sm text-slate-500 font-medium">
                                        {fileName ? fileName : "คลิกเพื่อเลือกไฟล์ Or Drag & Drop"}
                                    </span>
                                    {!fileName && <span className="text-xs text-slate-400">รองรับไฟล์ PDF ขนาดไม่เกิน 10MB</span>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            บันทึกข้อมูล
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
