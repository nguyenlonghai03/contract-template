"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  checkOrderStatus,
  generateQrCode,
  GenerateQrResponse,
} from "@/services/paymentService";

interface UsePaymentProps {
  isOpen: boolean;
  contractId: number;
}

export function usePayment({ isOpen, contractId }: UsePaymentProps) {
  const [paidOrderCode, setPaidOrderCode] = useState<string | null>(null);

  const {
    mutate: fetchQr,
    data: qrData,
    isPending: isLoading,
    error,
    reset: resetQrState,
  } = useMutation<GenerateQrResponse, Error, number>({
    mutationFn: generateQrCode,
  });

  const orderCode = qrData?.order_code || "";

  // Tạo QR khi mở modal
  useEffect(() => {
    if (!isOpen || !contractId) return;

    fetchQr(contractId);

    return () => {
      resetQrState();
    };
  }, [isOpen, contractId, fetchQr, resetQrState]);

  // Polling kiểm tra thanh toán
  useEffect(() => {
    if (!isOpen || !orderCode || paidOrderCode === orderCode) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const pollStatus = async () => {
      try {
        const response = await checkOrderStatus(orderCode);

        if (cancelled) return;

        if (response?.status === "Success" && response.success === true) {
          setPaidOrderCode(orderCode);
          return;
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Lỗi kiểm tra thanh toán:", error);
        }
      }

      if (!cancelled) {
        timer = setTimeout(pollStatus, 3000);
      }
    };

    timer = setTimeout(pollStatus, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, orderCode, paidOrderCode]);

  // Chỉ coi là đã thanh toán khi mã đơn hiện tại được xác nhận
  const isPaid = Boolean(orderCode) && paidOrderCode === orderCode;

  return {
    qrData,
    orderCode,
    isLoading,
    isPaid,
    error,
  };
}
