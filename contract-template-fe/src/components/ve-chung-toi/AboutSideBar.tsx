"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

// Danh sách các mục điều hướng ở Sidebar
const SIDEBAR_ITEMS = [
  { name: "Về chúng tôi", href: "/ve-chung-toi" },
  { name: "Chính sách hệ thống", href: "/chinh-sach" },
  { name: "Miễn trừ trách nhiệm", href: "/mien-tru-trach-nhiem" },
];

const AboutSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden sticky top-24">
      <nav className="divide-y divide-slate-100">
        {SIDEBAR_ITEMS.map((item, index) => {
          // Kiểm tra xem trang hiện tại có đang trùng khớp với đường dẫn hay không
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center justify-between px-5 py-4 text-sm font-semibold transition-all ${
                isActive
                  ? "text-blue-600 bg-blue-50/50"
                  : "text-slate-800 hover:text-blue-600 hover:bg-slate-50"
              }`}
            >
              <span>{item.name}</span>

              {/* Icon mũi tên chỉ hiển thị khi mục đó đang được active */}
              {isActive && (
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
export default AboutSidebar;
