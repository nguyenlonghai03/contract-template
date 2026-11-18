// Cấu hình dùng chung cho cả Server và Client Component.
// NEXT_PUBLIC_* được inline lúc build nên dùng được ở cả hai phía.
// Trên Cloudflare, đặt NEXT_PUBLIC_API_BASE_URL ở mục *Build* variables (kết
// thúc bằng /api, vd https://contract-template-api.onrender.com/api); đổi giá
// trị thì phải build lại FE mới có hiệu lực.

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/+$/, "");

// Origin của backend (bỏ hậu tố /api) — dùng để ghép các đường dẫn tương đối
// backend trả về như "/api/previews/..." hoặc "/storage/previews/...".
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api$/, "");

export const SITE_URL = "https://hopdongphaply.vn";

// Chuẩn hoá URL ảnh/tài nguyên backend trả về: giữ nguyên URL tuyệt đối
// (R2/CDN), còn đường dẫn tương đối thì ghép với BACKEND_ORIGIN.
export function resolveBackendUrl(src: string): string {
  const trimmed = src.trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  return `${BACKEND_ORIGIN}/${trimmed.replace(/^\/+/, "")}`;
}

// Thời gian (giây) Next.js giữ dữ liệu trong Data Cache trước khi revalidate
// ở chế độ nền (stale-while-revalidate). Người dùng luôn nhận bản cache ngay.
export const REVALIDATE = {
  contractTypes: 3600,
  contractList: 60,
  contractDetail: 300,
  reviews: 60,
} as const;
