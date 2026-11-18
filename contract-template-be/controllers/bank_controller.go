package controllers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"

	"github.com/gin-gonic/gin"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Kết quả xử lý của từng giao dịch SePay, lưu ở se_pay_transactions.result để
// đối soát / hoàn tiền thủ công khi cần.
const (
	sepayResultMatched        = "matched"
	sepayResultOrderNotFound  = "order_not_found"
	sepayResultAlreadyPaid    = "already_paid"
	sepayResultAmountMismatch = "amount_mismatch"
	sepayResultWrongAccount   = "wrong_account"
)

func SePayWebhookHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 0. Chỉ chấp nhận webhook có API key đúng của SePay
		if !sepayAuthorized(c) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Unauthorized",
			})
			return
		}

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

		transaction := models.SePayTransaction{
			SePayID:         payload.ID,
			ReferenceCode:   payload.ReferenceCode,
			AccountNumber:   payload.AccountNumber,
			TransferAmount:  payload.TransferAmount,
			Content:         payload.Content,
			Gateway:         payload.Gateway,
			TransactionDate: payload.TransactionDate,
		}

		// 4–9. Xử lý giao dịch (dùng chung với job đối soát SePay)
		outcome, err := processSePayTransaction(db, transaction)
		if err != nil {
			log.Printf("sepay webhook: process transaction %d: %v", payload.ID, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to process transaction",
			})
			return
		}

		// 10. Trả kết quả cho SePay
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": outcome.message(),
		})
	}
}

// sepayOutcome là kết quả xử lý một giao dịch SePay (webhook hoặc đối soát).
type sepayOutcome string

const (
	sepayOutcomeDuplicate        sepayOutcome = "duplicate"
	sepayOutcomeNoOrderCode      sepayOutcome = "no_order_code"
	sepayOutcomeMatched          sepayOutcome = sepayOutcome(sepayResultMatched)
	sepayOutcomeOrderNotFound    sepayOutcome = sepayOutcome(sepayResultOrderNotFound)
	sepayOutcomeAlreadyPaid      sepayOutcome = sepayOutcome(sepayResultAlreadyPaid)
	sepayOutcomeAmountMismatch   sepayOutcome = sepayOutcome(sepayResultAmountMismatch)
	sepayOutcomeWrongAccount     sepayOutcome = sepayOutcome(sepayResultWrongAccount)
	sepayOutcomeAlreadyProcessed sepayOutcome = "order_already_processed"
)

func (o sepayOutcome) message() string {
	switch o {
	case sepayOutcomeDuplicate:
		return "Transaction already processed"
	case sepayOutcomeNoOrderCode:
		return "No matching order code"
	case sepayOutcomeMatched:
		return "Webhook processed successfully"
	case sepayOutcomeOrderNotFound:
		return "Order not found, requires reconciliation"
	case sepayOutcomeAlreadyPaid:
		return "Order already paid, requires reconciliation"
	case sepayOutcomeAmountMismatch:
		return "Amount mismatch, requires reconciliation"
	case sepayOutcomeWrongAccount:
		return "Incorrect destination account"
	case sepayOutcomeAlreadyProcessed:
		return "Order already processed"
	default:
		return string(o)
	}
}

