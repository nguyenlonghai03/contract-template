-- Thêm các cột phục vụ luồng Admin tạo hợp đồng + lưu file gốc/preview trên Cloudflare R2

ALTER TABLE contracts
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'draft',
    ADD CONSTRAINT contracts_status_check CHECK (status IN ('draft', 'published')),
    ADD COLUMN pdf_object_key TEXT,
    ADD COLUMN docx_object_key TEXT,
    ADD COLUMN preview_object_keys TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX idx_contracts_status ON contracts(status);
CREATE UNIQUE INDEX idx_contracts_slug_unique ON contracts(slug);
