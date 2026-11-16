import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import NavLink from "./NavLink";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-18 flex items-center justify-between">
        {/* BRAND */}
        <div className="flex items-center gap-3 lg:gap-10 min-w-0">
          <Link
            href="/"
            title="Hợp đồng pháp lý - Trang chủ"
            aria-label="Hợp đồng pháp lý - Trang chủ"
            className="flex items-center shrink-0"
          >
            <Image
              src="/images/logo-hop-dong-phap-ly-128.webp"
              alt="Logo Hợp đồng pháp lý"
              width={64}
              height={64}
              // Ảnh đã resize sẵn (128px, ~2KB) thay cho PNG gốc 1.1MB
              unoptimized
              preload
              className="rounded-full object-cover w-12 h-12 sm:w-16 sm:h-16"
            />

            <span className="hidden sm:inline-block font-bold text-[#0A3A2A] text-base lg:text-lg tracking-wide ml-2">
              Hợp đồng pháp lý
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden md:flex items-center gap-4 lg:gap-8 font-medium text-slate-800 pl-4 lg:pl-6 border-l border-gray-300"
          >
            <NavLink href="/" exact>
              Trang chủ
            </NavLink>

            <NavLink href="/ve-chung-toi">Về chúng tôi</NavLink>
          </nav>
        </div>

        {/* CONTACT + MOBILE MENU */}
        <div className="flex items-center gap-2">
          <a
            href="mailto:nguyenlonghai1412@gmail.com"
            aria-label="Liên hệ hỗ trợ qua email"
            className="flex items-center gap-2 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 px-2 sm:px-3.5 py-2 rounded-xl transition group shrink-0"
          >
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg group-hover:scale-105 transition">
              <Mail className="w-3.5 h-3.5" />
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none mb-1">
                Email hỗ trợ
              </span>

              <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition leading-none">
                nguyenlonghai1412@gmail.com
              </span>
            </div>
          </a>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
