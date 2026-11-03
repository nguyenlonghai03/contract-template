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

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetContracts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Lấy tham số phân trang và từ khóa từ query string
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "7")
		keyword := c.Query("keyword") // Có thể rỗng hoặc có giá trị

		page, err := strconv.Atoi(pageStr)
		if err != nil || page < 1 {
			page = 1
		}

		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 {
			limit = 7
		}

		offset := (page - 1) * limit

		var contracts []models.Contract
		var total int64

		// Khởi tạo query base của GORM
		query := db.Model(&models.Contract{})

		// 2. Kiểm tra nếu có keyword thì áp dụng Full-Text Search thông minh của PostgreSQL
		if keyword != "" {
			searchQueryCondition := "to_tsvector('simple', unaccent(title)) @@ plainto_tsquery('simple', unaccent(?))"
			query = query.Where(searchQueryCondition, keyword)
		}

		// 3. Đếm tổng số lượng bản ghi (đã tự động tính theo điều kiện lọc nếu có keyword)
		if err := query.Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi đếm tổng số hợp đồng",
				"error":   err.Error(),
			})
			return
		}

		// 4. Truy vấn dữ liệu có phân trang (Limit, Offset) kèm điều kiện tìm kiếm (nếu có)
		if err := query.Limit(limit).Offset(offset).Find(&contracts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi truy vấn danh sách hợp đồng",
				"error":   err.Error(),
			})
			return
		}

		// 5. Tính tổng số trang
		totalPages := int(math.Ceil(float64(total) / float64(limit)))

		// 6. Trả về kết quả JSON chuẩn cấu trúc phân trang cho Frontend
		c.JSON(http.StatusOK, gin.H{
			"success":    true,
			"message":    "Lấy danh sách hợp đồng thành công",
			"data":       contracts,
			"total":      total,
			"page":       page,
			"limit":      limit,
			"totalPages": totalPages,
		})
	}
}

func GetAllContractTypes(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Dùng trực tiếp models.ContractType
		var contractTypes []models.ContractType

		if err := db.Find(&contractTypes).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi truy vấn danh sách loại hợp đồng",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Lấy danh sách loại hợp đồng thành công",
			"data":    contractTypes,
		})
	}
}

// GetContractsByCategoryID xử lý lấy danh sách hợp đồng thuộc về một ngành nghề cụ thể
func GetContractsByCategoryID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy giá trị category_id từ query string (Ví dụ: /api/v1/contracts/category?category_id=1)
		// Hoặc bạn có thể dùng c.Param("category_id") nếu thiết kế route dạng /api/v1/categories/:category_id/contracts
		categoryID := c.Param("category_id")

		if categoryID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu tham số category_id trên đường dẫn",
			})
			return
		}

		var contracts []models.Contract

		// Sử dụng mệnh đề Where của GORM để lọc dữ liệu: SELECT * FROM contracts WHERE category_id = ?;
		if err := db.Where("category_id = ?", categoryID).Find(&contracts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi truy vấn danh sách hợp đồng theo danh mục",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Lấy danh sách hợp đồng theo danh mục thành công",
			"data":    contracts,
		})
	}
}

// DownloadContractHandler xử lý kiểm tra và stream file Word/PDF về cho Frontend
func DownloadContractHandler(db *gorm.DB) gin.HandlerFunc {
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

		// 3. Xác định tên file dựa theo lựa chọn của khách
		var fileName string
		if fileType == "word" {
			fileName = contract.WordFileName
		} else {
			fileName = contract.PdfFileName
		}

		// Đường dẫn tới thư mục lưu trữ cục bộ
		filePath := filepath.Join("./storage/contract", fileName)

		// 4. Kiểm tra file vật lý có thực sự tồn tại không
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

		if fileType == "word" {
			c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
		} else {
			c.Header("Content-Type", "application/pdf") // 🟢 Ép đúng Header Content-Type cho PDF
		}

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

		pdfPath := filepath.Join("./storage/contract", fileName)
		outputFolder := "./storage/previews"
		urlPrefix := "/storage/previews"

		// 1. Gọi Service cắt PDF và tạo watermark
		previewImages, err := services.GenerateContractPreviews(pdfPath, outputFolder, urlPrefix)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 2. 🗄️ GÁN VÀO DATABASE THÔNG QUA GORM
		// Tìm hợp đồng theo ID và cập nhật cột preview_images
		var contract models.Contract
		if err := db.First(&contract, contractID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hợp đồng trong Database"})
			return
		}

		// Gán mảng đường dẫn ảnh vào trường PreviewImages của Model
		contract.PreviewImages = previewImages

		// Lưu thay đổi xuống PostgreSQL
		if err := db.Save(&contract).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lưu vào Database: " + err.Error()})
			return
		}

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
		id := c.Param("id")

		var contract models.Contract

		// Truy vấn vào PostgreSQL tìm hợp đồng theo ID
		if err := db.First(&contract, id).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{
					"error": "Không tìm thấy mẫu hợp đồng này",
				})
				return
			}
			// Lỗi hệ thống Database khác
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Lỗi truy vấn cơ sở dữ liệu: " + err.Error(),
			})
			return
		}

		// Trả về thông tin hợp đồng kèm danh sách link ảnh preview trên R2
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    contract,
		})
	}
}

// GetContractsByType xử lý lấy danh sách hợp đồng theo loại/danh mục chuyên biệt
func GetContractsByType(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy contract_type từ URL Param (Ví dụ: /api/v1/contracts/type/mua-ban)
		contractType := c.Param("type")

		// Hoặc hỗ trợ phân trang cơ bản nếu danh sách nhiều
		pageStr := c.DefaultQuery("page", "1")
		limitStr := c.DefaultQuery("limit", "6")

		page, _ := strconv.Atoi(pageStr)
		limit, _ := strconv.Atoi(limitStr)
		offset := (page - 1) * limit

		var contracts []models.Contract
		var total int64

		query := db.Model(&models.Contract{}).Where("contract_type_id = ?", contractType)

		// Đếm tổng số lượng
		query.Count(&total)

		// Truy vấn dữ liệu phân trang
		if err := query.Limit(limit).Offset(offset).Find(&contracts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi lấy danh sách hợp đồng theo loại",
				"error":   err.Error(),
			})
			return
		}

		totalPages := int(math.Ceil(float64(total) / float64(limit)))

		c.JSON(http.StatusOK, gin.H{
			"success":    true,
			"message":    "Lấy danh sách hợp đồng theo loại thành công",
			"data":       contracts,
			"total":      total,
			"page":       page,
			"limit":      limit,
			"totalPages": totalPages,
		})
	}
}
