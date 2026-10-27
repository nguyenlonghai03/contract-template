package routes

import (
	"github.com/gin-gonic/gin"
	controllers "github.com/nguyenlonghai03/contract-template/contract-template-be/controllers"
	"gorm.io/gorm"
)

func SetupUnProtectedRoutes(router *gin.Engine, db *gorm.DB) {

	router.GET("/categories", controllers.GetCategories(db))
	router.GET("/contracts", controllers.GetContracts(db))
	router.GET("/contract/download", controllers.DownloadContractHandler(db))
	router.GET("/contract-types", controllers.GetAllContractTypes(db))
	router.GET("/contract/:category_id", controllers.GetContractsByCategoryID(db))
	router.GET("/contract/generate-preview", controllers.GeneratePreviewHandler(db))
	// Đăng ký route Webhook trong file main.go của bạn
	router.POST("/webhook/bank", controllers.SePayWebhookHandler(db))
	// Ví dụ đặt trong protected_routes.go (yêu cầu đăng nhập mới gọi được API mua hàng)
	router.POST("/payment/generate-qr", controllers.GenerateQRCodeHandler(db))
	router.GET("/orders/status", controllers.CheckOrderStatusHandler(db))

	// Cho phép truy cập công khai vào thư mục chứa ảnh preview
	router.Static("/storage/previews", "./storage/previews")

}
