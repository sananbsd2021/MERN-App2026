"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileStack } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                toast({
                    title: "Error",
                    description: "Invalid credentials or inactive account",
                    variant: "destructive",
                });
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 w-full h-1 flex">
                <div className="h-full flex-1 bg-[#ed1c24]" />
                <div className="h-full flex-1 bg-white" />
                <div className="h-full flex-1 bg-[#241d4f]" />
                <div className="h-full flex-1 bg-white" />
                <div className="h-full flex-1 bg-[#ed1c24]" />
            </div>

            <Card className="w-full max-w-md shadow-2xl border-t-8 border-t-primary rounded-xl relative z-10">
                <CardHeader className="space-y-3 text-center pt-8">
                    <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-inner mb-2 border-4 border-white">
                        <FileStack className="text-primary h-8 w-8" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">ระบบสารบรรณอิเล็กทรอนิกส์</CardTitle>
                        <CardDescription className="font-medium text-primary">
                            องค์การบริหารส่วนตำบลออนไลน์
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 px-8 pb-8">
                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมลผู้ใช้งาน</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="border-slate-300 focus:ring-primary h-11"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <Input
                                id="password"
                                type="password"
                                className="border-slate-300 focus:ring-primary h-11"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 px-8 pb-10">
                        <Button className="w-full h-11 bg-primary hover:bg-slate-800 text-white font-bold text-lg shadow-lg" type="submit" disabled={loading}>
                            {loading ? "กำลังประมวลผล..." : "เข้าสู่ระบบ"}
                        </Button>
                        <div className="w-full h-px bg-slate-200 my-2" />
                        <p className="text-sm text-center text-gray-500">
                            ยังไม่มีบัญชีผู้ใช้งาน?{" "}
                            <Link href="/register" className="text-secondary hover:underline font-bold">
                                สมัครสมาชิกใหม่
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>

            <div className="absolute bottom-8 text-center w-full text-slate-400 text-xs">
                © 2569 ระบบสารบรรณอิเล็กทรอนิกส์ • พัฒนาเพื่อท้องถิ่นไทย
            </div>
        </div>
    );
}
