import { ContractResponse } from "@/types/contract";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_API_BASE_URL || "http://localhost:8080",
});

// Sử dụng Response Interceptor để tự động trả về response.data luôn
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
);

export const getContractTypes = async () => {
  const response = await api.get("/contract-types");
  return response.data;
};

export async function getContracts(
  page: number = 1,
  limit: number = 5,
  searchQuery: string = "",
): Promise<ContractResponse> {
  const res = await fetch(
    `http://localhost:8080/contracts?page=${page}&limit=${limit}&keyword=${searchQuery}`,
  );
  if (!res.ok) {
    throw new Error("Không thể tải danh sách hợp đồng");
  }
  return res.json();
}
