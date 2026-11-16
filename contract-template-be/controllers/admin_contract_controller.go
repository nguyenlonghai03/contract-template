package controllers

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"gorm.io/gorm"

	storage "github.com/nguyenlonghai03/contract-template/contract-template-be/internal/storage"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"github.com/nguyenlonghai03/contract-template/contract-template-be/services"
	"github.com/nguyenlonghai03/contract-template/contract-template-be/utils"
)

func r2Bucket() string {
	return strings.TrimSpace(os.Getenv("R2_BUCKET_NAME"))
}

// CreateContractHandler creates a new draft Contract and uploads the original
// PDF/DOCX files to Cloudflare R2 under contracts/{id}/originals/ (private).
func CreateContractHandler(db *gorm.DB, r2Client *s3.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		title := strings.TrimSpace(c.PostForm("title"))
		slug := strings.TrimSpace(c.PostForm("slug"))
		description := strings.TrimSpace(c.PostForm("description"))
		contractTypeIDStr := strings.TrimSpace(c.PostForm("contract_type_id"))
		priceStr := strings.TrimSpace(c.PostForm("price"))

		if title == "" || slug == "" || contractTypeIDStr == "" || priceStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu thông tin bắt buộc (title, slug, contract_type_id, price)",
			})
			return
		}

		contractTypeID, err := strconv.ParseUint(contractTypeIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "contract_type_id không hợp lệ",
			})
			return
		}

		price, err := strconv.ParseInt(priceStr, 10, 64)
		if err != nil || price < 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "price không hợp lệ",
			})
			return
		}

		pdfFile, err := c.FormFile("pdf_file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu file PDF (pdf_file)",
			})
			return
		}

		docxFile, err := c.FormFile("docx_file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu file DOCX (docx_file)",
			})
			return
		}

		maxSize := utils.MaxUploadSizeBytes()

		if err := utils.ValidatePDF(pdfFile, maxSize); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
			return
		}

		if err := utils.ValidateDOCX(docxFile, maxSize); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
			return
		}

		// Pre-check slug uniqueness for a friendly error before touching R2.
		var existing models.Contract

		err = db.Where("slug = ?", slug).First(&existing).Error

		if err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Slug đã tồn tại, vui lòng chọn slug khác",
			})
			return
		}

		if !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi kiểm tra slug",
			})
			return
		}

		// Step A: create the draft row first to obtain contract.ID (used as the R2 key prefix).
		contract := models.Contract{
			Title:             title,
			Slug:              slug,
			Description:       description,
			Price:             price,
			ContractTypeID:    uint(contractTypeID),
			Status:            models.ContractStatusDraft,
			PreviewObjectKeys: pq.StringArray{}, // avoid inserting SQL NULL into the NOT NULL column
		}

		// Omit CategoryID: the Contract struct carries this legacy field but the
		// actual "contracts" table in this database has no category_id column.
		if err := db.Omit("CategoryID").Create(&contract).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể tạo hợp đồng",
				"error":   err.Error(),
			})
			return
		}

		ctx := c.Request.Context()
		bucket := r2Bucket()

		pdfKey := fmt.Sprintf("contracts/%d/originals/%s", contract.ID, sanitizeFilename(pdfFile.Filename))
		docxKey := fmt.Sprintf("contracts/%d/originals/%s", contract.ID, sanitizeFilename(docxFile.Filename))

		// Step B: upload both originals. Roll back the draft row (and any already-uploaded
		// file) if either upload fails, so we never leave an orphaned draft with no files.
		if err := uploadFormFile(ctx, r2Client, bucket, pdfKey, pdfFile, "application/pdf"); err != nil {
			db.Delete(&contract)

			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể upload file PDF lên R2",
				"error":   err.Error(),
			})
			return
		}

		if err := uploadFormFile(
			ctx, r2Client, bucket, docxKey, docxFile,
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		); err != nil {
			storage.DeleteObject(ctx, r2Client, bucket, pdfKey)
			db.Delete(&contract)

			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể upload file DOCX lên R2",
				"error":   err.Error(),
			})
			return
		}

		// Step C: persist the object keys now that both uploads succeeded.
		if err := db.Model(&contract).Updates(map[string]interface{}{
			"pdf_object_key":  pdfKey,
			"docx_object_key": docxKey,
		}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể lưu object key vào Database",
				"error":   err.Error(),
			})
			return
		}

		contract.PdfObjectKey = pdfKey
		contract.DocxObjectKey = docxKey

		c.JSON(http.StatusCreated, gin.H{
			"success": true,
			"message": "Tạo hợp đồng (draft) thành công",
			"data":    contract,
		})
	}
}

