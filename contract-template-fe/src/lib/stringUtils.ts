// src/utils/stringUtils.ts

export const removeDiacritics = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d") // Thêm dòng này để đổi đ thành d
    .replace(/Đ/g, "D") // Thêm dòng này để đổi Đ thành D
    .toLowerCase();
};
