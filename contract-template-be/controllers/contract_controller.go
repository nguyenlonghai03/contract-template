package controllers

import (
	"net/http"
	// Import package models của bạn vào đây (thay đường dẫn module cho khớp với go.mod của bạn)
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"github.com/nguyenlonghai03/contract-template/contract-template-be/services"

	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	storage "github.com/nguyenlonghai03/contract-template/contract-template-be/internal/storage"
)

const downloadPresignExpiry = 5 * time.Minute

const (
	maxPageLimit = 200

	// Thời gian (giây) trình duyệt/CDN được cache response công khai.
	listMaxAge   = 30
	detailMaxAge = 60
	typesMaxAge  = 300
)

// Chỉ các cột cần cho trang danh sách — không kéo description, file gốc,
// object key… về từ DB. (Không có category_id: cột này không tồn tại trong
// bảng contracts, field CategoryID của model luôn là 0.)
var contractListColumns = []string{
	"id", "title", "slug", "price", "created_at", "updated_at",
	"contract_type_id", "views", "downloads",
	"original_price", "rating",
}

// Cột cho trang chi tiết: thêm description + thông tin ảnh preview.
var contractDetailColumns = append(
	append([]string{}, contractListColumns...),
	"description", "preview_images", "preview_object_keys",
)

// parsePagination đọc page/limit từ query, luôn trả giá trị hợp lệ.
func parsePagination(c *gin.Context, defaultLimit int) (page, limit int) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	limit, err = strconv.Atoi(c.DefaultQuery("limit", strconv.Itoa(defaultLimit)))
	if err != nil || limit < 1 {
		limit = defaultLimit
	}

	if limit > maxPageLimit {
		limit = maxPageLimit
	}

	return page, limit
}

type contractPageRow struct {
	models.Contract
	TotalCount int64 `gorm:"column:total_count"`
}

// queryContractPage lấy 1 trang hợp đồng KÈM tổng số bản ghi trong CÙNG một
// câu truy vấn (COUNT(*) OVER()), thay vì Count + Find = 2 round-trip tới DB.
func queryContractPage(query *gorm.DB, page, limit int) (gin.H, error) {
	var rows []contractPageRow

	selectCols := make([]string, 0, len(contractListColumns)+1)
	for _, col := range contractListColumns {
		selectCols = append(selectCols, "contracts."+col)
	}
	selectCols = append(selectCols, "COUNT(*) OVER() AS total_count")

	if err := query.Session(&gorm.Session{}).
		Select(selectCols).
		Limit(limit).
		Offset((page - 1) * limit).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	var total int64

	if len(rows) > 0 {
		total = rows[0].TotalCount
	} else if page > 1 {
		// Trang vượt quá dữ liệu: không có dòng nào nên phải đếm riêng.
		if err := query.Session(&gorm.Session{}).Count(&total).Error; err != nil {
			return nil, err
		}
	}

	contracts := make([]models.PublicContract, 0, len(rows))
	for _, row := range rows {
		contracts = append(contracts, row.Contract.ToPublic(nil))
	}

	return gin.H{
		"success":    true,
		"data":       contracts,
		"total":      total,
		"page":       page,
		"limit":      limit,
		"totalPages": int(math.Ceil(float64(total) / float64(limit))),
	}, nil
}

func GetContracts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		page, limit := parsePagination(c, 7)
		keyword := strings.TrimSpace(c.Query("keyword"))

		key := fmt.Sprintf("%sall:%d:%d:%s", cacheKeyListPrefix, page, limit, strings.ToLower(keyword))

		serveCachedJSON(c, key, listMaxAge, "Lỗi khi truy vấn danh sách hợp đồng", func() (any, error) {
			// Chỉ hiển thị hợp đồng đã Published
			query := db.Model(&models.Contract{}).Where("status = ?", models.ContractStatusPublished)

			// Full-Text Search của PostgreSQL (không dấu) nếu có keyword
			if keyword != "" {
				query = query.Where(
					"to_tsvector('simple', unaccent(title)) @@ plainto_tsquery('simple', unaccent(?))",
					keyword,
				)
			}

			result, err := queryContractPage(query, page, limit)
			if err != nil {
				return nil, err
			}

			result["message"] = "Lấy danh sách hợp đồng thành công"

			return result, nil
		})
	}
}

