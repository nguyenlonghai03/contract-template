// ================= 1. DANH MỤC (CATEGORY) =================
export type Category = Partial<{
  id: string; // ID định danh từ DB (UUID hoặc số)
  name: string; // Tên danh mục (ví dụ: "Hợp Đồng Lao Động | Nhân sự")
  slug: string; // Đường dẫn URL (ví dụ: "hop-dong-lao-dong-nhan-su")
  isHot: boolean;
}>;

// ================= 2. PROPS CHO COMPONENT HIỂN THỊ DANH MỤC =================
export type CategorySidebarProps = {
  categories: Category[]; // Mảng danh sách danh mục lấy từ Database
  activeCategorySlug?: string; // Slug của danh mục đang được chọn (để active/highlight)
  onSearchChange?: (keyword: string) => void; // Hàm xử lý khi tìm kiếm danh mục
  isLoading?: boolean; // Trạng thái đang tải dữ liệu
};
