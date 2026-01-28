"use client"

import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { updateRecipientStatus } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface AcknowledgeButtonProps {
    recipientId: string;
    className?: string;
}

export default function AcknowledgeButton({ recipientId, className }: AcknowledgeButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleAcknowledge = async () => {
        setLoading(true);
        try {
            await updateRecipientStatus(recipientId, "RECEIVED");
            toast({
                title: "สำเร็จ",
                description: "ยืนยันการรับทราบเรียบร้อยแล้ว",
            });
            setOpen(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "ไม่สามารถทำรายการได้";
            toast({
                title: "เกิดข้อผิดพลาด",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={className || "bg-green-600 hover:bg-green-700"}>
                    <CheckCircle className="mr-2 h-4 w-4" /> ยืนยันรับทราบ
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ยืนยันการรับทราบหนังสือ</DialogTitle>
                    <DialogDescription>
                        คุณต้องการยืนยันว่าได้รับทราบเนื้อหาของหนังสือฉบับนี้แล้วใช่หรือไม่?
                        เมื่อยืนยันแล้ว สถานะจะเปลี่ยนเป็น &quot;รับทราบแล้ว&quot; และไม่สามารถแก้ไขได้
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleAcknowledge}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        ยืนยัน
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
