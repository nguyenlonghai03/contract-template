package models

import (
	"github.com/lib/pq"
	"time"
)

// Contract định nghĩa cấu trúc dữ liệu tương ứng với bảng contracts trong PostgreSQL
type Contract struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Title          string         `json:"title"`
	Slug           string         `json:"slug"`
	Description    string         `json:"description"`
	Price          float64        `json:"price"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	WordFileName   string         `json:"word_file_name"` // Thêm cột lưu tên file Word
	PdfFileName    string         `json:"pdf_file_name"`
	PreviewImages  pq.StringArray `gorm:"type:text[]" json:"preview_images"`
	CategoryID     uint           `json:"category_id"`
	ContractTypeID uint           `json:"contract_type_id"`
	Views          string         `json:"views" gorm:"column:views"`
	Downloads      string         `json:"downloads" gorm:"column:downloads"`
	OriginalPrice  string         `json:"originalPrice" gorm:"column:original_price"`
	Rating         float64        `json:"rating" gorm:"column:rating"`
}

type ContractType struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"type:varchar(255);not null"`
	Slug string `json:"slug" gorm:"type:varchar(255);unique;not null"`
}

// Chỉ định tên bảng nếu cần thiết (mặc định GORM sẽ tìm bảng "contract_types")
func (ContractType) TableName() string {
	return "contract_types"
}
