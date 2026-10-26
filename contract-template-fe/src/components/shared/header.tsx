import Link from "next/link";
import { Mail } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20q flex items-center justify-between">
        {/* KHỐI BÊN TRÁI: Nhóm Logo + Nav Menu nằm gần nhau */}
        <div className="flex items-center gap-10 md:gap-14 ">
          {/* 1. LOGO BRAND */}
          <Link href="/" className="flex flex-row items-center justify-center ">
            <Image
              src="/images/logo-hop-dong-phap-ly.png" // Đường dẫn từ thư mục public
              alt="Hợp đồng pháp lý Logo" // Mô tả SEO và Accessibility
              width={64}
              height={64} // Chiều cao hiển thị (px)
              priority // Ưu tiên tải nhanh vì nằm ở Header đầu trang
              className="rounded-full object-cover w-auto"
            />
            <span className="hidden md:inline-block font-bold text-[#0A3A2A] text-lg tracking-wide">
              Hợp đồng pháp lý
            </span>
          </Link>

          {/* 2. NAVIGATION MENU (Lệch hẳn về bên trái gần Logo) */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-800 pl-6 border-l border-gray-300">
            <Link href="/" className="  ">
              Trang chủ
            </Link>

            <Link
              href="/ve-chung-toi"
              className="hover:text-red-700 transition"
            >
              Về chúng tôi
            </Link>
          </nav>
        </div>

        {/* 3. EMAIL SUPPORT (Tinh chỉnh gọn gàng, sang trọng, không bị thô) */}
        {/* EMAIL SUPPORT */}
        <a
          href="mailto:nguyenlonghai1412@gmail.com"
          className="flex items-center gap-2.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 px-3.5 py-2 rounded-xl transition group shadow-2xs"
        >
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg group-hover:scale-105 transition">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">
              Email hỗ trợ
            </span>
            <span className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition leading-none">
              nguyenlonghai1412@gmail.com
            </span>
          </div>
        </a>
      </div>
    </header>
  );
}