// processSePayTransaction áp dụng toàn bộ các chốt chặn thanh toán cho một
// giao dịch tiền vào: idempotency theo se_pay_id, khớp mã đơn, số tiền, tài
// khoản nhận, rồi cập nhật đơn trong DB transaction với kiểm tra RowsAffected.
// Dùng chung cho webhook và job đối soát để hai đường không lệch logic.
func processSePayTransaction(db *gorm.DB, transaction models.SePayTransaction) (sepayOutcome, error) {
	// Giao dịch đã được xử lý chưa
	var existingTransaction models.SePayTransaction

	err := db.Where("se_pay_id = ?", transaction.SePayID).First(&existingTransaction).Error
	if err == nil {
		return sepayOutcomeDuplicate, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return "", fmt.Errorf("lookup transaction %d: %w", transaction.SePayID, err)
	}

	// Tìm Order từ nội dung chuyển khoản
	candidates := orderCodeCandidates(strings.TrimSpace(transaction.Content))
	if len(candidates) == 0 {
		return sepayOutcomeNoOrderCode, nil
	}

	var order models.Order

	// UPPER(id): mã cũ lưu chữ thường, mã mới lưu chữ hoa. Ưu tiên mã dài
	// hơn (định dạng mới) nếu cả hai cùng khớp.
	err = db.Where("UPPER(id) IN ?", candidates).
		Order("LENGTH(id) DESC").
		First(&order).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return recordUnmatchedTransaction(db, transaction, sepayResultOrderNotFound)
	}
	if err != nil {
		return "", fmt.Errorf("lookup order %v: %w", candidates, err)
	}

	transaction.OrderID = order.ID

	// Order đã thanh toán trước đó (khách chuyển trùng)
	if order.Status == models.OrderStatusSuccess {
		return recordUnmatchedTransaction(db, transaction, sepayResultAlreadyPaid)
	}

	// Kiểm tra số tiền
	if transaction.TransferAmount != order.Amount {
		return recordUnmatchedTransaction(db, transaction, sepayResultAmountMismatch)
	}

	// Kiểm tra tài khoản nhận tiền
	if transaction.AccountNumber != getBankAccount().AccountNo {
		return recordUnmatchedTransaction(db, transaction, sepayResultWrongAccount)
	}

	// Lưu giao dịch và cập nhật Order
	transaction.Result = sepayResultMatched

	err = db.Transaction(func(tx *gorm.DB) error {
		// Unique index se_pay_id chặn xử lý trùng khi SePay gửi song song
		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		// Chỉ cập nhật nếu Order chưa Success
		result := tx.Model(&models.Order{}).
			Where("id = ? AND status IN ?", order.ID, []string{
				models.OrderStatusPending,
				models.OrderStatusExpired,
			}).
			Update("status", models.OrderStatusSuccess)

		if result.Error != nil {
			return result.Error
		}

		// RowsAffected khác 1: đơn đã bị request khác cập nhật trước
		if result.RowsAffected != 1 {
			return gorm.ErrRecordNotFound
		}

		return nil
	})

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) || isUniqueViolation(err) {
			return sepayOutcomeAlreadyProcessed, nil
		}
		return "", fmt.Errorf("process transaction %d: %w", transaction.SePayID, err)
	}

	return sepayOutcomeMatched, nil
}

// recordUnmatchedTransaction lưu lại giao dịch không khớp đơn nào (để đối soát)
// mà KHÔNG thay đổi trạng thái đơn. ON CONFLICT DO NOTHING giữ idempotency
// khi SePay gửi lại cùng một giao dịch.
func recordUnmatchedTransaction(
	db *gorm.DB,
	transaction models.SePayTransaction,
	result string,
) (sepayOutcome, error) {
	transaction.Result = result

	if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&transaction).Error; err != nil {
		return "", fmt.Errorf("record %s transaction %d: %w", result, transaction.SePayID, err)
	}

	log.Printf("sepay: transaction %d recorded as %s (order %q)",
		transaction.SePayID, result, transaction.OrderID)

	return sepayOutcome(result), nil
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

// Sinh mã đơn hàng: HD + 12 ký tự hex viết hoa
func generateOrderCode() (string, error) {
	random, err := generateRandomString(orderCodeRandomBytes)
	if err != nil {
		return "", err
	}

	return orderCodePrefix + strings.ToUpper(random), nil
}

func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}

	if errors.Is(err, gorm.ErrDuplicatedKey) {
		return true
	}

	msg := err.Error()

	return strings.Contains(msg, "23505") || strings.Contains(msg, "duplicate key")
}

