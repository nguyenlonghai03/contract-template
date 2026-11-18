package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

const frontendRevalidateTimeout = 5 * time.Second

var frontendRevalidateClient = &http.Client{Timeout: frontendRevalidateTimeout}

// notifyFrontendRevalidate báo frontend (Next.js) xoá Data Cache của hợp đồng
// sau khi dữ liệu công khai thay đổi, để trang chi tiết/danh sách không hiển
// thị giá/ảnh cũ trong khi QR đã tính theo giá mới.
//
// Cấu hình: FRONTEND_REVALIDATE_URL (vd https://<fe>/api/revalidate) và
// REVALIDATE_SECRET (trùng với secret của frontend). Thiếu một trong hai thì
// bỏ qua — frontend vẫn tự làm mới theo thời gian `revalidate`.
// Chạy nền, không chặn response của admin.
func notifyFrontendRevalidate(contractID uint) {
	endpoint := strings.TrimSpace(os.Getenv("FRONTEND_REVALIDATE_URL"))
	secret := strings.TrimSpace(os.Getenv("REVALIDATE_SECRET"))

	if endpoint == "" || secret == "" {
		return
	}

	go func() {
		body, _ := json.Marshal(map[string]uint{"contract_id": contractID})

		ctx, cancel := context.WithTimeout(context.Background(), frontendRevalidateTimeout)
		defer cancel()

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(body))
		if err != nil {
			log.Printf("frontend revalidate: build request: %v", err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+secret)

		resp, err := frontendRevalidateClient.Do(req)
		if err != nil {
			log.Printf("frontend revalidate contract %d: %v", contractID, err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("frontend revalidate contract %d: status %d", contractID, resp.StatusCode)
		}
	}()
}
