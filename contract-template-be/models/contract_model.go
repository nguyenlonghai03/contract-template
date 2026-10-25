package models

import (
	"time"
)

// Contract định nghĩa cấu trúc dữ liệu tương ứng với bảng contracts trong PostgreSQL
type Contract struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Title          string    `json:"title"`
	Slug           string    `json:"slug"`
	Description    string    `json:"description"`
	Price          float64   `json:"price"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	WordFileName   string    `json:"word_file_name"` // Thêm cột lưu tên file Word
	PdfFileName    string    `json:"pdf_file_name"`
	CategoryID     uint      `json:"category_id"`
	ContractTypeID uint      `json:"contract_type_id"`
}
