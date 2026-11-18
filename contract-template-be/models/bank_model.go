package models

import "time"

// Struct hứng dữ liệu SePay bắn về (Webhook Payload)
type SePayWebhookPayload struct {
	ID              uint   `json:"id"`
	Gateway         string `json:"gateway"`
	TransactionDate string `json:"transactionDate"`
	AccountNumber   string `json:"accountNumber"`
	Content         string `json:"content"`        // Nội dung chuyển khoản chứa mã đơn hàng
	TransferType    string `json:"transferType"`   // "in" là tiền vào, "out" là tiền ra
	TransferAmount  int64  `json:"transferAmount"` // Số tiền thực tế chuyển vào
	ReferenceCode   string `json:"referenceCode"`
}

// Struct nhận request từ FE (ví dụ khách chọn mua hợp đồng ID mấy)
type CreateOrderRequest struct {
	ContractID uint `json:"contract_id"`

	// Đơn FE đã lưu từ lần trước (tuỳ chọn): nếu hợp lệ thì dùng lại thay vì
	// tạo đơn mới — không phụ thuộc cookie cross-site.
	OrderCode   string `json:"order_code"`
	AccessToken string `json:"access_token"`
}

type SePayTransaction struct {
	ID              uint   `gorm:"primaryKey"`
	SePayID         uint   `gorm:"uniqueIndex;not null"`
	OrderID         string `gorm:"index;not null"`
	ReferenceCode   string
	AccountNumber   string
	TransferAmount  int64
	Content         string
	Gateway         string
	TransactionDate string
	// Kết quả xử lý: matched | order_not_found | already_paid | amount_mismatch | wrong_account
	Result    string `gorm:"type:varchar(50);not null;default:matched"`
	CreatedAt time.Time
}
