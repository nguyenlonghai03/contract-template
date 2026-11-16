"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Guard phía client: chỉ kiểm tra có admin_api_key trong localStorage hay chưa.
// Đây chỉ là UX, bảo mật thật nằm ở middleware AdminAuth trên backend —
// nếu key sai, các lệnh gọi API admin sẽ trả 401.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const hasKey = Boolean(localStorage.getItem("admin_api_key"));

    if (!hasKey && pathname !== "/admin/login") {
      router.replace("/admin/login");
      return;
    }

    setChecked(true);
  }, [pathname, router]);

  if (!checked && pathname !== "/admin/login") {
    return null;
  }

  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
