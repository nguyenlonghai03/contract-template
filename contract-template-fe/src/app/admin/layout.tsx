import type { Metadata } from "next";

import AdminGuard from "@/components/admin/AdminGuard";

// Khu vực admin không được index (robots.ts cũng disallow /admin).
export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
