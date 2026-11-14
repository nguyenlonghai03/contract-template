import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface BankTransferProps {
  bankName: string;
  accountNo: string;
  accountName: string;
  orderCode: string;
  formattedPrice: string;
}

export default function BankTransfer({
  bankName,
  accountNo,
  accountName,
  orderCode,
  formattedPrice,
}: BankTransferProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 2000);
    } catch {
      alert("Không thể sao chép. Vui lòng thử lại.");
    }
  };

  const renderCopyButton = (value: string, field: string) => (
    <button
      type="button"
      onClick={() => handleCopy(value, field)}
      aria-label={`Sao chép ${field}`}
      className="shrink-0 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-4 h-4 text-emerald-600" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2 text-sm">
        <h3 className="text-center text-slate-500 font-medium pb-1">
          Thông tin chuyển khoản
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-white p-3 rounded-lg border border-slate-200/80">
          <span className="text-slate-500 font-medium shrink-0">
            Ngân hàng:
          </span>

          <span className="font-bold text-slate-800 text-left sm:text-right min-w-0 sm:max-w-[65%] break-words [overflow-wrap:anywhere]">
            {bankName}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200/80">
          <span className="text-slate-500 font-medium shrink-0">
            Số tài khoản:
          </span>

          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold text-slate-900 break-all">
              {accountNo}
            </span>

            {renderCopyButton(accountNo, "số tài khoản")}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200/80">
          <span className="text-slate-500 font-medium shrink-0">
            Tên tài khoản:
          </span>

          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold text-slate-900 text-right break-words">
              {accountName}
            </span>

            {renderCopyButton(accountName, "tên tài khoản")}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200/80">
          <span className="text-slate-500 font-medium shrink-0">
            Nội dung CK:
          </span>

          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bold text-emerald-700 break-all text-right">
              {orderCode || "..."}
            </span>

            {renderCopyButton(orderCode, "nội dung chuyển khoản")}
          </div>
        </div>
      </div>

      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-sm text-amber-900 space-y-2">
        <h3 className="font-bold text-amber-950">Hướng dẫn thanh toán</h3>

        <p>
          • Chuyển khoản đúng số tiền <strong>{formattedPrice} đ</strong>.
        </p>

        <p className="break-words">
          • Nội dung chuyển khoản:{" "}
          <strong className="text-emerald-800">{orderCode || "..."}</strong>
        </p>

        <p>
          <strong>Lưu ý:</strong> Điền chính xác nội dung để hệ thống tự động
          xác nhận thanh toán.
        </p>
      </div>
    </div>
  );
}
