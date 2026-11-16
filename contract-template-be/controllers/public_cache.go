package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/nguyenlonghai03/contract-template/contract-template-be/internal/cache"
)

// Cache trong bộ nhớ cho các API đọc công khai. Mục tiêu chính là che độ trễ
// của Postgres từ xa (Neon, có thể "ngủ" khi không có truy cập): request lặp
// lại được trả ngay từ RAM, còn dữ liệu cũ được làm mới ở chế độ nền.
var (
	// Body JSON đã serialize sẵn của các API công khai.
	//   - < 30s: trả thẳng từ RAM
	//   - 30s..6h: trả bản cũ ngay + làm mới nền
	publicJSONCache = cache.NewSWR[[]byte](30*time.Second, 6*time.Hour, 2000)

	// Danh sách object key ảnh preview của từng hợp đồng (cho PreviewProxyHandler).
	previewKeysCache = cache.NewSWR[[]string](5*time.Minute, 24*time.Hour, 2000)

	// Bytes ảnh preview tải từ R2: tối đa 128MB, mỗi ảnh tối đa 10MB.
	previewImageCache = cache.NewBytesLRU(128<<20, 10<<20)
)

const (
	cacheKeyContractTypes = "types"
	cacheKeyListPrefix    = "list:"
	cacheKeyDetailPrefix  = "detail:"
	cacheKeyReviewsPrefix = "reviews:"
)

// httpError cho phép hàm build trả về lỗi có status cụ thể (vd 404) mà không
// bị cache lại.
type httpError struct {
	status int
	body   gin.H
}

func (e *httpError) Error() string {
	return fmt.Sprintf("http %d", e.status)
}

func notFoundError(message string) error {
	return &httpError{status: http.StatusNotFound, body: gin.H{"success": false, "error": message}}
}

// serveCachedJSON trả về JSON 200 từ cache (hoặc build nếu chưa có) kèm header
// Cache-Control cho trình duyệt/CDN. Lỗi không bao giờ được cache.
func serveCachedJSON(
	c *gin.Context,
	key string,
	maxAgeSeconds int,
	errMessage string,
	build func() (any, error),
) {
	body, err := publicJSONCache.GetOrLoad(key, func() ([]byte, error) {
		value, err := build()
		if err != nil {
			return nil, err
		}

		return json.Marshal(value)
	})

	if err != nil {
		var he *httpError
		if errors.As(err, &he) {
			c.JSON(he.status, he.body)
			return
		}

		log.Printf("public endpoint %s failed: %v", c.Request.URL.Path, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": errMessage,
		})
		return
	}

	c.Header("Cache-Control", fmt.Sprintf(
		"public, max-age=%d, stale-while-revalidate=%d",
		maxAgeSeconds, maxAgeSeconds*10,
	))
	c.Data(http.StatusOK, "application/json; charset=utf-8", body)
}

// InvalidateContractCaches xoá mọi cache liên quan tới 1 hợp đồng. Gọi sau
// khi admin tạo / sinh preview / publish hợp đồng.
func InvalidateContractCaches(contractID uint) {
	id := fmt.Sprint(contractID)

	publicJSONCache.DeletePrefix(cacheKeyListPrefix)
	publicJSONCache.Delete(cacheKeyDetailPrefix + id)
	previewKeysCache.Delete(id)
	previewImageCache.DeletePrefix(fmt.Sprintf("contracts/%s/", id))
}
