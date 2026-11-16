import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://hopdongphaply.vn"),

  title: {
    default: "Hợp đồng pháp lý",
    template: "%s | Hợp đồng pháp lý",
  },

  description:
    "Tổng hợp các mẫu hợp đồng, biểu mẫu pháp lý và tài liệu tham khảo. Tải xuống và sử dụng dễ dàng.",

  applicationName: "Hợp đồng pháp lý",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Hợp đồng pháp lý",
    title: "Hợp đồng pháp lý | Kho biểu mẫu hợp đồng",
    description: "Tổng hợp các mẫu hợp đồng và biểu mẫu pháp lý.",
    url: "https://hopdongphaply.vn",
  },
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
      <body className="min-h-full flex flex-col font-sans">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
