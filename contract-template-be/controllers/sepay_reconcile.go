package controllers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"gorm.io/gorm"
)

// Job đối soát SePay: webhook có thể bị lỡ (server mất điện/mạng lâu hơn
// ~33 phút SePay retry). Job này định kỳ kéo danh sách giao dịch tiền vào từ
// SePay User API và xử lý những giao dịch chưa có trong DB bằng ĐÚNG logic
// của webhook (processSePayTransaction).
//
// Bật khi có SEPAY_API_TOKEN (tạo ở my.sepay.vn → Cấu hình công ty → API Access).

const (
	defaultSePayAPIBaseURL        = "https://my.sepay.vn"
	defaultSePayReconcileEvery    = 5 * time.Minute
	defaultSePayReconcileLookback = 72 * time.Hour
	sepayReconcileLimit           = 500
	sepayAPITimeout               = 20 * time.Second
	sepayMaxResponseBytes         = 10 << 20
)

// SePay trả thời gian theo giờ Việt Nam.
var sepayTimezone = time.FixedZone("ICT", 7*60*60)

type sepayAPITransaction struct {
	ID                 string `json:"id"`
	BankBrandName      string `json:"bank_brand_name"`
	AccountNumber      string `json:"account_number"`
	TransactionDate    string `json:"transaction_date"`
	AmountIn           string `json:"amount_in"`
	AmountOut          string `json:"amount_out"`
	TransactionContent string `json:"transaction_content"`
	ReferenceNumber    string `json:"reference_number"`
}

type sepayAPIListResponse struct {
	Status       int                   `json:"status"`
	Error        any                   `json:"error"`
	Transactions []sepayAPITransaction `json:"transactions"`
}

type sepayReconciler struct {
	db       *gorm.DB
	client   *http.Client
	baseURL  string
	token    string
	account  string
	every    time.Duration
	lookback time.Duration
	now      func() time.Time
}

// StartSePayReconciler chạy job đối soát trong goroutine nền cho tới khi ctx
// bị huỷ. Không có SEPAY_API_TOKEN thì không làm gì.
func StartSePayReconciler(ctx context.Context, db *gorm.DB) {
	token := strings.TrimSpace(os.Getenv("SEPAY_API_TOKEN"))
	if token == "" {
		log.Println("sepay reconcile: SEPAY_API_TOKEN not set, reconciliation disabled")
		return
	}

	r := &sepayReconciler{
		db:       db,
		client:   &http.Client{Timeout: sepayAPITimeout},
		baseURL:  envOrDefault("SEPAY_API_BASE_URL", defaultSePayAPIBaseURL),
		token:    token,
		account:  getBankAccount().AccountNo,
		every:    durationEnv("SEPAY_RECONCILE_INTERVAL", defaultSePayReconcileEvery),
		lookback: durationEnv("SEPAY_RECONCILE_LOOKBACK", defaultSePayReconcileLookback),
		now:      time.Now,
	}

	log.Printf("sepay reconcile: enabled (every %s, lookback %s)", r.every, r.lookback)

	go r.loop(ctx)
}

func (r *sepayReconciler) loop(ctx context.Context) {
	// Chạy ngay khi khởi động: bù các webhook bị lỡ trong lúc server tắt.
	r.runOnce(ctx)

	ticker := time.NewTicker(r.every)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			r.runOnce(ctx)
		}
	}
}

