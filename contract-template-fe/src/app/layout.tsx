import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hợp Đồng Pháp Lý",
  description: "Website cung cấp mẫu hợp đồng pháp lý",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <ReactQueryProvider>
        <body className="min-h-full flex flex-col font-sans">{children}</body>
      </ReactQueryProvider>
    </html>
  );
}
