import Link from "next/link";
import ScrollToTopButton from "./ScrollToTopButton";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/85 pt-8 pb-6 text-slate-700 text-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        {/* NÚT LÊN ĐẦU TRANG */}
        <ScrollToTopButton />

        {/* BỐ CỤC 4 CỘT TRẢI ĐỀU TRÊN LƯỚI 12 CỘT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 items-start pb-5 border-b border-slate-100">
          {/* CỘT 1: LOGO & MÔ TẢ (4 Cột) - Tạo độ đầm và vững chắc bên trái */}
          <div className="lg:col-span-4 space-y-3.5 pr-2">
            <div className="flex">
              <Image
                src="/images/hop-dong-phap-ly-logo (1).png"
                alt="Hợp đồng pháp lý Logo"
                width={140}
                height={60}
                priority
                className="object-contain w-auto h-auto"
              />
            </div>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Hệ thống mẫu hợp đồng pháp lý chuẩn xác, hỗ trợ tối ưu cho cá nhân
              và doanh nghiệp.
            </p>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Liên hệ
            </h4>
            <div className="space-y-1.5 text-slate-600 text-sm">
              <p className="text-slate-500 text-xs">Hỗ trợ giải đáp:</p>
              <span className="font-medium text-slate-800 hover:text-emerald-600 transition break-all block">
                nguyenlonghai1412@gmail.com
              </span>
            </div>
          </div>

          {/* CỘT 3: KHÁM PHÁ (2 Cột) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-slate-600 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/ve-chung-toi"
                  className="hover:text-emerald-600 transition"
                >
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: PHÁP LÝ (3 Cột) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Pháp lý
            </h4>
            <ul className="space-y-2.5 text-slate-600 text-sm">
              <li>
                <Link
                  href="/chinh-sach"
                  className="hover:text-emerald-600 transition"
                >
                  Chính sách hệ thống
                </Link>
              </li>
              <li>
                <Link
                  href="/mien-tru-trach-nhiem"
                  className="hover:text-emerald-600 transition"
                >
                  Miễn trừ trách nhiệm
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* DÒNG BẢN QUYỀN GỌN GÀNG PHÍA DƯỚI (Không bị trùng lặp) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} Hợp Đồng Pháp Lý. All rights reserved.
          </p>
          <p className="text-slate-400">
            Nền tảng chia sẻ biểu mẫu hợp đồng uy tín.
          </p>
        </div>
      </div>
    </footer>
  );
}
