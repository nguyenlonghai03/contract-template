package controllers

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"errors"
	"log"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/nguyenlonghai03/contract-template/contract-template-be/internal/cache"
	storage "github.com/nguyenlonghai03/contract-template/contract-template-be/internal/storage"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
)

// Trình duyệt/CDN cache ảnh 1 ngày, sau đó dùng tiếp bản cũ tối đa 7 ngày
// trong lúc revalidate bằng ETag (304, không tải lại bytes).
const previewCacheControl = "public, max-age=86400, stale-while-revalidate=604800"

// PreviewProxyHandler streams a preview PNG from the private R2 bucket to the
// client. The bucket itself stays private; this unauthenticated route is what
// makes preview images "public", equivalent to the old local-disk static route.
//
// Trước đây MỖI ảnh tốn 1 query DB + 1 lần tải từ R2. Giờ danh sách key và bytes
// ảnh được cache trong RAM, kèm ETag để trình duyệt revalidate bằng 304.
func PreviewProxyHandler(db *gorm.DB, r2Client *s3.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		contractID, err := strconv.ParseUint(c.Param("contractId"), 10, 64)
		if err != nil || contractID == 0 {
			c.Status(http.StatusNotFound)
			return
		}

		filename := c.Param("filename")

		keys, err := previewKeysCache.GetOrLoad(strconv.FormatUint(contractID, 10), func() ([]string, error) {
			var contract models.Contract

			if err := db.Select("id", "preview_object_keys").First(&contract, contractID).Error; err != nil {
				return nil, err
			}

			return contract.PreviewObjectKeys, nil
		})

		if err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				log.Printf("preview keys lookup failed for contract %d: %v", contractID, err)
			}
			c.Status(http.StatusNotFound)
			return
		}

		// Only ever stream a key that is actually recorded on this contract —
		// never build an R2 key directly from user-supplied input.
		var matchedKey string

		for _, key := range keys {
			if filepath.Base(key) == filename {
				matchedKey = key
				break
			}
		}

		if matchedKey == "" {
			c.Status(http.StatusNotFound)
			return
		}

		blob, ok := previewImageCache.Get(matchedKey)

		if !ok {
			var buf bytes.Buffer

			contentType, err := storage.StreamObject(c.Request.Context(), r2Client, r2Bucket(), matchedKey, &buf)
			if err != nil {
				log.Printf("preview fetch from R2 failed (%s): %v", matchedKey, err)
				c.Status(http.StatusInternalServerError)
				return
			}

			if contentType == "" {
				contentType = "image/png"
			}

			sum := sha1.Sum(buf.Bytes())
			blob = cache.BlobEntry{
				Data:        buf.Bytes(),
				ContentType: contentType,
				ETag:        `"` + hex.EncodeToString(sum[:]) + `"`,
			}
			previewImageCache.Set(matchedKey, blob)
		}

		c.Header("Cache-Control", previewCacheControl)
		c.Header("ETag", blob.ETag)

		if match := c.GetHeader("If-None-Match"); match != "" && match == blob.ETag {
			c.Status(http.StatusNotModified)
			return
		}

		c.Data(http.StatusOK, blob.ContentType, blob.Data)
	}
}
