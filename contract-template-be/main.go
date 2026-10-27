package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	database "github.com/nguyenlonghai03/contract-template/contract-template-be/database"
	routes "github.com/nguyenlonghai03/contract-template/contract-template-be/routes"
	"log"
	"time"
)

func main() {
	//  Khởi tạo Gin Engine (Router mặc định có kèm Logger và Recovery)
	router := gin.Default()

	router.SetTrustedProxies(nil)

	// Cấu hình CORS để cho phép Next.js (ví dụ chạy ở http://localhost:3000) gọi API
	config := cors.Config{}
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))

	db := database.ConnectDatabase()

	router.GET("/hello", func(c *gin.Context) {
		c.String(200, "Hello, Test 200!")
	})

	// Route kiểm tra nhanh server sống hay chết
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong! Server contract-template đang chạy mượt mà"})
	})

	routes.SetupUnProtectedRoutes(router, db)
	routes.SetupProtectedRoutes(router, db)

	// 4. Chạy server ở cổng 8080
	log.Println("Server đang khởi động tại cổng 8080...")

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Không thể khởi động server: %v", err)
	}
}
