-- Index phục vụ các truy vấn công khai hay dùng nhất.
-- Dùng CONCURRENTLY để không khoá bảng khi chạy trên DB đang phục vụ
-- (lưu ý: không chạy được bên trong một transaction block).

-- Danh sách hợp đồng theo danh mục: WHERE status = 'published' AND contract_type_id = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contracts_status_type
    ON contracts (status, contract_type_id);

-- Danh sách đánh giá đã duyệt của 1 hợp đồng:
-- WHERE contract_id = ? AND is_approved = true ORDER BY rating DESC, id DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_contract_approved
    ON reviews (contract_id, rating DESC, id DESC)
    WHERE is_approved = true;
