import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "e-Saraban System - องค์กรปกครองส่วนท้องถิ่น",
  description: "ระบบสารบรรณอิเล็กทรอนิกส์ สำหรับองค์กรปกครองส่วนท้องถิ่น",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
