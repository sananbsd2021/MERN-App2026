"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        position: "",
        department: "",
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "ข้อผิดพลาด",
                description: "รหัสผ่านไม่ตรงกัน",
                variant: "destructive",
            });
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            toast({
                title: "ข้อผิดพลาด",
                description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    position: formData.position,
                    department: formData.department,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast({
                    title: "ข้อผิดพลาด",
                    description: data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "สำเร็จ",
                    description: data.message,
                });
                router.push("/login");
            }
        } catch {
            toast({
                title: "ข้อผิดพลาด",
                description: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 py-8">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-green-600">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">สมัครสมาชิก</CardTitle>
                    <CardDescription>
                        สร้างบัญชีเพื่อใช้งานระบบ e-Saraban
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="สมชาย ใจดี"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">รหัสผ่าน</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="ยืนยันรหัสผ่าน"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position">ตำแหน่ง</Label>
                            <Input
                                id="position"
                                name="position"
                                type="text"
                                placeholder="เจ้าหน้าที่ธุรการ"
                                required
                                value={formData.position}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">หน่วยงาน/กอง</Label>
                            <Input
                                id="department"
                                name="department"
                                type="text"
                                placeholder="สำนักปลัด"
                                required
                                value={formData.department}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                        </Button>
                        <p className="text-sm text-center text-gray-600">
                            มีบัญชีแล้ว?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
