package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/nguyenlonghai03/contract-template/contract-template-be/controllers"
	database "github.com/nguyenlonghai03/contract-template/contract-template-be/database"
	storage "github.com/nguyenlonghai03/contract-template/contract-template-be/internal/storage"
	routes "github.com/nguyenlonghai03/contract-template/contract-template-be/routes"
)

const (
	defaultPort = "8080"

	// HTTP Server timeouts
	readHeaderTimeout = 5 * time.Second
	readTimeout       = 30 * time.Second
	writeTimeout      = 2 * time.Minute
	idleTimeout       = 60 * time.Second

	// Database readiness timeout
	dbHealthTimeout = 3 * time.Second

	// Graceful shutdown timeout
	shutdownTimeout = 8 * time.Second
)

func main() {
	if err := run(); err != nil {
		log.Printf("Application stopped: %v", err)
		os.Exit(1)
	}
}

// run initializes and starts the application.
func run() error {
	// 1. Initialize database (also loads ./.env)
	db, err := database.ConnectDatabase()
	if err != nil {
		return fmt.Errorf("initialize database: %w", err)
	}

	// Ensure database is closed after server shutdown.
	defer func() {
		if err := database.CloseDatabase(db); err != nil {
			log.Printf("Database shutdown error: %v", err)
		}
	}()

	// Validate payment secrets (after .env is loaded) before accepting traffic.
	if err := controllers.ValidatePaymentConfig(); err != nil {
		return fmt.Errorf("invalid payment config: %w", err)
	}

	if strings.TrimSpace(os.Getenv("SEPAY_WEBHOOK_API_KEY")) == "" {
		log.Println("WARNING: SEPAY_WEBHOOK_API_KEY is not set — every SePay webhook will be rejected (401)")
	}

	// 2. Initialize Cloudflare R2 client.
	r2Client, err := storage.NewR2Client(context.Background())
	if err != nil {
		return fmt.Errorf("initialize R2 client: %w", err)
	}

	// 3. Initialize Gin router
	router, err := setupRouter(db, r2Client)
	if err != nil {
		return fmt.Errorf("initialize router: %w", err)
	}

	// 3. Initialize HTTP server
	port := getPort()

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           router,
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
	}

	// 4. Start HTTP server in background
	serverErrors := make(chan error, 1)

	go func() {
		log.Printf("HTTP server started on port %s", port)

		if err := server.ListenAndServe(); err != nil &&
			!errors.Is(err, http.ErrServerClosed) {
			serverErrors <- err
		}
	}()

	// 5. Listen for operating system shutdown signals
	ctx, stop := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT,
		syscall.SIGTERM,
	)
	defer stop()

	// 6. Đối soát SePay định kỳ (bù webhook bị lỡ khi server tắt/mất mạng).
	controllers.StartSePayReconciler(ctx, db)

	select {
	case err := <-serverErrors:
		return fmt.Errorf("HTTP server failed: %w", err)

	case <-ctx.Done():
		log.Println("Shutdown signal received")
	}

	// 6. Graceful shutdown
	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		shutdownTimeout,
	)
	defer cancel()

	log.Println("Shutting down HTTP server...")

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Graceful shutdown failed: %v", err)

		// Force close remaining connections.
		if closeErr := server.Close(); closeErr != nil {
			return fmt.Errorf(
				"shutdown error: %w; force close error: %v",
				err,
				closeErr,
			)
		}

		return fmt.Errorf("graceful shutdown timeout: %w", err)
	}

	log.Println("HTTP server stopped successfully")

	return nil
}