const maxOrderCodeAttempts = 3

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

		// 1. Lấy thông tin hợp đồng (chỉ hợp đồng đã Published mới được bán)
		var contract models.Contract

		if err := db.Where("status = ?", models.ContractStatusPublished).
			First(&contract, req.ContractID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{
					"success": false,
					"message": "Không tìm thấy mẫu hợp đồng",
				})
				return
			}

			log.Printf("generate-qr: load contract %d: %v", req.ContractID, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi truy vấn hợp đồng",
			})
			return
		}

		// 2. Ưu tiên đơn FE đã lưu (order_code + access_token). Cách này không
		// phụ thuộc cookie nên vẫn chạy khi trình duyệt chặn cookie bên thứ ba.
		if order, ok := findReusableOrder(db, req); ok {
			respondWithOrder(c, order)
			return
		}

		// 3. Lấy Session từ cookie
		sessionToken, cookieErr := c.Cookie("checkout_session")

		var session models.CheckoutSession
		isNewSession := false

		if cookieErr == nil && sessionToken != "" {
			err := db.Where(
				"token_hash = ? AND expires_at > ?",
				hashToken(sessionToken),
				time.Now(),
			).First(&session).Error

			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("generate-qr: load session: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể kiểm tra Session",
				})
				return
			}

			if errors.Is(err, gorm.ErrRecordNotFound) {
				sessionToken = ""
			}
		}

		// 4. Nếu chưa có Session hợp lệ thì tạo mới
		if sessionToken == "" {
			token, err := generateRandomString(32)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo Session Token",
				})
				return
			}

			sessionID, err := generateRandomString(16)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo Session ID",
				})
				return
			}

			sessionToken = token

			session = models.CheckoutSession{
				ID:        sessionID,
				TokenHash: hashToken(sessionToken),
				CreatedAt: time.Now(),
				ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
			}

			isNewSession = true
		}

		// 5. Tìm Order gần nhất của Session + Contract
		var order models.Order

		if !isNewSession {
			err := db.Where(
				"checkout_session_id = ? AND contract_id = ?",
				session.ID,
				req.ContractID,
			).
				Order("created_at DESC").
				First(&order).Error

			if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("generate-qr: load session order: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tìm đơn hàng",
				})
				return
			}
		}

		// 6. Quyết định có cần tạo Order mới không
		shouldCreateOrder := isNewSession ||
			order.ID == "" ||
			order.Status == models.OrderStatusExpired

		if shouldCreateOrder {
			newOrder, err := createOrder(db, session, isNewSession, req.ContractID, contract.Price)
			if err != nil {
				log.Printf("generate-qr: create order: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo đơn hàng",
				})
				return
			}

			order = newOrder
		}

		// 7. Gửi cookie nếu đây là Session mới. FE và API nằm khác site nên
		// cookie phải là SameSite=None (bắt buộc kèm Secure) thì trình duyệt
		// mới gửi kèm request XHR cross-site.
		if isNewSession {
			c.SetSameSite(http.SameSiteNoneMode)

			c.SetCookie(
				"checkout_session",
				sessionToken,
				7*24*60*60,
				"/",
				"",
				true, // Secure: cần HTTPS (localhost được trình duyệt miễn)
				true, // HttpOnly
			)
		}

		respondWithOrder(c, order)
	}
}

// findReusableOrder trả về đơn FE gửi lên nếu access token hợp lệ, đúng hợp
// đồng và chưa hết hạn.
func findReusableOrder(db *gorm.DB, req models.CreateOrderRequest) (models.Order, bool) {
	var order models.Order

	if req.OrderCode == "" || !validOrderAccessToken(req.OrderCode, req.AccessToken) {
		return order, false
	}

	err := db.Where("id = ? AND contract_id = ?", req.OrderCode, req.ContractID).First(&order).Error
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("generate-qr: load saved order %s: %v", req.OrderCode, err)
		}
		return order, false
	}

	if order.Status == models.OrderStatusExpired {
		return order, false
	}

	return order, true
}

// createOrder lưu Session (nếu mới) + Order trong 1 transaction, thử lại với
// mã khác nếu trùng mã đơn.
func createOrder(
	db *gorm.DB,
	session models.CheckoutSession,
	isNewSession bool,
	contractID uint,
	amount int64,
) (models.Order, error) {
	var lastErr error

	for attempt := 0; attempt < maxOrderCodeAttempts; attempt++ {
		orderCode, err := generateOrderCode()
		if err != nil {
			return models.Order{}, err
		}

		newOrder := models.Order{
			ID:                orderCode,
			CheckoutSessionID: session.ID,
			ContractID:        contractID,
			Amount:            amount,
			Status:            models.OrderStatusPending,
			CreatedAt:         time.Now(),
		}

		lastErr = db.Transaction(func(tx *gorm.DB) error {
			if isNewSession {
				if err := tx.Create(&session).Error; err != nil {
					return err
				}
			}

			return tx.Create(&newOrder).Error
		})

		if lastErr == nil {
			return newOrder, nil
		}

		if !isUniqueViolation(lastErr) {
			return models.Order{}, lastErr
		}
	}

	return models.Order{}, fmt.Errorf("create order after %d attempts: %w", maxOrderCodeAttempts, lastErr)
}

func respondWithOrder(c *gin.Context, order models.Order) {
	bank := getBankAccount()

	qrCodeURL := fmt.Sprintf(
		"https://img.vietqr.io/image/%s-%s-compact.png?amount=%d&addInfo=%s",
		bank.BankID,
		bank.AccountNo,
		order.Amount,
		url.QueryEscape(order.ID),
	)

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"order_code":   order.ID,
		"access_token": orderAccessToken(order.ID),
		"contract_id":  order.ContractID,
		"amount":       order.Amount,
		"status":       order.Status,
		"bank_name":    bank.BankName,
		"account_no":   bank.AccountNo,
		"account_name": bank.AccountName,
		"qr_code_url":  qrCodeURL,
		"message":      "Lấy thông tin thanh toán thành công",
	})
}
