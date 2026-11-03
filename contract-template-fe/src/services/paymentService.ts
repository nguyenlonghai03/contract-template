// src/services/paymentService.ts
import { PaymentStatusResponse } from "@/types/contract";
import { axiosClient } from "./axiosClient";

export interface GenerateQrRequest {
  contract_id: number;
}

export interface GenerateQrResponse {
  success: boolean;
  message: string;
  amount: number;
  order_code: string;
  qr_code_url: string;
  bank_name: string;
  account_no: string;
  account_name: string;
}

export const generateQrCode = async (
  contractId: number,
): Promise<GenerateQrResponse> => {
  return await axiosClient.post<
    GenerateQrResponse,
    GenerateQrResponse,
    GenerateQrRequest
  >("/payment/generate-qr", { contract_id: contractId });
};

export const checkOrderStatus = async (orderCode: string) => {
  const res = (await axiosClient.get(
    `/orders/status?order_code=${orderCode}`,
  )) as PaymentStatusResponse;
  return res;
};