// AdminGeneratePreviewHandler downloads the contract's PDF from R2, generates
// watermarked preview PNGs, and uploads them to R2 under contracts/{id}/previews/.
func AdminGeneratePreviewHandler(db *gorm.DB, r2Client *s3.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var contract models.Contract

		if err := db.First(&contract, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy hợp đồng",
			})
			return
		}

		if contract.PdfObjectKey == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Hợp đồng chưa có file PDF gốc, vui lòng upload trước",
			})
			return
		}

		ctx := c.Request.Context()
		bucket := r2Bucket()

		tempPdfPath, err := storage.DownloadToTempFile(ctx, r2Client, bucket, contract.PdfObjectKey, "contract-*.pdf")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể tải file PDF từ R2",
				"error":   err.Error(),
			})
			return
		}
		defer os.Remove(tempPdfPath)

		tempOutDir, err := os.MkdirTemp("", fmt.Sprintf("contract-%d-previews-*", contract.ID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể tạo thư mục tạm",
				"error":   err.Error(),
			})
			return
		}
		defer os.RemoveAll(tempOutDir)

		// Reuse the existing blur/watermark preview generation logic as-is.
		// publicURLPrefix is left empty; filenames are derived from the returned
		// entries instead, since URLs here are R2-proxy URLs, not local paths.
		generated, err := services.GenerateContractPreviews(tempPdfPath, tempOutDir, "")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi sinh ảnh preview",
				"error":   err.Error(),
			})
			return
		}

		keys := make([]string, 0, len(generated))

		for _, entry := range generated {
			filename := strings.TrimPrefix(entry, "/")
			localPath := filepath.Join(tempOutDir, filename)

			f, err := os.Open(localPath)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể đọc ảnh preview đã sinh",
					"error":   err.Error(),
				})
				return
			}

			key := fmt.Sprintf("contracts/%d/previews/%s", contract.ID, filename)
			uploadErr := storage.UploadObject(ctx, r2Client, bucket, key, f, "image/png")
			f.Close()

			if uploadErr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể upload ảnh preview lên R2",
					"error":   uploadErr.Error(),
				})
				return
			}

			keys = append(keys, key)
		}

		if err := db.Model(&contract).Update("preview_object_keys", pq.StringArray(keys)).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể lưu danh sách ảnh preview vào Database",
				"error":   err.Error(),
			})
			return
		}

		// Ảnh preview mới ghi đè cùng key trên R2 → xoá cache ảnh/chi tiết cũ.
		InvalidateContractCaches(contract.ID)

		c.JSON(http.StatusOK, gin.H{
			"success":      true,
			"message":      "Tạo ảnh preview thành công",
			"contract_id":  contract.ID,
			"preview_urls": previewURLsFor(contract.ID, keys),
		})
	}
}

// PublishContractHandler flips a contract from draft to published, but only
// once originals and at least one preview image exist.
func PublishContractHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var contract models.Contract

		if err := db.First(&contract, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy hợp đồng",
			})
			return
		}

		var missing []string

		if contract.PdfObjectKey == "" {
			missing = append(missing, "file PDF gốc")
		}

		if contract.DocxObjectKey == "" {
			missing = append(missing, "file DOCX gốc")
		}

		if len(contract.PreviewObjectKeys) == 0 {
			missing = append(missing, "ảnh preview")
		}

		if len(missing) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Chưa thể publish, còn thiếu: " + strings.Join(missing, ", "),
			})
			return
		}

		if err := db.Model(&contract).Update("status", models.ContractStatusPublished).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Không thể publish hợp đồng",
				"error":   err.Error(),
			})
			return
		}

		contract.Status = models.ContractStatusPublished

		// Hợp đồng vừa publish phải xuất hiện ngay trong danh sách/chi tiết công khai.
		InvalidateContractCaches(contract.ID)

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Publish hợp đồng thành công",
			"data":    contract,
		})
	}
}

// GetAdminContractHandler returns the current state of a contract, including
// proxy preview URLs, for the admin wizard to re-fetch after a page refresh.
func GetAdminContractHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var contract models.Contract

		if err := db.First(&contract, id).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy hợp đồng",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success":      true,
			"data":         contract,
			"preview_urls": previewURLsFor(contract.ID, contract.PreviewObjectKeys),
		})
	}
}

func previewURLsFor(contractID uint, keys []string) []string {
	urls := make([]string, 0, len(keys))

	for _, key := range keys {
		urls = append(urls, fmt.Sprintf("/api/previews/%d/%s", contractID, filepath.Base(key)))
	}

	return urls
}

func uploadFormFile(
	ctx context.Context,
	client *s3.Client,
	bucket, key string,
	fh *multipart.FileHeader,
	contentType string,
) error {
	f, err := fh.Open()
	if err != nil {
		return fmt.Errorf("open uploaded file %q: %w", fh.Filename, err)
	}
	defer f.Close()

	return storage.UploadObject(ctx, client, bucket, key, f, contentType)
}

func sanitizeFilename(name string) string {
	name = filepath.Base(name)
	return strings.ReplaceAll(name, " ", "-")
}
