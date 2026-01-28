"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, Clock, Loader2, Save } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface DailyLog {
    _id: string;
    date: string;
    content: string;
    note: string;
}

export default function DailyLogsPage() {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        content: "",
        note: "",
        date: new Date().toISOString().split("T")[0]
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/daily-logs");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const res = await fetch("/api/daily-logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create log");

            toast({ title: "บันทึกข้อมูลเรียบร้อย" });
            setFormData({ content: "", note: "", date: new Date().toISOString().split("T")[0] });
            fetchLogs();
        } catch (error) {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" /> บันทึกงานประจำวัน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>วันที่</Label>
                                <Input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>รายละเอียดงาน</Label>
                                <Textarea
                                    required
                                    placeholder="วันนี้ทำอะไรไปบ้าง..."
                                    className="min-h-[120px]"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>หมายเหตุ (ถ้ามี)</Label>
                                <Input
                                    placeholder="..."
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                บันทึก
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" /> ประวัติการบันทึก
                </h2>
                {isLoading ? (
                    <p className="text-center text-slate-500">กำลังโหลด...</p>
                ) : logs.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg">
                        <p className="text-slate-500">ยังไม่มีบันทึกประจำวัน</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log) => (
                            <Card key={log._id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-16 text-center">
                                            <div className="text-sm font-bold text-primary">
                                                {format(new Date(log.date), "d MMM", { locale: th })}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {format(new Date(log.date), "yyyy", { locale: th })}
                                            </div>
                                        </div>
                                        <div className="flex-grow border-l pl-4 border-slate-100">
                                            <p className="text-slate-800 whitespace-pre-wrap">{log.content}</p>
                                            {log.note && (
                                                <p className="text-sm text-slate-500 mt-2 italic">หมายเหตุ: {log.note}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
