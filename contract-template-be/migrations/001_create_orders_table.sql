-- Tạo bảng orders (KHÔNG còn DROP TABLE: chạy lại file này không được xoá đơn hàng).
-- Cột checkout_session_id + kiểu amount BIGINT được bổ sung ở 005.


-- 1. Bảng orders
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,                    -- Mã đơn hàng dùng làm nội dung chuyển khoản
    contract_id BIGINT NOT NULL,                    -- Khách mua mẫu hợp đồng nào
    amount NUMERIC(12, 2) NOT NULL,                 -- Số tiền cần thanh toán
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL,  -- Trạng thái: Pending, Success, Expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại liên kết sang bảng contracts
    CONSTRAINT fk_orders_contract 
        FOREIGN KEY (contract_id) 
        REFERENCES contracts(id) 
        ON DELETE RESTRICT
);

-- 2. Tạo Index tối ưu tìm kiếm trạng thái
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);