// setupRouter initializes Gin and registers all routes.
func setupRouter(db *gorm.DB, r2Client *s3.Client) (*gin.Engine, error) {
	// 1. Configure Gin mode
	mode := getGinMode()

	switch mode {
	case gin.DebugMode, gin.ReleaseMode, gin.TestMode:
		gin.SetMode(mode)
	default:
		return nil, fmt.Errorf("invalid GIN_MODE: %s", mode)
	}

	// 2. Create Gin engine without default middleware.
	router := gin.New()

	// 3. Register global middleware.
	router.Use(
		gin.LoggerWithConfig(gin.LoggerConfig{
			SkipPaths: []string{
				"/healthz",
				"/readyz",
				"/ping",
			},
		}),
		gin.Recovery(),
		cors.New(corsConfig()),
		// Nén gzip response JSON (danh sách/chi tiết giảm ~70-80% dung lượng).
		// Ảnh (.png...) đã nén sẵn nên bị bỏ qua theo mặc định; file tải về
		// và ảnh tĩnh cũng không cần nén.
		gzip.Gzip(
			gzip.DefaultCompression,
			gzip.WithExcludedPaths([]string{
				"/api/contract/download",
				"/storage/",
			}),
		),
	)

	// 4. Chỉ tin X-Forwarded-For từ reverse proxy đã biết (mặc định Caddy trên
	// cùng máy). Trước đây SetTrustedProxies(nil) làm ClientIP() luôn là IP
	// của Caddy nên không rate-limit theo IP được.
	if err := router.SetTrustedProxies(getTrustedProxies()); err != nil {
		return nil, fmt.Errorf("configure trusted proxies: %w", err)
	}

	// 5. Register health check routes.
	registerHealthRoutes(router, db)

	// 6. Register application routes.
	routes.SetupUnProtectedRoutes(router, db, r2Client)
	routes.SetupProtectedRoutes(router, db, r2Client)

	return router, nil
}

// registerHealthRoutes registers server and database health endpoints.
func registerHealthRoutes(router *gin.Engine, db *gorm.DB) {
	// Liveness: check whether the HTTP server is alive.
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Readiness: check whether the database is available.
	router.GET("/readyz", databaseReadinessCheck(db))

	// Keep the old endpoint for compatibility.
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong! Contract Template API is running",
		})
	})
}

// databaseReadinessCheck checks PostgreSQL connectivity.
func databaseReadinessCheck(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sqlDB, err := db.DB()
		if err != nil {
			log.Printf("Database readiness error: %v", err)

			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "not_ready",
			})
			return
		}

		ctx, cancel := context.WithTimeout(
			c.Request.Context(),
			dbHealthTimeout,
		)
		defer cancel()

		if err := sqlDB.PingContext(ctx); err != nil {
			log.Printf("Database ping failed: %v", err)

			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "not_ready",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status": "ready",
		})
	}
}

// corsConfig configures frontend access.
func corsConfig() cors.Config {
	return cors.Config{
		AllowOrigins: getAllowedOrigins(),

		AllowMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
		},

		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
			"Accept",
			"X-Requested-With",
			"X-Admin-Api-Key",
		},

		ExposeHeaders: []string{
			"Content-Disposition",
			"Content-Length",
		},

		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
}

// getAllowedOrigins returns the allowed frontend domains.
func getAllowedOrigins() []string {
	value := strings.TrimSpace(os.Getenv("ALLOWED_ORIGINS"))

	if value == "" {
		return []string{
			"http://localhost:3000",
			"https://contract-template-fe.nguyenlonghai1412.workers.dev",
		}
	}

	var origins []string

	for _, origin := range strings.Split(value, ",") {
		origin = strings.TrimSpace(origin)

		if origin != "" {
			origins = append(origins, origin)
		}
	}

	return origins
}

// getTrustedProxies đọc TRUSTED_PROXIES (IP/CIDR, phân tách bằng dấu phẩy).
// Mặc định: loopback — khớp với Caddy reverse_proxy 127.0.0.1:8080.
func getTrustedProxies() []string {
	value := strings.TrimSpace(os.Getenv("TRUSTED_PROXIES"))

	if value == "" {
		return []string{"127.0.0.1", "::1"}
	}

	var proxies []string

	for _, p := range strings.Split(value, ",") {
		if p = strings.TrimSpace(p); p != "" {
			proxies = append(proxies, p)
		}
	}

	return proxies
}

// getPort returns the application port.
func getPort() string {
	port := strings.TrimSpace(os.Getenv("PORT"))

	if port == "" {
		return defaultPort
	}

	return port
}

// getGinMode returns the Gin execution mode.
func getGinMode() string {
	mode := strings.TrimSpace(os.Getenv("GIN_MODE"))

	if mode == "" {
		return gin.ReleaseMode
	}

	return mode
}
