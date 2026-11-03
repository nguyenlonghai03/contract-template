// src/lib/axiosClient.ts
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
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
