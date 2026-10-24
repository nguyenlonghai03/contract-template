package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"gorm.io/gorm"
)

func SePayWebhookHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload models.SePayWebhookPayload

		// 1. Bind dữ liệu JSON SePay gửi lên
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid JSON payload"})
			return
		}

		// 2. Chỉ xử lý các giao dịch tiền vào ("in")
		if payload.TransferType != "in" {
			c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ignored out transaction"})
			return
		}

		// Lấy nội dung SePay gửi lên, ví dụ: "HD1792836131 FT26297292265301" hoặc "HD1792836131"
		rawContent := strings.TrimSpace(payload.Content)

		// Cắt chuỗi theo khoảng trắng và lấy phần đầu tiên
		parts := strings.Fields(rawContent)
		orderCode := rawContent
		if len(parts) > 0 {
			orderCode = parts[0] // Kết quả sẽ luôn là "HD1792836131" dù có bị dính mã FT phía sau
		}

		// Hoặc nếu bạn muốn chắc chắn quét được mã đơn hàng nằm trong chuỗi nội dung dài:
		// (Ví dụ khách ghi: "Thanh toan HD171123456", ta có thể viết logic lọc, nhưng tốt nhất nhắc khách giữ nguyên nội dung).

		// 4. Tìm đơn hàng trong Database dựa vào mã đơn hàng (ID)
		var order models.Order

		if err := db.Where("id = ? AND status = ?", orderCode, "Pending").First(&order).Error; err != nil {
			// Không tìm thấy đơn hàng hoặc đơn hàng đã được thanh toán trước đó rồi
			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Order not found or already processed"})
			return
		}

		// 5. Kiểm tra kỹ xem số tiền khách chuyển có khớp với số tiền của đơn hàng không (bảo mật cực kỳ quan trọng)
		if payload.TransferAmount != order.Amount {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Số tiền chuyển khoản không khớp với giá trị đơn hàng",
			})
			return
		}

		// 6. Cập nhật trạng thái đơn hàng thành "Success"
		order.Status = "Success"
		if err := db.Save(&order).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update order status"})
			return
		}

		// --- BẠN CÓ THỂ VIẾT THÊM LOGIC CẤP QUYỀN TẢI HỢP ĐỒNG CHO USER Ở ĐÂY ---
		// Ví dụ: Tạo bản ghi quyền sở hữu hợp đồng cho user_id tương ứng với contract_id trong order.

		// 7. Phản hồi lại cho SePay biết là server đã nhận và xử lý thành công (SePay yêu cầu trả về HTTP 200)
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Webhook processed successfully",
		})
	}
}

func GenerateQRCodeHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.CreateOrderRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Dữ liệu không hợp lệ",
				"error":   err.Error(),
			})
			return
		}

		// 1. Truy vấn lấy thông tin giá tiền từ bảng contracts dựa vào req.ContractID
		var contract models.Contract // Giả sử model Contract của bạn tên là Contract

		if err := db.First(&contract, req.ContractID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy mẫu hợp đồng yêu cầu",
			})
			return
		}

		// Lấy số tiền thực tế từ bảng contract (giả sử cột chứa giá tiền là Price, bạn chỉnh lại tên cột cho khớp model thực tế)
		amount := contract.Price

		// 2. Sinh mã đơn hàng tự động (Dùng làm nội dung chuyển khoản cho SePay)
		orderCode := fmt.Sprintf("HD%d", time.Now().Unix())

		// 3. Tạo đối tượng Order mới và lưu vào DB với trạng thái "Pending"
		newOrder := models.Order{
			ID:         orderCode,
			ContractID: req.ContractID,
			Amount:     amount,
			Status:     "Pending",
			CreatedAt:  time.Now(),
		}

		if err := db.Create(&newOrder).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể tạo đơn hàng trong hệ thống",
				"error":   err.Error(),
			})
			return
		}

		// 4. Cấu hình thông tin tài khoản ngân hàng nhận tiền
		bankID := "TPB"            // Mã ngân hàng (VD: VCB, MB, Techcombank...)
		accountNo := "04494162701" // Số tài khoản nhận tiền của bạn
		template := "compact2"     // Kiểu hiển thị mã QR

		// 5. Tạo đường dẫn ảnh QR VietQR tự động
		qrCodeURL := fmt.Sprintf("https://img.vietqr.io/image/%s-%s-%s.png?amount=%.0f&addInfo=%s",
			bankID, accountNo, template, amount, orderCode)

		// 6. Trả về kết quả cho FE hiển thị
		c.JSON(http.StatusOK, gin.H{
			"success":     true,
			"order_code":  orderCode,
			"amount":      amount,
			"qr_code_url": qrCodeURL, // FE sẽ dùng link này gán vào thẻ <img src="...">
			"message":     "Tạo mã QR thanh toán thành công",
		})
	}
}
