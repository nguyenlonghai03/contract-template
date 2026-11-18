// ================= 1. DANH MỤC (CATEGORY) =================
export type Category = Partial<{
  id: string; // ID định danh từ DB (UUID hoặc số)
  name: string; // Tên danh mục (ví dụ: "Hợp Đồng Lao Động | Nhân sự")
  slug: string; // Đường dẫn URL (ví dụ: "hop-dong-lao-dong-nhan-su")
  isHot: boolean;
}>;
