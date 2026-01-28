"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Send,
    Inbox,
    Users,
    History,
    LogOut,
    FileText,
    FileStack,
    BookOpen,
    Menu,
    X,
    Share2
} from "lucide-react";

const menuItems = [
    { name: "แดชบอร์ด", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SARABAN", "EXECUTIVE", "STAFF"] },
    { name: "รับหนังสือ (Inbox)", href: "/inbox", icon: Inbox, roles: ["ADMIN", "SARABAN", "EXECUTIVE", "STAFF"] },
    { name: "ส่งหนังสือภายใน", href: "/documents/sent", icon: Share2, roles: ["ADMIN", "SARABAN"] },
    { name: "ทะเบียนหนังสือส่ง", href: "/letters", icon: Send, roles: ["ADMIN", "SARABAN"] },
    { name: "คำสั่ง / ประกาศ", href: "/orders", icon: FileStack, roles: ["ADMIN", "SARABAN", "EXECUTIVE", "STAFF"] },
    { name: "บันทึกข้อความ", href: "/memos", icon: BookOpen, roles: ["ADMIN", "SARABAN", "EXECUTIVE", "STAFF"] },
    { name: "บันทึกประจำวัน", href: "/daily-logs", icon: History, roles: ["ADMIN", "SARABAN", "STAFF"] },
    { name: "จัดการผู้ใช้งาน", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: FileText, roles: ["ADMIN"] },
];

export function SidebarContent({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = session?.user?.role;

    const filteredMenu = menuItems.filter(item => item.roles.includes(userRole as string));

    return (
        <div className="flex flex-col h-full bg-primary text-white">
            <div className="p-6 border-b border-primary-foreground/10 bg-black/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shadow-lg">
                        <FileStack className="text-primary h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">e-Saraban</h1>
                        <p className="text-[10px] text-secondary font-medium uppercase tracking-widest">Digital Govt</p>
                    </div>
                </div>
                <p className="text-xs text-slate-300">อบต. ออนไลน์ ยุคใหม่</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {filteredMenu.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                            pathname === item.href
                                ? "bg-secondary text-primary shadow-md transform scale-[1.02]"
                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <item.icon className={cn(
                            "mr-3 h-5 w-5 transition-colors",
                            pathname === item.href ? "text-primary" : "text-slate-400 group-hover:text-secondary"
                        )} />
                        {item.name}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-primary-foreground/10 bg-black/10">
                <div className="px-4 py-3 mb-2 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm font-semibold truncate text-white">{session?.user?.name}</p>
                    <p className="text-[10px] text-secondary font-medium uppercase truncate">{session?.user?.position}</p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-300 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors group"
                >
                    <LogOut className="mr-3 h-5 w-5 text-slate-500 group-hover:text-red-400" />
                    ออกจากระบบ
                </button>
            </div>
        </div>
    );
}

export default function Sidebar() {
    return (
        <div className="flex flex-col h-screen w-64 bg-primary text-white shadow-2xl border-r border-primary-foreground/10">
            <SidebarContent />
        </div>
    );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-primary text-white">
            <button
                onClick={onMenuClick}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
                <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                    <FileStack className="text-primary h-5 w-5" />
                </div>
                <span className="font-bold">e-Saraban</span>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
        </div>
    );
}
