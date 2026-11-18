package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimit giới hạn số request mỗi client IP trong một cửa sổ thời gian cố
// định (in-memory, theo từng instance). Đủ để chặn spam tạo đơn / đánh giá
// và dò mã; không thay thế được rate limit ở tầng proxy/CDN.
//
// Lưu ý: c.ClientIP() chỉ đúng khi TRUSTED_PROXIES được cấu hình khớp với
// reverse proxy phía trước (xem main.go), nếu không mọi client sẽ chung IP.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	type bucket struct {
		count   int
		resetAt time.Time
	}

	var (
		mu        sync.Mutex
		buckets   = make(map[string]*bucket)
		lastSweep = time.Now()
	)

	return func(c *gin.Context) {
		now := time.Now()
		key := c.ClientIP()

		mu.Lock()

		// Dọn các bucket đã hết hạn để map không phình mãi.
		if now.Sub(lastSweep) > window {
			for k, b := range buckets {
				if now.After(b.resetAt) {
					delete(buckets, k)
				}
			}
			lastSweep = now
		}

		b, ok := buckets[key]
		if !ok || now.After(b.resetAt) {
			b = &bucket{resetAt: now.Add(window)}
			buckets[key] = b
		}

		b.count++
		exceeded := b.count > limit
		retryAfter := int(b.resetAt.Sub(now).Seconds()) + 1

		mu.Unlock()

		if exceeded {
			c.Header("Retry-After", strconv.Itoa(retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút",
			})
			return
		}

		c.Next()
	}
}
