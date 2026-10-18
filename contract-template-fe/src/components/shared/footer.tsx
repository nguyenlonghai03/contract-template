"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  // Hàm cuộn lên đầu trang mượt mà
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 text-slate-700 text-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* NÚT "LÊN ĐẦU TRANG" Ở GÓC PHẢI TRÊN */}
        <div className="flex justify-end mb-6">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-800 font-semibold hover:text-emerald-600 transition group"
          >
            <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Lên đầu trang</span>
          </button>
        </div>

        {/* BỐ CỤC 4 CỘT CHÍNH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start pb-8">
          {/* CỘT 1: LOGO, GIỚI THIỆU, SOCIAL & BADGE (4 Cột) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Logo Thương Hiệu */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-emerald-600">
                {/* Icon biểu trưng logo */}
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M3 3h4v18H3V3zm7 7h4v11h-4V10zm7-4h4v15h-4V6z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-900 leading-none">
                  MẪU HỢP ĐỒNG
                </span>
                <div className="flex items-center gap-1 text-[10px] mt-1">
                  <span className="text-slate-500 uppercase tracking-tight">
                    THÀNH VIÊN CỦA
                  </span>
                  <span className="bg-rose-700 text-white font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                    LUẬT THIÊN MÃ
                  </span>
                </div>
              </div>
            </div>

            {/* Đoạn giới thiệu */}
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Mauhopdong.vn là nền tảng cung cấp mẫu hợp đồng hàng đầu Việt Nam,
              chính xác, chuẩn luật, nhanh gọn, toàn diện, mang đến giải pháp
              tìm kiếm và sử dụng hợp đồng nhanh chóng, chính xác, giúp bạn xử
              lý công việc hiệu quả hơn.
            </p>

            {/* Mạng xã hội */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-800">
                Kết nối với chúng tôi:
              </span>
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Zalo */}
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center hover:opacity-90 transition border border-sky-400"
                  title="Zalo"
                >
                  Zalo
                </a>
              </div>
            </div>

            {/* Bảng chứng nhận (Bộ công thương & DMCA) */}
            <div className="flex items-center gap-3 pt-2">
              {/* Badge Bộ Công Thương */}
              <div className="bg-sky-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-white flex items-center justify-center text-[8px] text-sky-900">
                  ✓
                </span>
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] uppercase">ĐÃ THÔNG BÁO</span>
                  <span className="text-[9px] uppercase font-extrabold">
                    BỘ CÔNG THƯƠNG
                  </span>
                </div>
              </div>

              {/* Badge DMCA Protected */}
              <div className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                <span className="text-[9px] uppercase font-black">
                  PROTECTED BY
                </span>
                <span className="bg-amber-400 text-slate-900 px-1 rounded text-[9px] font-extrabold">
                  DMCA
                </span>
              </div>
            </div>
          </div>

          {/* CỘT 2: LIÊN HỆ (3 Cột) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-slate-900 text-base">Liên hệ</h4>
            <div className="space-y-3 text-slate-600 text-xs md:text-sm">
              <div>
                <p className="text-slate-500">Số điện thoại hỗ trợ:</p>
                <a
                  href="tel:0977523155"
                  className="font-semibold text-slate-800 hover:text-emerald-600 transition"
                >
                  0977 523 155
                </a>
              </div>
              <div>
                <p className="text-slate-500">Email:</p>
                <a
                  href="mailto:info@luatthienma.com.vn"
                  className="font-semibold text-slate-800 hover:text-emerald-600 transition"
                >
                  info@luatthienma.com.vn
                </a>
              </div>
            </div>
          </div>

          {/* CỘT 3: LIÊN KẾT NHANH (2 Cột) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-900 text-base">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-slate-600">
              <li>
                <Link
                  href="/about-us"
                  className="hover:text-emerald-600 transition"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-emerald-600 transition"
                >
                  Biểu giá dịch vụ
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="hover:text-emerald-600 transition"
                >
                  Đội ngũ phát triển
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: THÔNG TIN (3 Cột) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-slate-900 text-base">Thông tin</h4>
            <ul className="space-y-2.5 text-xs md:text-sm text-slate-600">
              <li>
                <Link href="/faq" className="hover:text-emerald-600 transition">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href="/policy"
                  className="hover:text-emerald-600 transition"
                >
                  Chính sách hệ thống
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="hover:text-emerald-600 transition"
                >
                  Miễn trừ trách nhiệm
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
