package controllers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"github.com/gin-gonic/gin"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"gorm.io/gorm"
	"net/url"
	"regexp"
)

func SePayWebhookHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		// 1. Bind payload
		var payload models.SePayWebhookPayload

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid JSON payload",
			})
			return
		}

		// 2. Chỉ nhận giao dịch tiền vào
		if payload.TransferType != "in" {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Ignored out transaction",
			})
			return
		}

		// 3. Kiểm tra ID giao dịch
		if payload.ID <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid SePay transaction ID",
			})
			return
		}

		// 4. Trích xuất mã đơn hàng từ nội dung chuyển khoản
		rawContent := strings.TrimSpace(payload.Content)

		// Mã đơn hàng có dạng HD + chuỗi ký tự
		re := regexp.MustCompile(`HD[A-Za-z0-9]+`)
		orderCode := re.FindString(rawContent)

		if orderCode == "" {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "No matching order code",
			})
			return
		}

		// 5. Kiểm tra giao dịch đã được xử lý chưa
		var existingTransaction models.SePayTransaction

		err := db.Where(
			"se_pay_id = ?",
			payload.ID,
		).First(&existingTransaction).Error

		if err == nil {
			// SePay gửi lại giao dịch đã xử lý
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Transaction already processed",
			})
			return
		}

		if err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Database error",
			})
			return
		}

		// 6. Kiểm tra Order
		var order models.Order

		if err := db.Where(
			"id = ?",
			orderCode,
		).First(&order).Error; err != nil {

			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Order not found, requires reconciliation",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Cannot find order",
			})
			return
		}

		// 7. Nếu Order đã Success
		if order.Status == "Success" {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Order already paid",
			})
			return
		}

		// 8. Kiểm tra số tiền
		if payload.TransferAmount != order.Amount {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Amount mismatch, requires reconciliation",
			})
			return
		}

		// 9. Kiểm tra tài khoản nhận tiền
		const expectedAccountNumber = "04494162701"

		if payload.AccountNumber != expectedAccountNumber {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"message": "Incorrect destination account",
			})
			return
		}

		// 10. Lưu giao dịch và cập nhật Order
		err = db.Transaction(func(tx *gorm.DB) error {

			// Ghi nhận giao dịch SePay
			transaction := models.SePayTransaction{
				SePayID:         payload.ID,
				OrderID:         order.ID,
				ReferenceCode:   payload.ReferenceCode,
				AccountNumber:   payload.AccountNumber,
				TransferAmount:  payload.TransferAmount,
				Content:         payload.Content,
				Gateway:         payload.Gateway,
				TransactionDate: payload.TransactionDate,
			}

			if err := tx.Create(&transaction).Error; err != nil {
				return err
			}

			// Chỉ cập nhật nếu Order chưa Success
			result := tx.Model(&models.Order{}).
				Where("id = ? AND status IN ?", order.ID, []string{
					"Pending",
					"Expired",
				}).
				Update("status", "Success")

			if result.Error != nil {
				return result.Error
			}
			// Nếu số dòng bị ảnh hưởng khác 1 (ví dụ = 0, tức là đơn đã bị ai đó sửa trước mất rồi)
			if result.RowsAffected != 1 {
				return gorm.ErrRecordNotFound
			}

			return nil
		})

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Order already processed",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to process transaction",
			})
			return
		}

		// 11. Trả kết quả cho SePay
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Webhook processed successfully",
		})
	}
}

// Tạo chuỗi ngẫu nhiên bảo mật
func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length)

	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}

// Hash session token
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// Sinh mã đơn hàng
func generateOrderCode() (string, error) {
	random, err := generateRandomString(4)
	if err != nil {
		return "", err
	}

	return "HD" + random, nil
}

func GenerateQRCodeHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.CreateOrderRequest

		if err := c.ShouldBindJSON(&req); err != nil || req.ContractID == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Contract ID không hợp lệ",
			})
			return
		}

		// 1. Lấy thông tin hợp đồng
		var contract models.Contract

		if err := db.First(&contract, req.ContractID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{
					"success": false,
					"message": "Không tìm thấy mẫu hợp đồng",
				})
				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi truy vấn hợp đồng",
			})
			return
		}

		// 2. Lấy Session từ cookie
		sessionToken, cookieErr := c.Cookie("checkout_session")

		var session models.CheckoutSession
		isNewSession := false

		if cookieErr == nil && sessionToken != "" {
			tokenHash := hashToken(sessionToken)

			err := db.Where(
				"token_hash = ? AND expires_at > ?",
				tokenHash,
				time.Now(),
			).First(&session).Error

			if err != nil && err != gorm.ErrRecordNotFound {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể kiểm tra Session",
				})
				return
			}

			if err == gorm.ErrRecordNotFound {
				sessionToken = ""
			}
		}

		// 3. Nếu chưa có Session hợp lệ thì tạo mới
		if sessionToken == "" {
			token, err := generateRandomString(32)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo Session Token",
				})
				return
			}

			sessionToken = token

			sessionID, err := generateRandomString(16)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo Session ID",
				})
				return
			}

			session = models.CheckoutSession{
				ID:        sessionID,
				TokenHash: hashToken(sessionToken),
				CreatedAt: time.Now(),
				ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
			}

			isNewSession = true
		}

		// 4. Tìm Order gần nhất của Session + Contract
		var order models.Order

		if !isNewSession {
			err := db.Where(
				"checkout_session_id = ? AND contract_id = ?",
				session.ID,
				req.ContractID,
			).
				Order("created_at DESC").
				First(&order).Error

			if err != nil && err != gorm.ErrRecordNotFound {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tìm đơn hàng",
				})
				return
			}
		}

		// 5. Quyết định có cần tạo Order mới không
		shouldCreateOrder := isNewSession ||
			order.ID == "" ||
			order.Status == "Expired"

		if shouldCreateOrder {
			orderCode, err := generateOrderCode()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo mã đơn hàng",
				})
				return
			}

			newOrder := models.Order{
				ID:                orderCode,
				CheckoutSessionID: session.ID,
				ContractID:        req.ContractID,
				Amount:            contract.Price,
				Status:            "Pending",
				CreatedAt:         time.Now(),
			}

			// 6. Lưu Session và Order trong transaction
			err = db.Transaction(func(tx *gorm.DB) error {
				if isNewSession {
					if err := tx.Create(&session).Error; err != nil {
						return err
					}
				}

				if err := tx.Create(&newOrder).Error; err != nil {
					return err
				}

				return nil
			})

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo đơn hàng",
					"error":   err.Error(),
				})
				return
			}

			order = newOrder
		}

		// 7. Gửi cookie nếu đây là Session mới
		if isNewSession {
			c.SetSameSite(http.SameSiteLaxMode)

			c.SetCookie(
				"checkout_session",
				sessionToken,
				7*24*60*60,
				"/",
				"",
				true, // Secure: cần HTTPS
				true, // HttpOnly
			)
		}

		// 8. Tạo QR từ thông tin Order
		bankID := "TPB"
		accountNo := "04494162701"
		template := "compact"
		accountName := "NGUYEN LONG HAI"
		bankName := "TPBank (Ngân hàng TMCP Tiên Phong)"

		qrCodeURL := fmt.Sprintf(
			"https://img.vietqr.io/image/%s-%s-%s.png?amount=%.0f&addInfo=%s",
			bankID,
			accountNo,
			template,
			order.Amount,
			url.QueryEscape(order.ID),
		)

		// 9. Trả kết quả về FE
		c.JSON(http.StatusOK, gin.H{
			"success":      true,
			"order_code":   order.ID,
			"contract_id":  order.ContractID,
			"amount":       order.Amount,
			"status":       order.Status,
			"bank_name":    bankName,
			"account_no":   accountNo,
			"account_name": accountName,
			"qr_code_url":  qrCodeURL,
			"message":      "Lấy thông tin thanh toán thành công",
		})
	}
}

// func SePayWebhookHandler(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		var payload models.SePayWebhookPayload

// 		// 1. Bind dữ liệu JSON SePay gửi lên
// 		if err := c.ShouldBindJSON(&payload); err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid JSON payload"})
// 			return
// 		}

// 		// 2. Chỉ xử lý các giao dịch tiền vào ("in")
// 		if payload.TransferType != "in" {
// 			c.JSON(http.StatusOK, gin.H{"success": true, "message": "Ignored out transaction"})
// 			return
// 		}

// 		// Lấy nội dung SePay gửi lên, ví dụ: "HD1792836131 FT26297292265301" hoặc "HD1792836131"
// 		rawContent := strings.TrimSpace(payload.Content)

// 		// Cắt chuỗi theo khoảng trắng và lấy phần đầu tiên
// 		parts := strings.Fields(rawContent)
// 		orderCode := rawContent
// 		if len(parts) > 0 {
// 			orderCode = parts[0] // Kết quả sẽ luôn là "HD1792836131" dù có bị dính mã FT phía sau
// 		}

// 		// Hoặc nếu bạn muốn chắc chắn quét được mã đơn hàng nằm trong chuỗi nội dung dài:
// 		// (Ví dụ khách ghi: "Thanh toan HD171123456", ta có thể viết logic lọc, nhưng tốt nhất nhắc khách giữ nguyên nội dung).

// 		// 4. Tìm đơn hàng trong Database dựa vào mã đơn hàng (ID)
// 		var order models.Order

