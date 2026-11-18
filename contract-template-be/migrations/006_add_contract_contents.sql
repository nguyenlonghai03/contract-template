-- Nội dung SEO của trang chi tiết hợp đồng (giới thiệu / thông tin / hướng dẫn).
-- Cấu trúc JSON khớp type ContractContents ở FE
-- (contract-template-fe/src/types/contractContent.ts):
--   { "introduction"?: {title?, blocks[]}, "details"?: {...}, "guide"?: {...} }
-- NULL = không có nội dung, FE tự ẩn phần này.
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contents JSONB;
