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
	Price          int64          `json:"price"`
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

	// Các field phục vụ luồng Admin tạo hợp đồng + lưu file trên Cloudflare R2.
	// File gốc (PDF/DOCX) luôn private, chỉ object key được lưu ở đây.
	Status            string         `json:"status" gorm:"column:status;default:draft"`
	PdfObjectKey      string         `json:"pdf_object_key" gorm:"column:pdf_object_key"`
	DocxObjectKey     string         `json:"docx_object_key" gorm:"column:docx_object_key"`
	PreviewObjectKeys pq.StringArray `json:"preview_object_keys" gorm:"column:preview_object_keys;type:text[]"`
}

const (
	ContractStatusDraft     = "draft"
	ContractStatusPublished = "published"
)

// PublicContract là dữ liệu hợp đồng trả ra cho các API công khai. Cố ý KHÔNG
// chứa tên file gốc / object key R2 của file trả phí (word/pdf), cũng như
// trạng thái nội bộ — những trường này chỉ dành cho API admin.
type PublicContract struct {
	ID             uint      `json:"id"`
	Title          string    `json:"title"`
	Slug           string    `json:"slug"`
	Description    string    `json:"description,omitempty"`
	Price          int64     `json:"price"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	PreviewImages  []string  `json:"preview_images"`
	CategoryID     uint      `json:"category_id"`
	ContractTypeID uint      `json:"contract_type_id"`
	Views          string    `json:"views"`
	Downloads      string    `json:"downloads"`
	OriginalPrice  string    `json:"originalPrice"`
	Rating         float64   `json:"rating"`
}

// ToPublic chuyển Contract sang PublicContract với danh sách ảnh preview đã
// được tính sẵn (luôn là mảng, không bao giờ null).
func (c Contract) ToPublic(previewImages []string) PublicContract {
	if previewImages == nil {
		previewImages = []string{}
	}

	return PublicContract{
		ID:             c.ID,
		Title:          c.Title,
		Slug:           c.Slug,
		Description:    c.Description,
		Price:          c.Price,
		CreatedAt:      c.CreatedAt,
		UpdatedAt:      c.UpdatedAt,
		PreviewImages:  previewImages,
		CategoryID:     c.CategoryID,
		ContractTypeID: c.ContractTypeID,
		Views:          c.Views,
		Downloads:      c.Downloads,
		OriginalPrice:  c.OriginalPrice,
		Rating:         c.Rating,
	}
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
