import { ContractContents } from "./contractContent";

// ================= 1. HỢP ĐỒNG (CONTRACT) =================
// Khớp với models.PublicContract của backend (snake_case, đúng kiểu dữ liệu).
// Lưu ý: views / downloads / originalPrice backend lưu dạng chuỗi.
export type Contract = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  created_at: string;
  updated_at: string;
  preview_images: string[];
  category_id: number;
  contract_type_id: number;
  views: string;
  downloads: string;
  originalPrice: string;
  rating: number;

  // Nội dung SEO (giới thiệu / thông tin / hướng dẫn) — cột contracts.contents
  // (JSONB), chỉ có ở API chi tiết. Không có thì ContractInformation tự ẩn.
  contents?: ContractContents;
};

export type ContractType = {
  id: number;
  name: string;
  slug: string;
};

export type ContractTypeResponse = {
  success?: boolean;
  message?: string;
  data: ContractType[];
};

export type ContractResponse = {
  data: Contract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ================= 2. THANH TOÁN & ĐƠN HÀNG =================
// Khớp models.OrderStatus* của backend.
export type OrderStatus = "Pending" | "Success" | "Expired";

export type PaymentStatusResponse = {
  success: boolean;
  message: string;
  status: OrderStatus;
};
