package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
)

// CheckOrderStatusHandler kiểm tra trạng thái đơn hàng.
// Yêu cầu cả order_code lẫn access_token (do generate-qr trả về): mã đơn nằm
// trong nội dung chuyển khoản nên tự nó không đủ để chứng minh quyền sở hữu.
// Token sai và đơn không tồn tại trả CÙNG một response để không dò được mã.
func CheckOrderStatusHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		orderCode := c.Query("order_code")
		accessToken := c.Query("access_token")

		if orderCode == "" || accessToken == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Thiếu mã đơn hàng hoặc mã truy cập",
			})
			return
		}

		notFound := func() {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Không tìm thấy đơn hàng",
			})
		}

		if !validOrderAccessToken(orderCode, accessToken) {
			notFound()
			return
		}

		var order models.Order

		if err := db.Where("id = ?", orderCode).First(&order).Error; err != nil {
			notFound()
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"status":  order.Status, // Trạng thái cập nhật từ SePay Webhook
			"message": "Lấy trạng thái thành công",
		})
	}
}
