"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { createDocument, getUsers } from "@/lib/actions";
import { Send, FileUp, Loader2, Cloud, HardDrive } from "lucide-react";

export default function CreateDocumentPage() {
    const [users, setUsers] = useState<Record<string, any>[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [storageType, setStorageType] = useState("local");
    const router = useRouter();
    const { toast } = useToast();
    const { data: session } = useSession();

    useEffect(() => {
        getUsers().then((data) => {
            // Filter out self
            setUsers(data.filter(u => u._id.toString() !== session?.user?.id));
        });
    }, [session]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedRecipients.length === 0) {
            toast({ title: "ข้อผิดพลาด", description: "กรุณาเลือกผู้รับอย่างน้อย 1 คน", variant: "destructive" });
            return;
        }

        setLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Append extra data
        formData.append('recipients', JSON.stringify(selectedRecipients));
        formData.append('storageType', storageType);

        try {
            await createDocument(formData);

            toast({ title: "สำเร็จ", description: "ส่งหนังสือเรียบร้อยแล้ว" });
            router.push("/documents/sent");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งหนังสือ";
            toast({ title: "ข้อผิดพลาด", description: errorMessage, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">สร้างและส่งหนังสือราชการ</h2>
                    <p className="text-slate-500">กรอกข้อมูลหนังสือและเลือกผู้รับให้ถูกต้อง</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">ข้อมูลหนังสือ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="docNumber">เลขที่หนังสือ</Label>
                                    <Input id="docNumber" name="docNumber" placeholder="เช่น มท 0123/456" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">หัวข้อเรื่อง</Label>
                                    <Input id="title" name="title" placeholder="ระบุหัวข้อเรื่อง" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                                    <Textarea id="description" name="description" placeholder="ระบุรายละเอียด (ถ้ามี)" className="min-h-[100px]" />
                                </div>

                                <div className="space-y-4 pt-2 border-t border-slate-100">
                                    <Label>การจัดเก็บไฟล์</Label>
                                    <RadioGroup defaultValue="local" value={storageType} onValueChange={setStorageType} className="grid grid-cols-2 gap-4">
                                        <div>
                                            <RadioGroupItem value="local" id="local" className="peer sr-only" />
                                            <Label
                                                htmlFor="local"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <HardDrive className="mb-2 h-6 w-6" />
                                                Local Server
                                            </Label>
                                        </div>
                                        <div>
                                            <RadioGroupItem value="cloudinary" id="cloudinary" className="peer sr-only" />
                                            <Label
                                                htmlFor="cloudinary"
                                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                            >
                                                <Cloud className="mb-2 h-6 w-6" />
                                                Cloud Server
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label>แนบไฟล์เอกสาร (PDF/DOC)</Label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileUp className="h-10 w-10 text-slate-400 mb-2" />
                                            <p className="text-sm text-slate-600 mb-1">คลิกเพื่อเลือกไฟล์</p>
                                            <Input
                                                id="file"
                                                name="file"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                required
                                                className="cursor-pointer max-w-xs mx-auto"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-lg">เลือกผู้รับ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                                <div className="flex items-center space-x-2 pb-2 border-b">
                                    <Checkbox
                                        id="select-all"
                                        checked={users.length > 0 && selectedRecipients.length === users.length}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedRecipients(users.map(u => u._id.toString()));
                                            else setSelectedRecipients([]);
                                        }}
                                    />
                                    <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">เลือกทั้งหมด</label>
                                </div>
                                {users.map((user) => (
                                    <div key={user._id} className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg">
                                        <Checkbox
                                            id={`user-${user._id}`}
                                            checked={selectedRecipients.includes(user._id.toString())}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedRecipients([...selectedRecipients, user._id.toString()]);
                                                else setSelectedRecipients(selectedRecipients.filter(id => id !== user._id.toString()));
                                            }}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor={`user-${user._id}`}
                                                className="text-sm font-medium leading-none cursor-pointer"
                                            >
                                                {user.name}
                                            </label>
                                            <p className="text-xs text-slate-500">{user.position}</p>
                                            <p className="text-[10px] bg-slate-100 px-1 rounded inline-block w-fit">{user.department}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => router.back()}>ยกเลิก</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        ส่งหนังสือ
                    </Button>
                </div>
            </form>
        </div>
    );
}
