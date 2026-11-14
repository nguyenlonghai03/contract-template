import { ShieldCheck, CheckCircle, Lock, Star } from "lucide-react";
import PurchaseButton from "./PurchaseButton";
import { Contract } from "@/types/contract";

type ContractPurchaseCardProps = {
  contract: Contract;
};

function formatPrice(price: number | string) {
  const num = Number(price);

  if (!Number.isFinite(num)) return price;

  return num.toLocaleString("vi-VN");
}

export default function ContractPurchaseCard({
  contract,
}: ContractPurchaseCardProps) {
  return (
    <section className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 sm:p-6 space-y-6 sticky top-24">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full border border-emerald-100/80">
          <ShieldCheck className="w-3.5 h-3.5" />
          Đã qua kiểm duyệt
        </div>

        <h2 className="text-lg font-bold text-slate-900 leading-snug">
          {contract.title || "Mẫu hợp đồng pháp lý"}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-sm pt-1">
          {contract.rating != null && (
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-slate-700">
                {Number(contract.rating).toFixed(1)}
              </span>
            </div>
          )}

          <div className="text-slate-500">
            Đã tải:{" "}
            <strong className="text-slate-700 font-semibold">
              {Number(contract.downloads ?? 0).toLocaleString("vi-VN")}
            </strong>{" "}
            lượt
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-400 font-medium">
            Tải về toàn bộ file
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {contract.price != null
              ? `${formatPrice(contract.price)} đ`
              : "1.000 đ"}
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

      <div className="space-y-3">
        <PurchaseButton contract={contract} />

        <div className="text-center">
          <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Thanh toán an toàn qua cổng SePAY
          </span>
        </div>
      </div>

      <div className="space-y-2.5 pt-4 border-t border-slate-100 text-sm text-slate-600">
        {[
          "Sở hữu vĩnh viễn định dạng Word (.docx) và PDF.",
          "Tự do chỉnh sửa điều khoản phù hợp thực tế.",
          "Hỗ trợ tư vấn giải đáp trực tiếp từ Luật sư.",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