func GetAllContractTypes(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		serveCachedJSON(c, cacheKeyContractTypes, typesMaxAge, "Lỗi khi truy vấn danh sách loại hợp đồng", func() (any, error) {
			contractTypes := []models.ContractType{}

			if err := db.Order("id ASC").Find(&contractTypes).Error; err != nil {
				return nil, err
			}

			return gin.H{
				"success": true,
				"message": "Lấy danh sách loại hợp đồng thành công",
				"data":    contractTypes,
			}, nil
		})
	}
}

// DownloadContractHandler xử lý kiểm tra và trả file Word/PDF về cho Frontend.
// Hợp đồng tạo qua Admin (có object_key trên R2) sẽ được redirect sang một
// presigned URL ngắn hạn để khách tải TRỰC TIẾP từ R2, không proxy qua server
// này. Hợp đồng cũ (chỉ có file trên local disk) vẫn dùng luồng stream cũ.
func DownloadContractHandler(db *gorm.DB, r2Client *s3.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderCode := c.Query("order_code")
		fileType := c.DefaultQuery("type", "pdf") // Mặc định là pdf nếu không truyền type

		if orderCode == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu mã đơn hàng (order_code)",
			})
			return
		}

		// 1. Kiểm tra đơn hàng trong Database
		var order models.Order
		if err := db.Where("id = ? AND status = ?", orderCode, "Success").First(&order).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Đơn hàng chưa được thanh toán hoặc không tồn tại",
			})
			return
		}

		// 2. Lấy thông tin hợp đồng liên quan đến đơn hàng
		var contract models.Contract
		if err := db.First(&contract, order.ContractID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy thông tin tài liệu hợp đồng",
			})
			return
		}

		// 3. Xác định tên file + object key (nếu có) dựa theo lựa chọn của khách
		var fileName, objectKey, contentType string

		if fileType == "word" {
			fileName = contract.WordFileName
			objectKey = contract.DocxObjectKey
			contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
		} else {
			fileName = contract.PdfFileName
			objectKey = contract.PdfObjectKey
			contentType = "application/pdf"
		}

		extension := filepath.Ext(objectKey)
		if extension == "" {
			if fileType == "word" {
				extension = ".docx"
			} else {
				extension = ".pdf"
			}
		}

		// 3b. Hợp đồng tạo qua Admin — file gốc chỉ nằm trên R2, redirect sang
		// presigned URL để tải trực tiếp từ R2, không đi qua server này.
		if objectKey != "" {
			downloadName := fmt.Sprintf("Hop-dong-%s%s", contract.Title, extension)
			disposition := fmt.Sprintf(`attachment; filename="%s"`, downloadName)

			presignedURL, err := storage.PresignGetURL(
				c.Request.Context(), r2Client, r2Bucket(), objectKey,
				downloadPresignExpiry, disposition,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"message": "Không thể tạo link tải file",
					"error":   err.Error(),
				})
				return
			}

			c.Redirect(http.StatusFound, presignedURL)
			return
		}

		// 4. Hợp đồng cũ — file gốc nằm trên local disk (giữ nguyên logic cũ)
		filePath := filepath.Join("./storage/contract", fileName)

		// Kiểm tra file vật lý có thực sự tồn tại không
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "File tài liệu không tồn tại trên hệ thống",
			})
			return
		}

		// 5. Cấu hình Header linh hoạt cho từng loại file (Rất quan trọng cho PDF)
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
		c.Header("Content-Type", contentType)

		// 6. Stream dữ liệu nhị phân của file trực tiếp về cho client
		c.File(filePath)
	}
}

