-- Ghi lại schema thanh toán đang chạy thực tế (trước đây chỉ được tạo tay,
-- không có trong migrations/) + bổ sung cột phục vụ đối soát.
-- Idempotent: chạy được trên DB đã có sẵn các bảng này.

-- 1. Phiên checkout (cookie checkout_session, lưu hash của token)
CREATE TABLE IF NOT EXISTS checkout_sessions (
    id          VARCHAR(64) PRIMARY KEY,
    token_hash  VARCHAR(64) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkout_sessions_token_hash_unique
    ON checkout_sessions (token_hash);

-- Index không unique cũ (tạo tay trước đây) thừa sau khi có index unique.
DROP INDEX IF EXISTS idx_checkout_sessions_token_hash;

-- 2. orders: liên kết phiên checkout + số tiền là số nguyên VND
ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_session_id VARCHAR(64);
ALTER TABLE orders ALTER COLUMN amount TYPE BIGINT USING amount::BIGINT;

CREATE INDEX IF NOT EXISTS idx_orders_checkout_session_id
    ON orders (checkout_session_id);

-- 3. Giao dịch SePay. se_pay_id UNIQUE là chốt chặn idempotency của webhook
-- (xem SePayWebhookHandler) — KHÔNG được bỏ.
CREATE TABLE IF NOT EXISTS se_pay_transactions (
    id               BIGSERIAL PRIMARY KEY,
    se_pay_id        BIGINT NOT NULL,
    order_id         VARCHAR(255) NOT NULL DEFAULT '',
    reference_code   TEXT,
    account_number   TEXT,
    transfer_amount  BIGINT,
    content          TEXT,
    gateway          TEXT,
    transaction_date TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS se_pay_transactions_se_pay_id_key
    ON se_pay_transactions (se_pay_id);

CREATE INDEX IF NOT EXISTS idx_se_pay_transactions_order_id
    ON se_pay_transactions (order_id);

ALTER TABLE se_pay_transactions
    ALTER COLUMN transfer_amount TYPE BIGINT USING transfer_amount::BIGINT;

-- Giao dịch không khớp đơn (sai tiền, trùng, không tìm thấy đơn…) cũng được
-- lưu lại để đối soát / hoàn tiền; cột result cho biết kết quả xử lý.
ALTER TABLE se_pay_transactions
    ADD COLUMN IF NOT EXISTS result VARCHAR(50) NOT NULL DEFAULT 'matched';

CREATE INDEX IF NOT EXISTS idx_se_pay_transactions_result_unmatched
    ON se_pay_transactions (result)
    WHERE result <> 'matched';
