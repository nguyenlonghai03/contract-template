package controllers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"gorm.io/gorm"
)

// createReviewRequest chỉ nhận đúng các field khách được phép gửi. Không bind
// thẳng vào models.Review (có gorm.Model) để client không ghi được id,
// created_at, deleted_at hay is_approved.
type createReviewRequest struct {
	ContractID uint   `json:"contract_id" binding:"required"`
	AuthorName string `json:"author_name" binding:"required,max=100"`
	Phone      string `json:"phone" binding:"required,max=20"`
	Rating     int    `json:"rating" binding:"required,min=1,max=5"`
	Comment    string `json:"comment" binding:"required,max=2000"`
}

// 1. API Gửi đánh giá mới (POST)
func CreateReviewHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input createReviewRequest

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu đánh giá không hợp lệ, vui lòng kiểm tra lại"})
			return
		}

		input.AuthorName = strings.TrimSpace(input.AuthorName)
		input.Phone = strings.TrimSpace(input.Phone)
		input.Comment = strings.TrimSpace(input.Comment)

		if input.AuthorName == "" || input.Phone == "" || input.Comment == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung"})
			return
		}

		// Chỉ cho đánh giá hợp đồng đang được bán công khai
		var count int64
		if err := db.Model(&models.Contract{}).
			Where("id = ? AND status = ?", input.ContractID, models.ContractStatusPublished).
			Count(&count).Error; err != nil {
			log.Printf("create review: check contract %d: %v", input.ContractID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu đánh giá, vui lòng thử lại sau"})
			return
		}

		if count == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy mẫu hợp đồng"})
			return
		}

		review := models.Review{
			ContractID: input.ContractID,
			AuthorName: input.AuthorName,
			Phone:      input.Phone,
			Rating:     input.Rating,
			Comment:    input.Comment,
			IsApproved: false, // chờ kiểm duyệt
		}

		if err := db.Create(&review).Error; err != nil {
			log.Printf("create review: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu đánh giá, vui lòng thử lại sau"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Gửi đánh giá thành công! Đang chờ kiểm duyệt.",
			"data": gin.H{
				"id":          review.ID,
				"contract_id": review.ContractID,
				"rating":      review.Rating,
			},
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
		contractID, err := strconv.ParseUint(c.Param("id"), 10, 64)
		if err != nil || contractID == 0 {
			c.JSON(http.StatusOK, gin.H{"total": 0, "data": []models.ReviewResponse{}})
			return
		}

		key := fmt.Sprintf("%s%d", cacheKeyReviewsPrefix, contractID)

		// Đánh giá mới luôn phải chờ duyệt nên cache ngắn hạn không làm sai dữ liệu.
		serveCachedJSON(c, key, listMaxAge, "Lỗi khi truy vấn database", func() (any, error) {
			var reviews []models.Review

			// Chỉ lấy những review thuộc hợp đồng đó và đã được duyệt (is_approved = true)
			if err := db.Where("contract_id = ? AND is_approved = ?", contractID, true).
				Order("rating DESC, id DESC").
				Find(&reviews).Error; err != nil {
				return nil, err
			}

			// Luôn trả mảng (không phải null) khi chưa có đánh giá
			responseList := make([]models.ReviewResponse, 0, len(reviews))
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

			return gin.H{
				"total": len(responseList),
				"data":  responseList,
			}, nil
		})
	}
}
