"use client";

import { useState } from "react";
import { X, Copy, Check, QrCode, Building2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderInfo?: {
    orderId: string;
    amount: string;
    accountNo: string;
    accountName: string;
    bankName: string;
    transferContent: string;
  };
}

export default function PaymentModal({
  isOpen,
  onClose,
  orderInfo = {
    orderId: "MYL16855",
    amount: "55.000",
    accountNo: "SEPMHD80888",
    accountName: "Nguyen Van Hung",
    bankName: "OCB (NH TMCP Phương Đông)",
    transferContent: "TTMHDMYL16855",
  },
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "bank">("qr");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Overlay click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-base font-bold text-slate-800">
            Thanh toán để tải về
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200/80 px-6">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 pb-3 text-sm font-bold transition border-b-2 ${
              activeTab === "qr"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Thanh toán QR
          </button>
          <button
            onClick={() => setActiveTab("bank")}
            className={`flex-1 pb-3 text-sm font-bold transition border-b-2 ${
              activeTab === "bank"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Chuyển khoản
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Thông tin đơn hàng chung */}
          <div className="text-center space-y-1">
            <div className="text-xs text-slate-500">
              Đơn hàng {orderInfo.orderId}
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">
              {orderInfo.amount} đ
            </div>
          </div>

          {/* TAB 1: THANH TOÁN QR */}
          {activeTab === "qr" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-center space-y-3">
                {/* Khung chứa mã VietQR */}
                <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                  <QrCode className="w-44 h-44 text-slate-900" />
                </div>

                {/* Chấp nhận ví điện tử / ngân hàng */}
                <div className="pt-1 text-center space-y-1">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Chấp nhận các ngân hàng và ví điện tử
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Napas247 | MoMo | ZaloPay | Viettel Money
                  </div>
                </div>
              </div>

              {/* Hướng dẫn màu xanh */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
                <div className="font-bold text-blue-950 pb-0.5">
                  Hướng dẫn thanh toán
                </div>
                <p>• Quét mã QR trên để thanh toán</p>
                <p>• Hoặc nhấn giữ để lưu, chụp mã QR để quét</p>
                <p>• Giữ nguyên nội dung chuyển khoản</p>
                <div className="pt-1 font-semibold text-blue-900">
                  Lưu ý:{" "}
                  <span className="font-normal text-blue-800">
                    Hệ thống sẽ tự động xác nhận và trả file văn bản ngay khi
                    bạn thanh toán thành công
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHUYỂN KHOẢN */}
          {activeTab === "bank" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-3 text-xs">
                <div className="text-center text-slate-500 font-medium text-[11px] pb-1">
                  Thông tin chuyển khoản
                </div>

                {/* Ngân hàng */}
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 font-medium">Ngân hàng:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {orderInfo.bankName}
                  </span>
                </div>

                {/* Số tài khoản */}
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 font-medium">
                    Số tài khoản:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">
                      {orderInfo.accountNo}
                    </span>
                    <button
                      onClick={() => handleCopy(orderInfo.accountNo, "stk")}
                      className="text-slate-400 hover:text-emerald-600 transition"
                      title="Sao chép STK"
                    >
                      {copiedField === "stk" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tên tài khoản */}
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 font-medium">
                    Tên tài khoản:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {orderInfo.accountName}
                    </span>
                    <button
                      onClick={() => handleCopy(orderInfo.accountName, "name")}
                      className="text-slate-400 hover:text-emerald-600 transition"
                      title="Sao chép tên"
                    >
                      {copiedField === "name" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nội dung CK */}
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 font-medium">
                    Nội dung CK:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-700 font-mono">
                      {orderInfo.transferContent}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(orderInfo.transferContent, "content")
                      }
                      className="text-slate-400 hover:text-emerald-600 transition"
                      title="Sao chép nội dung"
                    >
                      {copiedField === "content" ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Hướng dẫn màu vàng */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold text-amber-950 pb-0.5">
                  Hướng dẫn thanh toán
                </div>
                <p>
                  • Chuyển khoản đúng số tiền{" "}
                  <strong>{orderInfo.amount} đ</strong>
                </p>
                <p>
                  • Nội dung chuyển khoản:{" "}
                  <strong className="font-mono text-emerald-800">
                    {orderInfo.transferContent}
                  </strong>
                </p>
                <div className="pt-1 font-semibold text-amber-900">
                  Lưu ý:{" "}
                  <span className="font-normal text-amber-800">
                    Vui lòng điền đúng thông tin thanh toán. Hệ thống sẽ tự động
                    xác nhận và trả file văn bản ngay khi bạn thanh toán thành
                    công
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