func (r *sepayReconciler) runOnce(ctx context.Context) {
	txs, err := r.fetchTransactions(ctx)
	if err != nil {
		if !errors.Is(err, context.Canceled) {
			log.Printf("sepay reconcile: fetch transactions: %v", err)
		}
		return
	}

	matched := 0
	for _, apiTx := range txs {
		transaction, ok := toSePayTransaction(apiTx)
		if !ok {
			continue
		}

		// Đã có (do webhook hoặc lần đối soát trước) thì bỏ qua. So thêm theo
		// reference_code phòng trường hợp ID của API khác ID của webhook.
		seen, err := r.alreadyRecorded(transaction)
		if err != nil {
			log.Printf("sepay reconcile: lookup transaction %d: %v", transaction.SePayID, err)
			continue
		}
		if seen {
			continue
		}

		outcome, err := processSePayTransaction(r.db, transaction)
		if err != nil {
			log.Printf("sepay reconcile: process transaction %d: %v", transaction.SePayID, err)
			continue
		}

		if outcome == sepayOutcomeMatched {
			matched++
			log.Printf("sepay reconcile: recovered missed payment, transaction %d → order %v",
				transaction.SePayID, orderCodeCandidates(transaction.Content))
		}
	}

	if matched > 0 {
		log.Printf("sepay reconcile: %d order(s) marked paid", matched)
	}
}

func (r *sepayReconciler) alreadyRecorded(t models.SePayTransaction) (bool, error) {
	q := r.db.Model(&models.SePayTransaction{}).Where("se_pay_id = ?", t.SePayID)
	if t.ReferenceCode != "" {
		q = q.Or("reference_code = ? AND transfer_amount = ?", t.ReferenceCode, t.TransferAmount)
	}

	var count int64
	if err := q.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *sepayReconciler) fetchTransactions(ctx context.Context) ([]sepayAPITransaction, error) {
	since := r.now().Add(-r.lookback).In(sepayTimezone).Format("2006-01-02 15:04:05")

	params := url.Values{}
	params.Set("transaction_date_min", since)
	params.Set("limit", strconv.Itoa(sepayReconcileLimit))
	if r.account != "" {
		params.Set("account_number", r.account)
	}

	endpoint := strings.TrimRight(r.baseURL, "/") + "/userapi/transactions/list?" + params.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+r.token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := r.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, sepayMaxResponseBytes))
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("sepay API returned HTTP %d", resp.StatusCode)
	}

	var parsed sepayAPIListResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("decode sepay response: %w", err)
	}
	if parsed.Status != 0 && parsed.Status != http.StatusOK {
		return nil, fmt.Errorf("sepay API status %d: %v", parsed.Status, parsed.Error)
	}

	return parsed.Transactions, nil
}

// toSePayTransaction chuyển giao dịch từ User API sang cùng model mà webhook
// lưu. Bỏ qua giao dịch tiền ra hoặc dữ liệu không hợp lệ.
func toSePayTransaction(t sepayAPITransaction) (models.SePayTransaction, bool) {
	id, err := strconv.ParseUint(strings.TrimSpace(t.ID), 10, 64)
	if err != nil || id == 0 {
		return models.SePayTransaction{}, false
	}

	amountIn, ok := parseSePayAmount(t.AmountIn)
	if !ok || amountIn <= 0 {
		return models.SePayTransaction{}, false
	}

	return models.SePayTransaction{
		SePayID:         uint(id),
		ReferenceCode:   strings.TrimSpace(t.ReferenceNumber),
		AccountNumber:   strings.TrimSpace(t.AccountNumber),
		TransferAmount:  amountIn,
		Content:         t.TransactionContent,
		Gateway:         t.BankBrandName,
		TransactionDate: t.TransactionDate,
	}, true
}

// parseSePayAmount đọc số tiền dạng chuỗi thập phân ("150000.00") thành VND.
// Số có phần lẻ khác 0 bị từ chối để không làm tròn sai số tiền.
func parseSePayAmount(s string) (int64, bool) {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0, false
	}

	f, err := strconv.ParseFloat(s, 64)
	if err != nil || math.IsNaN(f) || math.IsInf(f, 0) || f != math.Trunc(f) {
		return 0, false
	}

	return int64(f), true
}

func durationEnv(key string, fallback time.Duration) time.Duration {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}

	d, err := time.ParseDuration(v)
	if err != nil || d <= 0 {
		log.Printf("invalid %s=%q, using %s", key, v, fallback)
		return fallback
	}
	return d
}
