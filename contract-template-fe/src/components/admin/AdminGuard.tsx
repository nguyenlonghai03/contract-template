"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ADMIN_KEY_CHANGE_EVENT, clearAdminKey, hasAdminKey } from "@/services/axiosClient";

const LOGIN_PATH = "/admin/login";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(ADMIN_KEY_CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ADMIN_KEY_CHANGE_EVENT, onChange);
  };
}

// Server không biết localStorage: null = "chưa xác định", không render gì.
const getServerSnapshot = () => null;

// Guard phía client: chỉ kiểm tra có admin key trong localStorage hay chưa.
// Đây chỉ là UX, bảo mật thật nằm ở middleware AdminAuth trên backend —
// key sai thì API admin trả 401 và axiosClient tự đăng xuất.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hasKey = useSyncExternalStore(subscribe, hasAdminKey, getServerSnapshot);

  const isLoginPage = pathname === LOGIN_PATH;

  useEffect(() => {
    if (hasKey === false && !isLoginPage) {
      router.replace(LOGIN_PATH);
    }
  }, [hasKey, isLoginPage, router]);

  if (!isLoginPage && !hasKey) {
    return null;
  }

  const handleLogout = () => {
    clearAdminKey();
    router.replace(LOGIN_PATH);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {!isLoginPage && (
        <div className="flex justify-end px-4 pt-4">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
