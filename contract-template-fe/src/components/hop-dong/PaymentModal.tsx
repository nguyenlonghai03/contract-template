"use client";

import { useState } from "react";
import { Contract } from "@/types/contract";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import SuccessDownloadModal from "./SuccessDownloadModal";
import { usePayment } from "@/hooks/usePayment";
import { downloadContract } from "@/services/contractApi";
import PaymentTabs from "./PaymentTabs";
import PaymentQr from "./PaymentQr";
import BankTransfer from "./BankTransfer";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
}

type PaymentTab = "qr" | "bank";

export default function PaymentModal({
  isOpen,
  onClose,
  contract,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<PaymentTab>("qr");

  const { qrData, orderCode, isLoading, isPaid, error } = usePayment({
    isOpen,
    contractId: Number(contract.id),
  });

  // Thông tin ngân hàng
  const bankConfig = {
    bankName: qrData?.bank_name || "TPBank (Ngân hàng TMCP Tiên Phong)",

    accountNo: qrData?.account_no || "04494162701",

    accountName: qrData?.account_name || "NGUYEN LONG HAI",
  };

  // Giá thanh toán
  const rawPrice =
    qrData?.amount ?? (contract.price ? Number(contract.price) : 2000);

  const formattedPrice = Number(rawPrice).toLocaleString("vi-VN");

  // Tải file
  const handleDownload = async (fileType: "word" | "pdf") => {
    try {
      await downloadContract(orderCode, contract, fileType);
    } catch (error) {
      console.error("Lỗi tải file:", error);
      alert("Không thể tải file. Vui lòng thử lại sau.");
    }
  };

  // Reset tab khi đóng modal
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setActiveTab("qr");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
        fixed
        left-1/2
        top-1/2
        -translate-x-1/2
        -translate-y-1/2

        w-[calc(100%-1rem)]
        sm:w-[calc(100%-2rem)]
        max-w-md

        max-h-[90vh]
        max-h-[90dvh]

        flex
        flex-col
        gap-0

        overflow-hidden
        p-0

        rounded-2xl
        border-none
        bg-white
        shadow-2xl
      "
      >
        {/* Header */}
        <DialogHeader
          className="
          shrink-0
          px-4
          sm:px-6
          py-4
          border-b
          border-slate-100
        "
        >
          <DialogTitle
            className="
            min-w-0
            text-base
            font-bold
            leading-6
            text-slate-800
            break-words
          "
          >
            {isPaid ? "Thanh toán thành công 🎉" : "Thanh toán để tải về"}
          </DialogTitle>
        </DialogHeader>

        {isPaid ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <SuccessDownloadModal
              orderCode={orderCode}
              onDownload={handleDownload}
            />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="shrink-0">
              <PaymentTabs activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Body */}
            <div
              className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              p-3
              sm:p-4
              space-y-3
            "
            >
              {/* Order information */}
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-700 break-all">
                  Đơn hàng {orderCode || "Đang tạo..."}
                </p>

                <p className="text-xl font-extrabold text-emerald-600">
                  {formattedPrice} đ
                </p>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="
                  rounded-xl
                  bg-red-50
                  border
                  border-red-200
                  p-4
                  text-sm
                  text-red-600
                  text-center
                "
                >
                  Không thể tạo mã thanh toán. Vui lòng đóng và thử lại.
                </div>
              ) : (
                <>
                  {activeTab === "qr" && (
                    <PaymentQr
                      qrCodeUrl={qrData?.qr_code_url}
                      orderCode={orderCode}
                      isLoading={isLoading}
                    />
                  )}

                  {activeTab === "bank" && (
                    <BankTransfer
                      bankName={bankConfig.bankName}
                      accountNo={bankConfig.accountNo}
                      accountName={bankConfig.accountName}
                      orderCode={orderCode}
                      formattedPrice={formattedPrice}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
