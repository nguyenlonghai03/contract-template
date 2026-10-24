-- 1. Xóa bảng cũ nếu đã tồn tại
DROP TABLE IF EXISTS orders CASCADE;

-- 2. Tạo lại bảng orders mới với cấu trúc chuẩn
CREATE TABLE orders (
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

-- 3. Tạo Index tối ưu tìm kiếm trạng thái
CREATE INDEX idx_orders_status ON orders(status);