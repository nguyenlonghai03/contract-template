"use client";

import { useState } from "react";
import { ShieldCheck, Download, CheckCircle, Lock, Star } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { Contract } from "@/types/contract";

type ContractPurchaseCardProps = {
  contract: Contract;
};

export default function ContractPurchaseCard({
  contract,
}: ContractPurchaseCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const formatPrice = (price: number | string) => {
    const num = typeof price === "number" ? price : Number(price);
    if (isNaN(num)) return price;
    return num.toLocaleString("vi-VN");
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 space-y-6 sticky top-24">
        {/* Tiêu đề hợp đồng & Badge kiểm duyệt */}
        <div className="space-y-3  border-slate-100">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-100/80">
            <ShieldCheck className="w-3.5 h-3.5" /> Đã qua kiểm duyệt
          </div>

          <h2 className="text-lg font-bold text-slate-900 leading-snug">
            {contract?.title || "Mẫu hợp đồng pháp lý"}
          </h2>

          {/* Gom Rating & Lượt tải chung 1 dòng gọn gàng, tinh tế */}
          <div className="flex items-center gap-4 text-sm pt-1">
            {/* Rating */}
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-slate-700 ">
                {contract?.rating ? Number(contract.rating).toFixed(1) : "5.0"}
              </span>
            </div>

            {/* Lượt tải màu trầm */}
            <div className="text-slate-500 text-sm sm:text-sm">
              Đã tải:{" "}
              <strong className="text-slate-700 font-semibold">
                {contract?.downloads
                  ? Number(contract.downloads).toLocaleString("vi-VN")
                  : "0"}
              </strong>{" "}
              lượt
            </div>
          </div>
        </div>

        {/* Phần hiển thị Giá tiền */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400 font-medium">
              Tải về toàn bộ file
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {contract?.price ? `${formatPrice(contract.price)} đ` : "1.000 đ"}
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[11px] text-slate-600 font-medium block">
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
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2 tracking-wide cursor-pointer"
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
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sở hữu vĩnh viễn định dạng Word (.docx) và PDF.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tự do chỉnh sửa điều khoản phù hợp thực tế.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hỗ trợ tư vấn giải đáp trực tiếp từ Luật sư.</span>
          </div>
        </div>
      </div>

      {/* COMPONENT MODAL POPUP THANH TOÁN */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        contract={contract}
      />
    </>
  );
}
