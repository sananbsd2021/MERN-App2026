"use client";

import { useState } from "react";
import Sidebar, { MobileHeader, SidebarContent } from "@/components/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar - hidden on mobile, visible on desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar using Sheet */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-64 border-r-0">
                    <SidebarContent onClose={() => setSidebarOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

                {/* Top Thai Flag Bar */}
                <div className="h-1 w-full flex">
                    <div className="h-full flex-1 bg-[#ed1c24]" />
                    <div className="h-full flex-1 bg-white" />
                    <div className="h-full flex-1 bg-[#241d4f]" />
                    <div className="h-full flex-1 bg-white" />
                    <div className="h-full flex-1 bg-[#ed1c24]" />
                </div>

                <header className="hidden lg:flex bg-white border-b border-slate-200 px-4 md:px-8 py-4 items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xs">
                            อบต
                        </div>
                        <h2 className="text-sm font-bold text-slate-700 hidden sm:block">องค์การบริหารส่วนตำบลออนไลน์ (ระบบสารบรรณ)</h2>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f8fafc]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
