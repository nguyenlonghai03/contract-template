package controllers

import (
	"net/http"
	// Import package models của bạn vào đây (thay đường dẫn module cho khớp với go.mod của bạn)
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"

	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"os"
	"path/filepath"
)

func GetAllContracts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Dùng trực tiếp models.Contract
		var contracts []models.Contract

		if err := db.Find(&contracts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi truy vấn danh sách hợp đồng",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Lấy danh sách hợp đồng thành công",
			"data":    contracts,
		})
	}
}

// GetContractsByCategoryID xử lý lấy danh sách hợp đồng thuộc về một danh mục cụ thể
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

// SearchContracts tìm kiếm thông minh: Không dấu, không phân biệt thứ tự từ (Full-Text Search)
func SearchContracts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		keyword := c.Query("keyword")

		if keyword == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Vui lòng nhập từ khóa tìm kiếm (keyword)",
			})
			return
		}

		var contracts []models.Contract

		// Sử dụng cơ chế Full-Text Search của PostgreSQL kết hợp unaccent:
		// - unaccent(title): Biến tiêu đề trong DB thành không dấu
		// - plainto_tsquery('simple', unaccent(?)): Biến từ khóa người dùng thành tập hợp các từ (tokens),
		//   tự động bỏ dấu và không bắt buộc phải đúng thứ tự gõ.
		// Hàm to_tsvector('simple', ...) dùng để phân tách từ dựa trên cấu hình 'simple'.
		query := "to_tsvector('simple', unaccent(title)) @@ plainto_tsquery('simple', unaccent(?))"

		err := db.Where(query, keyword).Find(&contracts).Error

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi tìm kiếm hợp đồng trong cơ sở dữ liệu",
				"error":   err.Error(),
			})
			return
		}

		// Trả về danh sách kết quả
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Tìm kiếm hợp đồng thành công",
			"total":   len(contracts),
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
