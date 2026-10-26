package controllers

import (
	"net/http"
	// Import package models của bạn vào đây (thay đường dẫn module cho khớp với go.mod của bạn)
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"

	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"math"
	"os"
	"path/filepath"
	"strconv"
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
		// Lấy mã đơn hàng và định dạng file từ query string (Ví dụ: /contracts/download?order_code=HD123&type=word)
		orderCode := c.Query("order_code")
		fileType := c.DefaultQuery("type", "pdf") // Mặc định là pdf nếu không truyền type

		if orderCode == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu mã đơn hàng (order_code)",
			})
			return
		}

		// 1. Kiểm tra đơn hàng trong Database có tồn tại và đã thanh toán thành công chưa
		var order models.Order

		if err := db.Where("id = ? AND status = ?", orderCode, "Success").First(&order).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "Đơn hàng chưa được thanh toán hoặc không tồn tại",
			})
			return
		}

		// 2. Lấy thông tin hợp đồng liên quan đến đơn hàng từ bảng contracts
		var contract models.Contract
		if err := db.First(&contract, order.ContractID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy thông tin tài liệu hợp đồng",
			})
			return
		}

		// 3. Xác định tên file dựa theo lựa chọn của khách (word hay pdf)
		var fileName string
		if fileType == "word" {
			fileName = contract.WordFileName // Tên file .docx lưu trong DB
		} else {
			fileName = contract.PdfFileName // Tên file .pdf lưu trong DB
		}

		// Đường dẫn tuyệt đối hoặc tương đối tới thư mục lưu trữ cục bộ trên VPS
		filePath := filepath.Join("./storage/contract", fileName)

		// 4. Kiểm tra file vật lý có thực sự tồn tại trên ổ cứng không
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "File tài liệu không tồn tại trên hệ thống",
			})
			return
		}

		// 5. Cấu hình Header để trình duyệt hiểu đây là file đính kèm và kích hoạt tải xuống
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
		c.Header("Content-Type", "application/octet-stream")

		// 6. Stream dữ liệu nhị phân của file trực tiếp về cho client
		c.File(filePath)
	}
}
