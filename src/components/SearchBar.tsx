"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useDebounce } from "use-debounce";

export default function SearchBar({ placeholder = "ค้นหา...", defaultValue = "" }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [text, setText] = useState(defaultValue || searchParams.get("q") || "");
    const [query] = useDebounce(text, 500);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }
        router.push(`?${params.toString()}`);
    }, [query, router, searchParams]);

    return (
        <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-10"
            />
            {text && (
                <button
                    onClick={() => setText("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
