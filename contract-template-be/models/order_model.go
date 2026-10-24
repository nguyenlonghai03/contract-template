package models

import (
	"time"
)

type Order struct {
	ID         string    `json:"id" gorm:"primaryKey;type:varchar(255)"` // Mã đơn hàng / Nội dung chuyển khoản
	ContractID uint      `json:"contract_id"`                            // Khóa ngoại trỏ tới contracts
	Contract   Contract  `gorm:"foreignKey:ContractID"`                  // Struct liên kết (để tiện truy vấn thông tin hợp đồng nếu cần)
	Amount     float64   `json:"amount"`                                 // Số tiền thanh toán
	Status     string    `json:"status" gorm:"default:'Pending'"`        // Trạng thái: Pending, Success, Expired
	CreatedAt  time.Time `json:"created_at"`                             // Thời gian tạo đơn
}

// Hàm này ép GORM phải insert chính xác vào bảng có tên là "orders"
func (Order) TableName() string {
	return "orders"
}
