import Link from "next/link";
import Image from "next/image";
import ScrollToTopButton from "./ScrollToTopButton";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/85 bg-white pt-8 pb-6 text-sm text-slate-700">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <ScrollToTopButton />

        <div className="grid grid-cols-1 gap-8 border-b border-slate-100 pb-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* LOGO & MÔ TẢ */}
          <div className="space-y-3.5 lg:col-span-4 lg:pr-2">
            <Link
              href="/"
              aria-label="Hợp Đồng Pháp Lý - Trang chủ"
              className="mb-[1rem] inline-block"
            >
              <Image
                src="/images/hop-dong-phap-ly-logo-384.webp"
                alt="Logo Hợp Đồng Pháp Lý"
                width={192}
                height={160}
                // Ảnh đã resize sẵn (384px, ~11KB) thay cho ảnh gốc 480KB
                unoptimized
                className="h-auto w-[192px] object-contain"
                sizes="192px"
              />
            </Link>

            <p className="leading-relaxed text-slate-500">
              Hệ thống mẫu hợp đồng pháp lý chuẩn xác, hỗ trợ tối ưu cho cá nhân
              và doanh nghiệp.
            </p>
          </div>

          {/* LIÊN HỆ */}
          <div className="space-y-3 lg:col-span-3">
            <h2 className="font-bold uppercase tracking-wider text-slate-900">
              Liên hệ
            </h2>

            <div className="space-y-1.5 text-slate-600">
              <p className="text-slate-500">Hỗ trợ giải đáp:</p>

              <a
                href="mailto:nguyenlonghai1412@gmail.com"
                className="font-medium text-slate-800 transition hover:text-emerald-600 break-words"
              >
                nguyenlonghai1412@gmail.com
              </a>
            </div>
          </div>

          {/* KHÁM PHÁ */}
          <div className="space-y-3 lg:col-span-2">
            <h2 className="font-bold uppercase tracking-wider text-slate-900">
              Khám phá
            </h2>

            <ul className="space-y-2.5 text-slate-600">
              <li>
                <Link href="/" className="transition hover:text-emerald-600">
                  Trang chủ
                </Link>
              </li>

              <li>
                <Link
                  href="/ve-chung-toi"
                  className="transition hover:text-emerald-600"
                >
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* PHÁP LÝ */}
          <div className="space-y-3 lg:col-span-3">
            <h2 className="font-bold uppercase tracking-wider text-slate-900">
              Pháp lý
            </h2>

            <ul className="space-y-2.5 text-slate-600">
              <li>
                <Link
                  href="/chinh-sach"
                  className="transition hover:text-emerald-600"
                >
                  Chính sách hệ thống
                </Link>
              </li>

              <li>
                <Link
                  href="/mien-tru-trach-nhiem"
                  className="transition hover:text-emerald-600"
                >
                  Miễn trừ trách nhiệm
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-center text-slate-400 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} Hợp Đồng Pháp Lý. All rights reserved.
          </p>

          <p>Nền tảng chia sẻ biểu mẫu hợp đồng uy tín.</p>
        </div>
      </div>
    </footer>
  );
}
