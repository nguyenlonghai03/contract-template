"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ShieldCheck, Scale } from "lucide-react";

const navigationItems = [
  {
    label: "Về chúng tôi",
    shortLabel: "Về chúng tôi",
    href: "/ve-chung-toi",
    icon: Building2,
  },
  {
    label: "Chính sách hệ thống",
    shortLabel: "Chính sách",
    href: "/chinh-sach",
    icon: ShieldCheck,
  },
  {
    label: "Miễn trừ trách nhiệm",
    shortLabel: "Miễn trừ",
    href: "/mien-tru-trach-nhiem",
    icon: Scale,
  },
];

export default function LegalNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Thông tin pháp lý">
      <div className="lg:overflow-hidden lg:rounded-xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-sm">
        <ul
          className="
            mx-auto flex w-fit max-w-full items-center gap-1
            rounded-full border border-slate-200/90 bg-white/90 p-1
            shadow-md backdrop-blur-md
            sm:gap-1.5 sm:p-1.5
            lg:mx-0 lg:w-full lg:flex-col lg:items-stretch lg:gap-1
            lg:rounded-none lg:border-0 lg:bg-transparent lg:p-2
            lg:shadow-none lg:backdrop-blur-none
          "
        >
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    relative flex items-center whitespace-nowrap
                    rounded-full px-3.5 py-2
                    text-[13px] font-medium
                    transition-all duration-200 motion-reduce:transition-none
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-emerald-600 focus-visible:ring-offset-1
                    sm:px-4 sm:text-sm
                    lg:gap-3 lg:rounded-lg lg:px-3.5 lg:py-3.5 lg:font-semibold
                    ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-sm lg:bg-emerald-50 lg:text-emerald-800 lg:shadow-none"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hover:bg-slate-50"
                    }
                  `}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-3 left-0 top-3 hidden w-[3px] rounded-r-full bg-emerald-700 lg:block"
                    />
                  )}

                  <Icon
                    aria-hidden="true"
                    size={19}
                    strokeWidth={1.8}
                    className={`hidden shrink-0 lg:block ${
                      isActive ? "text-emerald-700" : "text-slate-400"
                    }`}
                  />

                  <span className="sm:hidden lg:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
