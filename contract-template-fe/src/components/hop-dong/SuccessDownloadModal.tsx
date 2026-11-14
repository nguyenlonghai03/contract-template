"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessDownloadModalProps {
  orderCode: string;
  onDownload: (fileType: "word" | "pdf") => void;
}

export default function SuccessDownloadModal({
  orderCode,
  onDownload,
}: SuccessDownloadModalProps) {
  return (
    <div className="w-full p-4 sm:p-6 text-center space-y-5 sm:space-y-6 animate-fadeIn">
      {/* Success Icon */}
      <div
        className="w-16 h-16 bg-emerald-100 text-emerald-600
          rounded-full flex items-center justify-center
          mx-auto shadow-inner"
        aria-hidden="true"
      >
        <CheckCircle2 className="w-10 h-10" />
      </div>

      {/* Success Message */}
      <div role="status" aria-live="polite" className="space-y-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Giao dịch hoàn tất!
        </h2>

        <p className="text-sm text-slate-500 leading-relaxed">
          Đơn hàng{" "}
          <span className="inline-block font-semibold text-slate-700 break-all">
            {orderCode}
          </span>{" "}
          đã được xác nhận thanh toán thành công. Bạn có thể tải mẫu hợp đồng
          bên dưới:
        </p>
      </div>

      {/* Download Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <Button
          type="button"
          onClick={() => onDownload("word")}
          className="w-full min-h-11 h-auto py-3 px-3
            flex items-center justify-center gap-2
            bg-blue-600 hover:bg-blue-700
            text-white rounded-xl font-semibold text-sm
            shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Tải Word (.docx)</span>
        </Button>

        <Button
          type="button"
          onClick={() => onDownload("pdf")}
          className="w-full min-h-11 h-auto py-3 px-3
            flex items-center justify-center gap-2
            bg-emerald-600 hover:bg-emerald-700
            text-white rounded-xl font-semibold text-sm
            shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Tải PDF (.pdf)</span>
        </Button>
      </div>
    </div>
  );
}
