// Định dạng giá VND dùng chung (backend trả price là số, originalPrice là chuỗi).
// Trả chuỗi rỗng khi không có giá trị hợp lệ để UI có thể ẩn đi.
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";

  const num = Number(value);
  if (!Number.isFinite(num)) return "";

  return num.toLocaleString("vi-VN");
}
