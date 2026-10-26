package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"

	"gorm.io/gorm"
)

// Category định nghĩa cấu trúc dữ liệu tương ứng với bảng categories trong PostgreSQL

// GetCategories xử lý lấy toàn bộ danh sách ngành nghề
func GetCategories(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var categories []models.Category

		// Sử dụng GORM để truy vấn: SELECT * FROM categories;
		if err := db.Find(&categories).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Lỗi khi truy vấn cơ sở dữ liệu",
				"error":   err.Error(),
			})
			return
		}

		// Trả về kết quả thành công dưới dạng JSON
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    categories,
		})
	}
}
