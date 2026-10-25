package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	// Import package models của bạn ở đây
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
)

// CheckOrderStatusHandler kiểm tra trạng thái đơn hàng dựa vào order_code
func CheckOrderStatusHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Lấy mã đơn hàng từ query string (?order_code=HD1792836131)
		orderCode := c.Query("order_code")

		if orderCode == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu mã đơn hàng (order_code)",
			})
			return
		}

		// Tìm đơn hàng trong Database
		var order models.Order

		if err := db.Where("id = ?", orderCode).First(&order).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy đơn hàng",
			})
			return
		}

		// Trả về trạng thái hiện tại của đơn hàng (ví dụ: "Pending" hoặc "Success")
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"status":  order.Status, // Trạng thái cập nhật từ SePay Webhook
			"message": "Lấy trạng thái thành công",
		})
	}
}