// 		if err := db.Where("id = ? AND status = ?", orderCode, "Pending").First(&order).Error; err != nil {
// 			// Không tìm thấy đơn hàng hoặc đơn hàng đã được thanh toán trước đó rồi
// 			c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Order not found or already processed"})
// 			return
// 		}

// 		// 5. Kiểm tra kỹ xem số tiền khách chuyển có khớp với số tiền của đơn hàng không (bảo mật cực kỳ quan trọng)
// 		if payload.TransferAmount != order.Amount {
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"success": false,
// 				"message": "Số tiền chuyển khoản không khớp với giá trị đơn hàng",
// 			})
// 			return
// 		}

// 		// 6. Cập nhật trạng thái đơn hàng thành "Success"
// 		order.Status = "Success"
// 		if err := db.Save(&order).Error; err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to update order status"})
// 			return
// 		}

// 		// --- BẠN CÓ THỂ VIẾT THÊM LOGIC CẤP QUYỀN TẢI HỢP ĐỒNG CHO USER Ở ĐÂY ---
// 		// Ví dụ: Tạo bản ghi quyền sở hữu hợp đồng cho user_id tương ứng với contract_id trong order.

// 		// 7. Phản hồi lại cho SePay biết là server đã nhận và xử lý thành công (SePay yêu cầu trả về HTTP 200)
// 		c.JSON(http.StatusOK, gin.H{
// 			"success": true,
// 			"message": "Webhook processed successfully",
// 		})
// 	}
// }

// func GenerateQRCodeHandler(db *gorm.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		var req models.CreateOrderRequest

// 		if err := c.ShouldBindJSON(&req); err != nil {
// 			c.JSON(http.StatusBadRequest, gin.H{
// 				"success": false,
// 				"message": "Dữ liệu không hợp lệ",
// 				"error":   err.Error(),
// 			})
// 			return
// 		}

// 		// 1. Truy vấn lấy thông tin giá tiền từ bảng contracts dựa vào req.ContractID
// 		var contract models.Contract // Giả sử model Contract của bạn tên là Contract

// 		if err := db.First(&contract, req.ContractID).Error; err != nil {
// 			c.JSON(http.StatusNotFound, gin.H{
// 				"success": false,
// 				"message": "Không tìm thấy mẫu hợp đồng yêu cầu",
// 			})
// 			return
// 		}

// 		// Lấy số tiền thực tế từ bảng contract (giả sử cột chứa giá tiền là Price, bạn chỉnh lại tên cột cho khớp model thực tế)
// 		amount := contract.Price

// 		// 2. Sinh mã đơn hàng tự động (Dùng làm nội dung chuyển khoản cho SePay)
// 		orderCode := fmt.Sprintf("HD%d", time.Now().Unix())

// 		// 3. Tạo đối tượng Order mới và lưu vào DB với trạng thái "Pending"
// 		newOrder := models.Order{
// 			ID:         orderCode,
// 			ContractID: req.ContractID,
// 			Amount:     amount,
// 			Status:     "Pending",
// 			CreatedAt:  time.Now(),
// 		}

// 		if err := db.Create(&newOrder).Error; err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{
// 				"success": false,
// 				"message": "Không thể tạo đơn hàng trong hệ thống",
// 				"error":   err.Error(),
// 			})
// 			return
// 		}

// 		// 4. Cấu hình thông tin tài khoản ngân hàng nhận tiền
// 		bankID := "TPB"                  // Mã ngân hàng (VD: VCB, MB, Techcombank...)
// 		accountNo := "04494162701"       // Số tài khoản nhận tiền của bạn
// 		template := "compact"            // Kiểu hiển thị mã QR
// 		accountName := "NGUYEN LONG HAI" // Tên chủ tài khoản thực tế của bạn
// 		bankName := "TPBank (Ngân hàng TMCP Tiên Phong)"

// 		// 5. Tạo đường dẫn ảnh QR VietQR tự động
// 		qrCodeURL := fmt.Sprintf("https://img.vietqr.io/image/%s-%s-%s.png?amount=%.0f&addInfo=%s",
// 			bankID, accountNo, template, amount, orderCode)

// 		// 6. Trả về kết quả cho FE hiển thị
// 		c.JSON(http.StatusOK, gin.H{
// 			"success":      true,
// 			"order_code":   orderCode,
// 			"amount":       amount,
// 			"bank_name":    bankName,
// 			"account_no":   accountNo,
// 			"account_name": accountName,
// 			"qr_code_url":  qrCodeURL, // FE sẽ dùng link này gán vào thẻ <img src="...">
// 			"message":      "Tạo mã QR thanh toán thành công",
// 		})
// 	}
// }
