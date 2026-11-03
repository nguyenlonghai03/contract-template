"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Copy, Check, Loader2 } from "lucide-react";
import { Contract } from "@/types/contract";
import {
  checkOrderStatus,
  generateQrCode,
  GenerateQrResponse,
} from "@/services/paymentService";
import Image from "next/image";
import SuccessDownloadModal from "./SuccessDownloadModal";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
}

export default function PaymentModal({
  isOpen,
  onClose,
  contract,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "bank">("qr");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(true);

  // Gọi API tạo mã QR thanh toán qua TanStack Query Mutation
  const {
    mutate: fetchQr,
    data: qrData,
    isPending: loading,
    reset: resetQrState,
  } = useMutation<GenerateQrResponse, Error, number>({
    mutationFn: (contractId: number) => generateQrCode(contractId),
  });

  // Cấu hình thông tin ngân hàng hiển thị
  const bankConfig = {
    bankName: qrData?.bank_name || "TPBank (Ngân hàng TMCP Tiên Phong)",
    accountNo: qrData?.account_no || "04494162701",
    accountName: qrData?.account_name || "NGUYEN LONG HAI",
  };

  const orderCode: string = qrData?.order_code || "";
  const rawPrice: number =
    qrData?.amount || (contract?.price ? Number(contract.price) : 2000);
  const formattedPrice: string = rawPrice.toLocaleString("vi-VN");

  // Xử lý sự kiện mở/đóng modal
  useEffect(() => {
    if (isOpen) {
      // Dùng queueMicrotask để tránh warning cascading render của React
      queueMicrotask(() => {
        setIsPaid(false);
      });
      if (contract?.id) {
        fetchQr(Number(contract.id));
      }
    } else {
      resetQrState();
    }
  }, [isOpen, contract, fetchQr, resetQrState]);

  // 🔄 POOLING KIỂM TRA TRẠNG THÁI THANH TOÁN (Dùng setTimeout đệ quy chuẩn xác)
  useEffect(() => {
    if (!isOpen || !orderCode || isPaid) return;

    let isCancelled = false;

    const pollStatus = async () => {
      if (isCancelled) return;

      try {
        const res = await checkOrderStatus(orderCode);

        if (res?.status === "Success" && res.success === true) {
          setIsPaid(true); // Chuyển giao diện sang màn hình tải file thành công
          isCancelled = true;
          return;
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái thanh toán:", error);
      }

      // Nếu chưa thanh toán thành công, tiếp tục gọi lại sau 3 giây
      if (!isCancelled && isOpen) {
        setTimeout(pollStatus, 3000);
      }
    };

    const timer = setTimeout(pollStatus, 3000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, orderCode, isPaid]);

  const handleCopy = (text: string, field: string): void => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Hàm xử lý tải file dựa theo định dạng (docx hoặc pdf)
  const handleDownload = async (fileType: "word" | "pdf") => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

      const downloadUrl = `${backendUrl}/contract/download?order_code=${orderCode}&type=${fileType}`;

      const response = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      let mimeType = "application/pdf";
      let fileExtension = "pdf";

      // 🟢 1. Chỉ định rõ ràng MIME type tương ứng cho từng định dạng file
      if (fileType === "word") {
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        fileExtension = "docx";
      }

      // 🟢 2. Truyền mimeType vào trong Blob để trình duyệt đóng gói đúng chuẩn
      const blob = new Blob([response.data], { type: mimeType });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      const fileName = `Hợp đồng ${contract.title}.${fileExtension}`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      // Giải phóng bộ nhớ
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Lỗi tải file:", error);
      alert("Không thể tải file. Vui lòng thử lại sau.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-0 gap-0 border-none">
        {/* Header Modal */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-4 pb-2 space-y-0">
          <DialogTitle className="text-base font-bold text-slate-800">
            {isPaid ? "Thanh toán thành công 🎉" : "Thanh toán để tải về"}
          </DialogTitle>
        </DialogHeader>

        {/* --- NẾU ĐÃ THANH TOÁN THÀNH CÔNG: GIỮ NGUYÊN SUCCESS DOWNLOAD MODAL --- */}
        {isPaid ? (
          <SuccessDownloadModal
            orderCode={orderCode}
            onDownload={handleDownload}
            onClose={onClose}
          />
        ) : (
          /* --- NẾU CHƯA THANH TOÁN: HIỂN THỊ GIAO DIỆN QR / CHUYỂN KHOẢN --- */
          <>
            {/* Tab Switcher */}
            <div className="flex border-b border-slate-200/80 px-6">
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex-1 pb-2.5 pt-1 text-sm font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "qr"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Thanh toán QR
              </button>
              <button
                onClick={() => setActiveTab("bank")}
                className={`flex-1 pb-2.5 pt-1 text-sm font-bold transition border-b-2 cursor-pointer ${
                  activeTab === "bank"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Chuyển khoản
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 overflow-y-auto space-y-1 max-h-[80vh]">
              <div className="text-center space-y-0.5">
                <div className="text-sm font-bold text-slate-700">
                  Đơn hàng {orderCode}
                </div>
                <div className="text-xl font-extrabold text-emerald-600">
                  {formattedPrice} đ
                </div>
              </div>

              {/* TAB 1: THANH TOÁN QR */}
              {activeTab === "qr" && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-center space-y-2">
                    <div className="w-70 h-70 mx-auto bg-white p-1 rounded-lg border border-slate-200 shadow-xs relative flex items-center justify-center">
                      {loading ? (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                          <span className="text-sm">Đang tạo mã QR...</span>
                        </div>
                      ) : qrData?.qr_code_url ? (
                        <Image
                          src={qrData?.qr_code_url || ""}
                          alt="VietQR SePay"
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="text-sm text-red-500">
                          Không thể tải mã QR
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-0.5">
                      <div className="text-[11px] font-semibold text-slate-500">
                        Chấp nhận các ngân hàng và ví điện tử
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Napas247 | MoMo | ZaloPay | Viettel Money
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2 text-xs text-blue-900 space-y-1">
                    <div className="font-bold text-blue-950">
                      Hướng dẫn thanh toán
                    </div>
                    <p>• Quét mã QR trên để thanh toán tự động</p>
                    <p>• Hoặc nhấn giữ để lưu, chụp mã QR để quét</p>
                    <p>
                      • Giữ nguyên nội dung chuyển khoản:{" "}
                      <strong className="text-emerald-700">{orderCode}</strong>
                    </p>
                    <div className="pt-1 font-semibold text-blue-900 block">
                      Lưu ý:{" "}
                      <span className="font-normal text-blue-800 block">
                        Hệ thống sẽ tự động xác nhận và hiển thị nút tải file
                        ngay khi thành công.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHUYỂN KHOẢN */}
              {activeTab === "bank" && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 space-y-2 text-sm">
                    <div className="text-center text-slate-500 font-medium pb-0.5">
                      Thông tin chuyển khoản
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 font-medium">
                        Ngân hàng:
                      </span>
                      <span className="font-bold text-slate-800 text-right text-xs">
                        {bankConfig.bankName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 font-medium">
                        Số tài khoản:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {bankConfig.accountNo}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(bankConfig.accountNo, "stk")
                          }
                          className="text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                        >
                          {copiedField === "stk" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 font-medium">
                        Tên tài khoản:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">
                          {bankConfig.accountName}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(bankConfig.accountName, "name")
                          }
                          className="text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                        >
                          {copiedField === "name" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80">
                      <span className="text-slate-500 font-medium">
                        Nội dung CK:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700">
                          {orderCode}
                        </span>
                        <button
                          onClick={() => handleCopy(orderCode, "content")}
                          className="text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                        >
                          {copiedField === "content" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-sm text-amber-900 space-y-1">
                    <div className="font-bold text-amber-950">
                      Hướng dẫn thanh toán
                    </div>
                    <p>
                      • Chuyển khoản đúng số tiền{" "}
                      <strong>{formattedPrice} đ</strong>
                    </p>
                    <p>
                      • Nội dung chuyển khoản:{" "}
                      <strong className="text-emerald-800">{orderCode}</strong>
                    </p>
                    <div className="pt-1 font-semibold text-amber-900 block">
                      Lưu ý:{" "}
                      <span className="font-normal text-amber-800 block mt-0.5">
                        Điền đúng cú pháp để hệ thống tự động xác nhận thành
                        công.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
