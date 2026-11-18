package controllers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	models "github.com/nguyenlonghai03/contract-template/contract-template-be/models"
	"github.com/nguyenlonghai03/contract-template/contract-template-be/services"
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

		// Kiểm duyệt tự động: chặn từ ngữ thô tục, link/liên hệ quảng cáo, spam.
		switch services.ModerateReview(input.AuthorName, input.Comment) {
		case services.ReviewProfanity:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Nội dung đánh giá chứa từ ngữ không phù hợp, vui lòng chỉnh sửa lại"})
			return
		case services.ReviewContainsURL:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Đánh giá không được chứa đường link hoặc thông tin liên hệ"})
			return
		case services.ReviewSpam:
			c.JSON(http.StatusBadRequest, gin.H{"error": "Nội dung đánh giá không hợp lệ, vui lòng viết nhận xét về mẫu hợp đồng"})
			return
		}

		if status, message, err := checkReviewSpam(db, input); err != nil {
			log.Printf("create review: spam check: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu đánh giá, vui lòng thử lại sau"})
			return
		} else if status != 0 {
			c.JSON(status, gin.H{"error": message})
			return
		}

		review := models.Review{
			ContractID: input.ContractID,
			AuthorName: input.AuthorName,
			Phone:      input.Phone,
			Rating:     input.Rating,
			Comment:    input.Comment,
			IsApproved: true, // đã qua kiểm duyệt tự động → hiển thị ngay
		}

		if err := db.Create(&review).Error; err != nil {
			log.Printf("create review: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu đánh giá, vui lòng thử lại sau"})
			return
		}

		// Review hiển thị ngay: xoá cache danh sách review của hợp đồng này.
		publicJSONCache.Delete(fmt.Sprintf("%s%d", cacheKeyReviewsPrefix, review.ContractID))

		c.JSON(http.StatusOK, gin.H{
			"message": "Gửi đánh giá thành công! Cảm ơn bạn đã đánh giá.",
			"data": gin.H{
				"id":          review.ID,
				"contract_id": review.ContractID,
				"rating":      review.Rating,
			},
		})
	}
}

const (
	reviewSpamWindow           = 24 * time.Hour
	maxReviewsPerPhone         = 5 // số review tối đa 1 SĐT gửi trong reviewSpamWindow
	maxReviewsPerPhoneContract = 3 // số review tối đa 1 SĐT gửi cho cùng 1 hợp đồng
)

// checkReviewSpam chặn spam theo dữ liệu đã lưu. Trả status != 0 kèm thông báo
// khi phải từ chối:
//   - 1 SĐT tối đa maxReviewsPerPhoneContract review cho mỗi hợp đồng
//   - 1 SĐT tối đa maxReviewsPerPhone review / 24h
func checkReviewSpam(db *gorm.DB, input createReviewRequest) (int, string, error) {
	// Chỉ đếm review đang hiển thị: review cũ còn chờ duyệt / bị admin ẩn không tính.
	var sameContract int64
	if err := db.Model(&models.Review{}).
		Where("contract_id = ? AND phone = ? AND is_approved = ?", input.ContractID, input.Phone, true).
		Count(&sameContract).Error; err != nil {
		return 0, "", err
	}
	if sameContract >= maxReviewsPerPhoneContract {
		return http.StatusConflict, fmt.Sprintf(
			"Mỗi số điện thoại chỉ được đánh giá tối đa %d lần cho một mẫu hợp đồng",
			maxReviewsPerPhoneContract,
		), nil
	}

	since := time.Now().Add(-reviewSpamWindow)

	var recentByPhone int64
	if err := db.Model(&models.Review{}).
		Where("phone = ? AND created_at >= ?", input.Phone, since).
		Count(&recentByPhone).Error; err != nil {
		return 0, "", err
	}
	if recentByPhone >= maxReviewsPerPhone {
		return http.StatusTooManyRequests, "Bạn đã gửi quá nhiều đánh giá, vui lòng thử lại sau", nil
	}

	return 0, "", nil
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

		// CreateReviewHandler xoá key này sau khi lưu review mới nên review hiện ngay.
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
