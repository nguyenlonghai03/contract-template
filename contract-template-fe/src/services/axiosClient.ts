// src/services/axiosClient.ts
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

export const ADMIN_KEY_STORAGE = "admin_api_key";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function isAdminRequest(url: string | undefined): boolean {
  return Boolean(url && /^\/?admin(\/|$)/.test(url));
}

// Event nội bộ để AdminGuard cập nhật ngay trong cùng tab (sự kiện "storage"
// của trình duyệt chỉ bắn sang các tab khác).
export const ADMIN_KEY_CHANGE_EVENT = "admin-key-change";

export function hasAdminKey(): boolean {
  try {
    return Boolean(localStorage.getItem(ADMIN_KEY_STORAGE));
  } catch {
    return false;
  }
}

export function setAdminKey(key: string) {
  localStorage.setItem(ADMIN_KEY_STORAGE, key);
  window.dispatchEvent(new Event(ADMIN_KEY_CHANGE_EVENT));
}

export function clearAdminKey() {
  try {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    // localStorage bị chặn: không có gì để xoá.
  }
  window.dispatchEvent(new Event(ADMIN_KEY_CHANGE_EVENT));
}

// Chỉ gắn admin key cho API /admin/* — không gửi kèm key bí mật trong các
// request công khai (tạo QR, đánh giá, trạng thái đơn…) để key không lọt vào
// log / trace ngoài phạm vi cần thiết.
axiosClient.interceptors.request.use((config) => {
  if (typeof window === "undefined" || !isAdminRequest(config.url)) {
    return config;
  }

  const adminKey = localStorage.getItem(ADMIN_KEY_STORAGE);

  if (adminKey) {
    config.headers["X-Admin-Api-Key"] = adminKey;
  }

  return config;
});

// Tự trả về response.data. API admin trả 401 (key sai / đã đổi) thì xoá key;
// AdminGuard nghe ADMIN_KEY_CHANGE_EVENT và tự chuyển về trang đăng nhập.
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      isAdminRequest(error.config?.url)
    ) {
      clearAdminKey();
    }

    return Promise.reject(error);
  },
);
