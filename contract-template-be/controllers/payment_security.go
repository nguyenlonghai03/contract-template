package controllers

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"os"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// ===================== Thông tin tài khoản nhận tiền =====================

// bankAccount là nguồn DUY NHẤT cho thông tin tài khoản nhận tiền: dùng để
// sinh QR, trả về FE và đối chiếu tài khoản đích trong webhook SePay.
type bankAccount struct {
	BankID      string // mã ngân hàng theo VietQR (vd: TPB)
	AccountNo   string
	AccountName string
	BankName    string
}

func getBankAccount() bankAccount {
	return bankAccount{
		BankID:      envOrDefault("BANK_ID", "TPB"),
		AccountNo:   envOrDefault("BANK_ACCOUNT_NO", "04494162701"),
		AccountName: envOrDefault("BANK_ACCOUNT_NAME", "NGUYEN LONG HAI"),
		BankName:    envOrDefault("BANK_NAME", "TPBank (Ngân hàng TMCP Tiên Phong)"),
	}
}

func envOrDefault(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

// ===================== Xác thực webhook SePay =====================

// sepayAuthorized kiểm tra header "Authorization: Apikey <key>" mà SePay gửi
// kèm mỗi webhook (cấu hình ở trang quản lý webhook của SePay). Thiếu
// SEPAY_WEBHOOK_API_KEY thì từ chối mọi request (fail closed).
func sepayAuthorized(c *gin.Context) bool {
	key := strings.TrimSpace(os.Getenv("SEPAY_WEBHOOK_API_KEY"))
	if key == "" {
		return false
	}

	provided := strings.TrimSpace(c.GetHeader("Authorization"))
	expected := "Apikey " + key

	return subtle.ConstantTimeCompare([]byte(provided), []byte(expected)) == 1
}

// ===================== Access token của đơn hàng =====================

// Mã đơn hàng nằm trong nội dung chuyển khoản nên KHÔNG phải bí mật (lộ trên
// sao kê, ảnh chụp màn hình…). Quyền xem trạng thái / tải file vì vậy đòi hỏi
// thêm access token = HMAC(ORDER_ACCESS_SECRET, mã đơn), chỉ trả cho trình
// duyệt đã tạo đơn. Token suy ra được từ mã đơn nên không cần lưu DB.

const orderAccessTokenLength = 32 // 128 bit

var errMissingOrderSecret = errors.New("ORDER_ACCESS_SECRET is not set")

// ValidatePaymentConfig được gọi lúc khởi động để báo lỗi cấu hình sớm.
func ValidatePaymentConfig() error {
	if strings.TrimSpace(os.Getenv("ORDER_ACCESS_SECRET")) == "" {
		return errMissingOrderSecret
	}
	return nil
}

func orderAccessToken(orderID string) string {
	secret := strings.TrimSpace(os.Getenv("ORDER_ACCESS_SECRET"))

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(strings.ToUpper(orderID)))

	return hex.EncodeToString(mac.Sum(nil))[:orderAccessTokenLength]
}

func validOrderAccessToken(orderID, token string) bool {
	if orderID == "" || len(token) != orderAccessTokenLength {
		return false
	}

	return hmac.Equal([]byte(orderAccessToken(orderID)), []byte(strings.ToLower(token)))
}

// ===================== Mã đơn hàng =====================

const (
	orderCodePrefix = "HD"
	// Mã mới: HD + 12 ký tự hex VIẾT HOA (48 bit).
	orderCodeRandomBytes = 6
	newOrderCodeLength   = len(orderCodePrefix) + orderCodeRandomBytes*2
	// Mã cũ (trước khi tăng độ dài): HD + 8 ký tự hex viết thường.
	legacyOrderCodeLength = len(orderCodePrefix) + 8
)

// Không phân biệt hoa thường (ngân hàng / người chuyển có thể viết hoa nội
// dung). Bắt buộc tối thiểu 8 ký tự hex để không khớp nhầm chữ như "HDUNG".
var orderCodePattern = regexp.MustCompile(`(?i)HD[0-9A-F]{8,}`)

// orderCodeCandidates trả về các mã đơn có thể có trong nội dung chuyển khoản
// (đã viết hoa). Mã có độ dài cố định nên phần ký tự ngân hàng nối liền phía
// sau (vd "HDAB12...FT2409") bị cắt bỏ.
func orderCodeCandidates(content string) []string {
	var candidates []string
	seen := map[string]bool{}

	add := func(code string) {
		if !seen[code] {
			seen[code] = true
			candidates = append(candidates, code)
		}
	}

	for _, match := range orderCodePattern.FindAllString(content, -1) {
		match = strings.ToUpper(match)

		if len(match) >= newOrderCodeLength {
			add(match[:newOrderCodeLength])
		}

		add(match[:legacyOrderCodeLength])
	}

	return candidates
}