// Nhận vào db *gorm.DB để thao tác với cơ sở dữ liệu
func GeneratePreviewHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Nhận tham số file PDF và ID hoặc Slug của hợp đồng cần gán
		// Ví dụ: /api/contract/generate-preview?file=thue-nha.pdf&id=1 // Id này là id của hợp đồng
		fileName := c.Query("file")
		contractID := c.Query("id")

		if fileName == "" || contractID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Thiếu tên file hoặc ID hợp đồng"})
			return
		}

		// 1. Kiểm tra xem hợp đồng có tồn tại trong Database trước hay không
		var contract models.Contract
		if err := db.First(&contract, contractID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hợp đồng trong Database"})
			return
		}

		pdfPath := filepath.Join("./storage/contract", fileName)
		// 2. Phân tách thư mục theo contractID để tránh bị gôm chung
		// Local folder: ./storage/previews/1/ (hoặc theo UUID của hợp đồng)
		outputFolder := filepath.Join("./storage/previews", contractID)

		// URL prefix tương ứng để client có thể gọi xem ảnh
		urlPrefix := fmt.Sprintf("/storage/previews/%s", contractID)

		// 1. Gọi Service cắt PDF và tạo watermark
		previewImages, err := services.GenerateContractPreviews(pdfPath, outputFolder, urlPrefix)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Gán mảng đường dẫn ảnh vào trường PreviewImages của Model
		contract.PreviewImages = previewImages

		// Lưu thay đổi xuống PostgreSQL
		if err := db.Save(&contract).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu vào Database: " + err.Error()})
			return
		}

		InvalidateContractCaches(contract.ID)

		// 3. Trả về kết quả thành công
		c.JSON(http.StatusOK, gin.H{
			"message":        "Đã tạo preview và cập nhật DB thành công!",
			"contract_id":    contract.ID,
			"preview_images": previewImages,
		})
	}
}

// GetContractByID xử lý lấy thông tin chi tiết hợp đồng theo ID
func GetContractByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy param category_id từ URL (ví dụ: /api/contracts/1)
		const notFoundMessage = "Không tìm thấy mẫu hợp đồng này"

		id, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil || id == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": notFoundMessage})
			return
		}

		key := fmt.Sprintf("%s%d", cacheKeyDetailPrefix, id)

		serveCachedJSON(c, key, detailMaxAge, "Lỗi truy vấn cơ sở dữ liệu", func() (any, error) {
			var contract models.Contract

			// Chỉ hợp đồng đã Published
			err := db.Select(contractDetailColumns).
				Where("status = ?", models.ContractStatusPublished).
				First(&contract, id).Error

			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, notFoundError(notFoundMessage)
			}

			if err != nil {
				return nil, err
			}

			// Hợp đồng tạo qua Admin chỉ có preview trên R2 (preview_object_keys),
			// chưa có preview_images cũ (local disk) — tự tính URL proxy.
			previewImages := []string(contract.PreviewImages)
			if len(previewImages) == 0 && len(contract.PreviewObjectKeys) > 0 {
				previewImages = previewURLsFor(contract.ID, contract.PreviewObjectKeys)
			}

			return gin.H{
				"success": true,
				"data":    contract.ToPublic(previewImages),
			}, nil
		})
	}
}

// GetContractsByType xử lý lấy danh sách hợp đồng theo loại/danh mục chuyên biệt
func GetContractsByType(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy contract_type từ URL Param (Ví dụ: /api/v1/contracts/type/mua-ban)
		// Phân trang (trước đây page/limit không hợp lệ có thể sinh OFFSET âm)
		page, limit := parsePagination(c, 6)

		typeID, err := strconv.ParseUint(c.Param("type"), 10, 64)
		if err != nil {
			c.JSON(http.StatusOK, gin.H{
				"success":    true,
				"message":    "Lấy danh sách hợp đồng theo loại thành công",
				"data":       []models.PublicContract{},
				"total":      0,
				"page":       page,
				"limit":      limit,
				"totalPages": 0,
			})
			return
		}

		key := fmt.Sprintf("%stype:%d:%d:%d", cacheKeyListPrefix, typeID, page, limit)

		serveCachedJSON(c, key, listMaxAge, "Lỗi khi lấy danh sách hợp đồng theo loại", func() (any, error) {
			query := db.Model(&models.Contract{}).
				Where("status = ?", models.ContractStatusPublished).
				Where("contract_type_id = ?", typeID)

			result, err := queryContractPage(query, page, limit)
			if err != nil {
				return nil, err
			}

			result["message"] = "Lấy danh sách hợp đồng theo loại thành công"

			return result, nil
		})
	}
}
