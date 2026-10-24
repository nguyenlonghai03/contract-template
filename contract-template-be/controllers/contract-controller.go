package controllers

import (
	"net/http"
	// Import package models của bạn vào đây (thay đường dẫn module cho khớp với go.mod của bạn)
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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
