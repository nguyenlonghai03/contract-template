// src/utils/stringUtils.ts

export const removeDiacritics = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d") // Thêm dòng này để đổi đ thành d
    .replace(/Đ/g, "D") // Thêm dòng này để đổi Đ thành D
    .toLowerCase();
};

// Hàm tạo chữ cái đầu cho Avatar (Ví dụ: "Nguyễn Văn A" -> "NVA" hoặc lấy 2 chữ cái đầu)
export const getAvatarText = (name: string) => {
  if (!name) return "KH";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
