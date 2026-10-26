"use client";

import { useState } from "react";
import { ShieldCheck, Download, CheckCircle, Lock } from "lucide-react";
import PaymentModal from "./PaymentModal";

interface ContractPurchaseCardProps {
  slug?: string;
}

export default function ContractPurchaseCard({
  slug,
}: ContractPurchaseCardProps) {
  // State quản lý đóng/mở Popup thanh toán
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 space-y-6 sticky top-24">
        {/* Tiêu đề hợp đồng & Lượt tải */}
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" /> Đã qua kiểm duyệt
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            Biên bản thanh lý hợp đồng chuyển nhượng salon tóc
          </h2>
          <div className="flex items-center justify-between text-sm text-slate-500 pt-1">
            <span>
              Mã tài liệu: <strong>BBTL-50</strong>
            </span>
            <span className="text-emerald-600 font-semibold">
              Đã tải: 1,420 lượt
            </span>
          </div>
        </div>

        {/* Phần hiển thị Giá tiền */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Tải về toàn bộ file</div>
            <div className="text-2xl font-black text-emerald-600">55.000 đ</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">
              Bao gồm File Word, PDF
            </span>
            <span className="text-[11px] text-slate-500 block">
              Hướng dẫn chi tiết
            </span>
          </div>
        </div>

        {/* Nút bấm TẢI NGAY mở Popup Modal */}
        <div className="space-y-3">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2 tracking-wide"
          >
            <Download className="w-5 h-5" />
            <span>TẢI NGAY</span>
          </button>

          <div className="text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> Thanh toán an toàn qua
              cổng SePAY
            </span>
          </div>
        </div>

        {/* Danh sách cam kết khi mua */}
        <div className="space-y-2.5 pt-4 border-t border-slate-100 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sở hữu vĩnh viễn định dạng Word (.docx) và PDF.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tự do chỉnh sửa điều khoản phù hợp thực tế.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hỗ trợ tư vấn giải đáp trực tiếp từ Luật sư.</span>
          </div>
        </div>
      </div>

      {/* COMPONENT MODAL POPUP THANH TOÁN */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </>
  );
}
