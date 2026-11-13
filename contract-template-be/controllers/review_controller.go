package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models" // Thay bằng package path thực tế của bạn
	"gorm.io/gorm"
)

// 1. API Gửi đánh giá mới (POST)
func CreateReviewHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.Review

		// Bind dữ liệu JSON từ client gửi lên
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
			return
		}

		// Mặc định khi khách gửi lên thì IsApproved = false (chờ duyệt)
		input.IsApproved = false

		if err := db.Create(&input).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu đánh giá: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Gửi đánh giá thành công! Đang chờ kiểm duyệt.",
			"data":    input,
		})
	}
}

// Hàm hỗ trợ ẩn bớt số điện thoại (Ví dụ: 0981234391 -> 098****391)
func maskPhoneNumber(phone string) string {
	if len(phone) < 7 {
		return phone
	}
	// Giữ lại 3 số đầu và 3 số cuối, ở giữa thay bằng ****
	return phone[:3] + "****" + phone[len(phone)-3:]
}

// 2. API Lấy danh sách đánh giá đã được duyệt của 1 hợp đồng (GET)
func GetReviewsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		contractID := c.Param("id") // Lấy ID hợp đồng từ URL params

		var reviews []models.Review
		// Chỉ lấy những review thuộc hợp đồng đó và đã được duyệt (is_approved = true)
		if err := db.Where("contract_id = ? AND is_approved = ?", contractID, true).Order("rating DESC, id DESC").Find(&reviews).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi truy vấn database"})
			return
		}

		var responseList []models.ReviewResponse
		for _, rev := range reviews {
			responseList = append(responseList, models.ReviewResponse{
				ID:         rev.ID,
				AuthorName: rev.AuthorName,
				Phone:      maskPhoneNumber(rev.Phone), // Gọi hàm ẩn SĐT
				Rating:     rev.Rating,
				Comment:    rev.Comment,
				CreatedAt:  rev.CreatedAt.Format("02/01/2006"), // Format ngày tháng năm
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"total": len(responseList),
			"data":  responseList,
		})
	}
}
