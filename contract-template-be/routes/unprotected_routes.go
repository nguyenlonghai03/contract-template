package routes

import (
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/nguyenlonghai03/contract-template/contract-template-be/controllers"
	"github.com/nguyenlonghai03/contract-template/contract-template-be/middleware"
	"gorm.io/gorm"
)

// SetupUnProtectedRoutes registers routes that do not require authentication.
func SetupUnProtectedRoutes(router *gin.Engine, db *gorm.DB, r2Client *s3.Client) {
	api := router.Group("/api")

	registerContractRoutes(api, db, r2Client)
	registerReviewRoutes(api, db)
	registerPaymentRoutes(api, db)
	registerWebhookRoutes(api, db)
	registerPreviewRoutes(api, db, r2Client)
	registerStaticRoutes(router)
}

// Preview proxy API — R2-backed, public (no admin auth) equivalent of the
// old local-disk static preview route.
func registerPreviewRoutes(api *gin.RouterGroup, db *gorm.DB, r2Client *s3.Client) {
	api.GET("/previews/:contractId/:filename", controllers.PreviewProxyHandler(db, r2Client))
}

// Contract APIs
func registerContractRoutes(api *gin.RouterGroup, db *gorm.DB, r2Client *s3.Client) {
	contracts := api.Group("/contracts")

	// Contract types
	api.GET("/contract-types", controllers.GetAllContractTypes(db))

	// Contract listing
	contracts.GET("", controllers.GetContracts(db))
	contracts.GET("/type/:type", controllers.GetContractsByType(db))

	// Contract details and reviews
	contracts.GET("/:id", controllers.GetContractByID(db))
	contracts.GET("/:id/reviews", controllers.GetReviewsHandler(db))

	// Contract download (preview được sinh qua API admin)
	api.GET("/contract/download", middleware.RateLimit(30, time.Minute), controllers.DownloadContractHandler(db, r2Client))
}

// Review APIs
func registerReviewRoutes(api *gin.RouterGroup, db *gorm.DB) {
	api.POST("/reviews", middleware.RateLimit(5, time.Minute), controllers.CreateReviewHandler(db))
}

// Payment APIs
func registerPaymentRoutes(api *gin.RouterGroup, db *gorm.DB) {
	api.POST("/payment/generate-qr", middleware.RateLimit(20, time.Minute), controllers.GenerateQRCodeHandler(db))
	// Polling 3s/lần ≈ 20 req/phút cho mỗi modal đang mở
	api.GET("/orders/status", middleware.RateLimit(90, time.Minute), controllers.CheckOrderStatusHandler(db))
}

// Bank webhook APIs
func registerWebhookRoutes(api *gin.RouterGroup, db *gorm.DB) {
	api.POST("/webhook/bank", controllers.SePayWebhookHandler(db))
}

// Static files
func registerStaticRoutes(router *gin.Engine) {
	const previewDir = "./storage/previews"

	previews := router.Group("/storage/previews")

	// Cho trình duyệt/CDN cache ảnh preview (trước đây không có Cache-Control,
	// mỗi lần xem lại đều phải tải lại toàn bộ ảnh). Chỉ áp dụng khi file tồn
	// tại để không cache nhầm response 404.
	previews.Use(func(c *gin.Context) {
		rel := filepath.Clean("/" + c.Param("filepath"))

		if info, err := os.Stat(filepath.Join(previewDir, rel)); err == nil && !info.IsDir() {
			c.Header("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800")
		}

		c.Next()
	})

	previews.Static("/", previewDir)
}
