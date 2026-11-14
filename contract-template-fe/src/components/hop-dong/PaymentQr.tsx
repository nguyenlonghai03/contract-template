import Image from "next/image";
import { Loader2 } from "lucide-react";

interface PaymentQrProps {
  qrCodeUrl?: string;
  orderCode: string;
  isLoading: boolean;
}

export default function PaymentQr({
  qrCodeUrl,
  orderCode,
  isLoading,
}: PaymentQrProps) {
  return (
    <div className="space-y-3">
      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-center space-y-3">
        <div
          className="
    relative
    aspect-square
    w-full
    max-w-[280px]
    mx-auto
    bg-white
    p-2
    rounded-lg
    border
    border-slate-200
    shadow-sm
  "
        >
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
              <span className="text-sm">Đang tạo mã QR...</span>
            </div>
          ) : qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="Mã QR thanh toán VietQR"
              fill
              sizes="(max-width: 640px) 80vw, 280px"
              className="object-contain p-1"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500">
              Không thể tải mã QR
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">
            Chấp nhận các ngân hàng và ví điện tử
          </p>

          <p className="text-[11px] text-slate-400">
            Napas247 | MoMo | ZaloPay | Viettel Money
          </p>
        </div>
      </div>

      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-sm text-blue-900 space-y-2">
        <h3 className="font-bold text-blue-950">Hướng dẫn thanh toán</h3>

        <p>• Quét mã QR để thanh toán tự động.</p>
        <p>• Có thể lưu mã QR để quét bằng thiết bị khác.</p>

        <p className="break-words">
          • Giữ nguyên nội dung chuyển khoản:{" "}
          <strong className="text-emerald-700">{orderCode || "..."}</strong>
        </p>

        <p className="pt-1">
          <strong>Lưu ý:</strong> Hệ thống tự động xác nhận và hiển thị nút tải
          file khi thanh toán thành công.
        </p>
      </div>
    </div>
  );
}
