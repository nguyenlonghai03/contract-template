// src/lib/axiosClient.ts
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: gắn header admin key nếu có trong localStorage
// (dùng cho các API /admin/*, no-op với các API public).
axiosClient.interceptors.request.use((config) => {
  const adminKey =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_api_key")
      : null;

  if (adminKey) {
    config.headers["X-Admin-Api-Key"] = adminKey;
  }

  return config;
});

// Response Interceptor để tự động trả về response.data luôn,
// giúp các hàm gọi API ở dưới không phải gọi rườm rà res.data nữa
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Có thể xử lý lỗi chung ở đây (ví dụ: log lỗi, xử lý 401, 500...)
    return Promise.reject(error);
  },
);
