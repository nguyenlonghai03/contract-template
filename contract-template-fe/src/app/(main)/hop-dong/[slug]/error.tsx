"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ContractDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-slate-50 min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div
        role="alert"
        className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-sm"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-lg font-bold text-slate-900 mb-2">
          Không thể tải mẫu hợp đồng
        </h1>

        <p className="text-sm text-slate-500 mb-6">
          Kết nối tới máy chủ đang gián đoạn. Vui lòng thử lại sau giây lát.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
          >
            Thử lại
          </button>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
