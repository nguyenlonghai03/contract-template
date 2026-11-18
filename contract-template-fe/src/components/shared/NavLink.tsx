"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
  exact = false,
  activePaths = [],
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  // Các đường dẫn khác cũng làm link này active (vd nhóm trang thông tin pháp lý).
  activePaths?: string[];
}) {
  const pathname = usePathname();
  const matches = (path: string) => (exact ? pathname === path : pathname.startsWith(path));
  const isActive = matches(href) || activePaths.some(matches);

  return (
    <Link
      href={href}
      className={`transition ${
        isActive ? "font-bold text-emerald-600" : "hover:text-emerald-600 text-slate-800"
      }`}
    >
      {children}
    </Link>
  );
}
