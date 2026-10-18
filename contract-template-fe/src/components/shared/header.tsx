import Link from "next/link";
import { Mail, BarChart2 } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* KHỐI BÊN TRÁI: Nhóm Logo + Nav Menu nằm gần nhau */}
        <div className="flex items-center gap-10 md:gap-14">
          {/* 1. LOGO BRAND */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-emerald-600 flex items-center justify-center">
              <BarChart2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xl md:text-2xl font-black text-red-700 tracking-tight uppercase">
                Mẫu Hợp Đồng
              </span>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <span>THÀNH VIÊN CỦA</span>
                <span className="bg-red-700 text-white px-1 py-0.5 rounded text-[9px] font-bold">
                  LUẬT THƯƠNG THƯƠNG
                </span>
              </div>
            </div>
          </Link>

          {/* 2. NAVIGATION MENU (Lệch hẳn về bên trái gần Logo) */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-800">
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
              ThuongThuong@gmail.com
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
