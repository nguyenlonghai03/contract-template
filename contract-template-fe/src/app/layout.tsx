import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
