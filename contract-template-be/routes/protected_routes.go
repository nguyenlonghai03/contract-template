package routes

import (
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/nguyenlonghai03/contract-template/contract-template-be/controllers"
	"github.com/nguyenlonghai03/contract-template/contract-template-be/middleware"
)

// SetupProtectedRoutes registers routes that require admin authentication.
func SetupProtectedRoutes(router *gin.Engine, db *gorm.DB, r2Client *s3.Client) {
	admin := router.Group("/api/admin")
	admin.Use(middleware.AdminAuth())

	registerAdminContractRoutes(admin, db, r2Client)
}

// Admin contract APIs
func registerAdminContractRoutes(admin *gin.RouterGroup, db *gorm.DB, r2Client *s3.Client) {
	contracts := admin.Group("/contracts")

	contracts.POST("", controllers.CreateContractHandler(db, r2Client))
	contracts.GET("/:id", controllers.GetAdminContractHandler(db))
	contracts.POST("/:id/generate-preview", controllers.AdminGeneratePreviewHandler(db, r2Client))
	contracts.PATCH("/:id/publish", controllers.PublishContractHandler(db))
}
