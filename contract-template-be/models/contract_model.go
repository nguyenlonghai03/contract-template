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
	FileS3Key      string    `json:"file_s3_key"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	CategoryID     uint      `json:"category_id"`
	ContractTypeID uint      `json:"contract_type_id"`
}
