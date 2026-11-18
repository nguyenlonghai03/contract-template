"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  checkOrderStatus,
  generateQrCode,
  GenerateQrResponse,
  SavedOrder,
} from "@/services/paymentService";

interface UsePaymentProps {
  isOpen: boolean;
  contractId: number;
}

const POLL_INTERVAL_MS = 3000;
// Dừng polling sau 30 phút (khách bỏ dở); mở lại modal sẽ kiểm tra lại.
const POLL_MAX_DURATION_MS = 30 * 60 * 1000;

// Đơn hàng được lưu theo từng hợp đồng trong localStorage để khách đóng
// modal / tải lại trang vẫn giữ đúng đơn đã (hoặc đang) thanh toán, không bị
// sinh mã chuyển khoản mới.
const storageKey = (contractId: number) => `payment_order_${contractId}`;

function loadSavedOrder(contractId: number): SavedOrder | null {
  try {
    const raw = localStorage.getItem(storageKey(contractId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SavedOrder>;
    if (parsed.orderCode && parsed.accessToken) {
      return { orderCode: parsed.orderCode, accessToken: parsed.accessToken };
    }
  } catch {
    // localStorage bị chặn hoặc dữ liệu hỏng: coi như chưa có đơn.
  }
  return null;
}

function saveOrder(contractId: number, order: SavedOrder) {
  try {
    localStorage.setItem(storageKey(contractId), JSON.stringify(order));
  } catch {
    // Không lưu được thì vẫn thanh toán bình thường trong phiên hiện tại.
  }
}

export function usePayment({ isOpen, contractId }: UsePaymentProps) {
  const [paidOrderCode, setPaidOrderCode] = useState<string | null>(null);
  const [isPollingStopped, setIsPollingStopped] = useState(false);

  const {
    mutate: fetchQr,
    data: qrData,
    isPending: isLoading,
    error,
  } = useMutation<GenerateQrResponse, Error, number>({
    mutationFn: (id) => generateQrCode({ contractId: id, savedOrder: loadSavedOrder(id) }),
    onSuccess: (data, id) => {
      saveOrder(id, {
        orderCode: data.order_code,
        accessToken: data.access_token,
      });

      if (data.status === "Success") {
        setPaidOrderCode(data.order_code);
      }

      setIsPollingStopped(false);
    },
  });

  const orderCode = qrData?.order_code || "";
  const accessToken = qrData?.access_token || "";
  const isPaid = Boolean(orderCode) && paidOrderCode === orderCode;

  // Lấy (hoặc dùng lại) đơn hàng mỗi lần mở modal. Không reset dữ liệu khi
  // đóng: khách đã thanh toán mở lại vẫn thấy nút tải file.
  useEffect(() => {
    if (!isOpen || !contractId || isPaid) return;

    fetchQr(contractId);
  }, [isOpen, contractId, isPaid, fetchQr]);

  // Polling kiểm tra thanh toán
  useEffect(() => {
    if (!isOpen || !orderCode || !accessToken || isPaid) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();

    const scheduleNext = () => {
      if (cancelled) return;

      if (Date.now() - startedAt > POLL_MAX_DURATION_MS) {
        setIsPollingStopped(true);
        return;
      }

      timer = setTimeout(pollStatus, POLL_INTERVAL_MS);
    };

    const pollStatus = async () => {
      // Tab đang ẩn: bỏ qua lượt này, không gọi API vô ích.
      if (document.hidden) {
        scheduleNext();
        return;
      }

      try {
        const response = await checkOrderStatus({ orderCode, accessToken });

        if (cancelled) return;

        if (response?.success === true && response.status === "Success") {
          setPaidOrderCode(orderCode);
          return;
        }

        if (response?.status === "Expired") {
          setIsPollingStopped(true);
          return;
        }
      } catch (err) {
        if (cancelled) return;

        // 404: đơn không tồn tại / token sai — polling tiếp không có ý nghĩa.
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsPollingStopped(true);
          return;
        }

        console.error("Lỗi kiểm tra thanh toán:", err);
      }

      scheduleNext();
    };

    timer = setTimeout(pollStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, orderCode, accessToken, isPaid]);

  return {
    qrData,
    orderCode,
    accessToken,
    isLoading,
    isPaid,
    isPollingStopped,
    error,
  };
}
