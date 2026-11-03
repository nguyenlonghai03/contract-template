"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`transition ${
        isActive
          ? "font-bold text-emerald-600"
          : "hover:text-emerald-600 text-slate-800"
      }`}
    >
      {children}
    </Link>
  );
}
