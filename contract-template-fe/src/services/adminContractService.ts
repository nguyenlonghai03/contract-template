// src/services/adminContractService.ts
import type { ContractType, ContractTypeResponse } from "@/types/contract";
import { axiosClient } from "./axiosClient";

export interface AdminContract {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: "draft" | "published";
  contract_type_id: number;
  pdf_object_key: string;
  docx_object_key: string;
  preview_object_keys: string[];
}

export interface AdminContractResponse {
  success: boolean;
  message: string;
  data: AdminContract;
  // Chỉ có ở GET /admin/contracts/:id (URL proxy của ảnh preview đã sinh).
  preview_urls?: string[];
}

export interface GeneratePreviewResponse {
  success: boolean;
  message: string;
  contract_id: number;
  preview_urls: string[];
}

// createContract gửi multipart/form-data gồm thông tin hợp đồng + 2 file gốc.
export const createContract = async (formData: FormData): Promise<AdminContractResponse> => {
  return await axiosClient.post<AdminContractResponse, AdminContractResponse>(
    "/admin/contracts",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
};

export const generatePreview = async (contractId: number): Promise<GeneratePreviewResponse> => {
  return await axiosClient.post<GeneratePreviewResponse, GeneratePreviewResponse>(
    `/admin/contracts/${contractId}/generate-preview`,
  );
};

export const publishContract = async (contractId: number): Promise<AdminContractResponse> => {
  return await axiosClient.patch<AdminContractResponse, AdminContractResponse>(
    `/admin/contracts/${contractId}/publish`,
  );
};

export const getAdminContract = async (contractId: number): Promise<AdminContractResponse> => {
  return await axiosClient.get<AdminContractResponse, AdminContractResponse>(
    `/admin/contracts/${contractId}`,
  );
};

// Danh sách loại hợp đồng cho form admin (Client Component → axios, không
// dùng apiGet vốn dành cho Server Component).
export const getContractTypesForAdmin = async (): Promise<ContractType[]> => {
  const res = await axiosClient.get<ContractTypeResponse, ContractTypeResponse>("/contract-types");
  return res.data;
};
