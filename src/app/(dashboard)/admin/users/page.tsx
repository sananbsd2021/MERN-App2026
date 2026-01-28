import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings2 } from "lucide-react";

export default async function AdminUsersPage() {
    await getServerSession(authOptions);
    await dbConnect();

    const users = await User.find({}).sort({ role: 1, name: 1 });

    const roleColors = {
        'ADMIN': 'bg-red-100 text-red-700',
        'SARABAN': 'bg-blue-100 text-blue-700',
        'EXECUTIVE': 'bg-purple-100 text-purple-700',
        'STAFF': 'bg-slate-100 text-slate-700'
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">จัดการผู้ใช้งาน</h2>
                    <p className="text-slate-500">เพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้งานในระบบ</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" /> เพิ่มผู้ใช้ใหม่
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>ชื่อ-นามสกุล</TableHead>
                            <TableHead>ตำแหน่ง</TableHead>
                            <TableHead>สังกัด/กอง</TableHead>
                            <TableHead>บทบาท</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((u: Record<string, any>) => (
                            <TableRow key={u._id}>
                                <TableCell className="font-medium">{u.name}</TableCell>
                                <TableCell>{u.position}</TableCell>
                                <TableCell>{u.department}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={roleColors[u.role as keyof typeof roleColors]}>
                                        {u.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {u.isActive ? (
                                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">ปกติ</Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">ระงับ</Badge>
                                    )
                                    }
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        <Settings2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
