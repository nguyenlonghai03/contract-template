package routes

import (
	"github.com/gin-gonic/gin"
	controllers "github.com/nguyenlonghai03/contract-template/contract-template-be/controllers"
	"gorm.io/gorm"
)

func SetupUnProtectedRoutes(router *gin.Engine, db *gorm.DB) {

	api := router.Group("/api")
	{
		api.GET("/contract-types", controllers.GetAllContractTypes(db))

		api.GET("/contracts", controllers.GetContracts(db))
		api.GET("/contract/download", controllers.DownloadContractHandler(db))
		api.GET("/contract/generate-preview", controllers.GeneratePreviewHandler(db))

		api.GET("/contracts/type/:type", controllers.GetContractsByType(db))
		api.GET("/contracts/:id", controllers.GetContractByID(db))
		// Route lấy danh sách đánh giá theo ID hợp đồng
		api.GET("/contracts/:id/reviews", controllers.GetReviewsHandler(db))

		api.POST("/reviews", controllers.CreateReviewHandler(db))
		// Đăng ký route Webhook trong file main.go của bạn
		api.POST("/webhook/bank", controllers.SePayWebhookHandler(db))
		// Ví dụ đặt trong protected_routes.go (yêu cầu đăng nhập mới gọi được API mua hàng)
		api.POST("/payment/generate-qr", controllers.GenerateQRCodeHandler(db))
		api.GET("/orders/status", controllers.CheckOrderStatusHandler(db))

	}

	// Cho phép truy cập công khai vào thư mục chứa ảnh preview
	router.Static("/storage/previews", "./storage/previews")

}
