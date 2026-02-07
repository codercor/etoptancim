import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toptancim.com - Toptan Dijital Teknoloji",
  description: "Mobil aksesuar ve elektronik toptan satış platformu. Bayi girişi yaparak toptan fiyatları görebilir ve sipariş verebilirsiniz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen bg-slate-950 font-sans antialiased text-slate-50`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
