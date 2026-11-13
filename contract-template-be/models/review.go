package models

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	ContractID uint   `json:"contract_id" gorm:"index"`              // Liên kết với hợp đồng
	AuthorName string `json:"author_name" binding:"required"`        // Tên khách hàng
	Phone      string `json:"phone" binding:"required"`              // Số điện thoại
	Rating     int    `json:"rating" binding:"required,min=1,max=5"` // Số sao (1-5)
	Comment    string `json:"comment" binding:"required"`            // Nội dung đánh giá
	IsApproved bool   `json:"is_approved" gorm:"default:false"`      // Mặc định chờ kiểm duyệt
}

// Masking số điện thoại trước khi trả về cho Frontend (giống giao diện mẫu của bạn)
type ReviewResponse struct {
	ID         uint   `json:"id"`
	AuthorName string `json:"author_name"`
	Phone      string `json:"phone"`
	Rating     int    `json:"rating"`
	Comment    string `json:"comment"`
	CreatedAt  string `json:"created_at"`
}
