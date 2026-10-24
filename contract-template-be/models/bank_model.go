package models

// Struct hứng dữ liệu SePay bắn về (Webhook Payload)
type SePayWebhookPayload struct {
	ID              uint    `json:"id"`
	Gateway         string  `json:"gateway"`
	TransactionDate string  `json:"transactionDate"`
	AccountNumber   string  `json:"accountNumber"`
	Content         string  `json:"content"`        // Nội dung chuyển khoản chứa mã đơn hàng
	TransferType    string  `json:"transferType"`   // "in" là tiền vào, "out" là tiền ra
	TransferAmount  float64 `json:"transferAmount"` // Số tiền thực tế chuyển vào
	ReferenceCode   string  `json:"referenceCode"`
}

// Struct nhận request từ FE (ví dụ khách chọn mua hợp đồng ID mấy)
type CreateOrderRequest struct {
	ContractID uint `json:"contract_id"`
}
