// src/services/paymentService.ts
import type { OrderStatus, PaymentStatusResponse } from "@/types/contract";
import { axiosClient } from "./axiosClient";

export interface GenerateQrRequest {
  contract_id: number;
  // Đơn đã lưu ở trình duyệt từ lần trước (tuỳ chọn): backend dùng lại nếu
  // access_token hợp lệ, không phụ thuộc cookie cross-site.
  order_code?: string;
  access_token?: string;
}

export interface GenerateQrResponse {
  success: boolean;
  message: string;
  amount: number;
  order_code: string;
  // Bắt buộc khi kiểm tra trạng thái / tải file. Mã đơn nằm trong nội dung
  // chuyển khoản nên không đủ để chứng minh quyền sở hữu đơn.
  access_token: string;
  contract_id: number;
  status: OrderStatus;
  qr_code_url: string;
  bank_name: string;
  account_no: string;
  account_name: string;
}

export interface SavedOrder {
  orderCode: string;
  accessToken: string;
}

export const generateQrCode = async ({
  contractId,
  savedOrder,
}: {
  contractId: number;
  savedOrder?: SavedOrder | null;
}): Promise<GenerateQrResponse> => {
  return await axiosClient.post<GenerateQrResponse, GenerateQrResponse, GenerateQrRequest>(
    "/payment/generate-qr",
    {
      contract_id: contractId,
      ...(savedOrder
        ? {
            order_code: savedOrder.orderCode,
            access_token: savedOrder.accessToken,
          }
        : {}),
    },
    { withCredentials: true },
  );
};

export const checkOrderStatus = async ({
  orderCode,
  accessToken,
}: SavedOrder): Promise<PaymentStatusResponse> => {
  return await axiosClient.get<PaymentStatusResponse, PaymentStatusResponse>("/orders/status", {
    params: { order_code: orderCode, access_token: accessToken },
  });
};
