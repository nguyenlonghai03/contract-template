"use client";

import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessDownloadModalProps {
  orderCode: string;
  onDownload: (fileType: "word" | "pdf") => void;
  onClose: () => void;
}

export default function SuccessDownloadModal({
  orderCode,
  onDownload,
}: SuccessDownloadModalProps) {
  return (
    <div className="p-6 text-center space-y-6 animate-fadeIn">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <h4 className="text-lg font-bold text-slate-900">
          Giao dịch hoàn tất!
        </h4>
        <p className="text-xs text-slate-500">
          Đơn hàng{" "}
          <span className="font-semibold text-slate-700">{orderCode}</span> đã
          được xác nhận thanh toán thành công. Bạn có thể tải mẫu hợp đồng bên
          dưới:
        </p>
      </div>

      {/* 2 nút download Word và PDF sử dụng shadcn Button */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          onClick={() => onDownload("word")}
          className="flex items-center justify-center gap-2 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Tải Word (.docx)
        </Button>

        <Button
          onClick={() => onDownload("pdf")}
          className="flex items-center justify-center gap-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Tải PDF (.pdf)
        </Button>
      </div>
    </div>
  );
}
