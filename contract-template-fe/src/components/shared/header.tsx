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
              width={80}
              height={100} // Chiều cao hiển thị (px)
              priority // Ưu tiên tải nhanh vì nằm ở Header đầu trang
              className="rounded-full object-cover"
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

        {/* 3. HOTLINE / EMAIL SUPPORT (Nằm độc lập ở phía bên phải) */}
        <div className="flex items-center gap-3 border-2 border-emerald-500 text-emerald-600 px-4 py-2 rounded-2xl shadow-sm">
          <div className="bg-emerald-500 text-white p-2 rounded-full">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-slate-500 font-medium leading-none mb-1">
              Email hỗ trợ
            </span>
            <span className="text-base font-extrabold text-emerald-600 leading-none">
              nguyenlonghai1412@gmail.com
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
