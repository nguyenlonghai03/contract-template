package database

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	defaultDBHost  = "localhost"
	defaultDBPort  = "5432"
	defaultSSLMode = "disable"

	defaultMaxOpenConns = 10
	defaultMaxIdleConns = 5

	defaultConnMaxLifetime = 30 * time.Minute
	defaultConnMaxIdleTime = 5 * time.Minute

	defaultConnectTimeout = 10 * time.Second
)

// Config contains PostgreSQL connection settings.
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string

	MaxOpenConns int
	MaxIdleConns int

	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration

	ConnectTimeout time.Duration
}

// ConnectDatabase initializes PostgreSQL and returns a GORM connection.
func ConnectDatabase() (*gorm.DB, error) {
	// 1. Load environment variables.
	if err := loadEnv(); err != nil {
		return nil, err
	}

	// 2. Read and validate database configuration.
	cfg, err := loadConfig()
	if err != nil {
		return nil, err
	}

	// 3. Create PostgreSQL connection.
	db, err := gorm.Open(
		postgres.Open(buildDSN(cfg)),
		&gorm.Config{
			// Không bọc mỗi câu INSERT/UPDATE đơn lẻ trong transaction riêng
			// (bớt 2 round-trip BEGIN/COMMIT tới DB). Các luồng cần atomic như
			// webhook thanh toán đã dùng db.Transaction tường minh.
			SkipDefaultTransaction: true,

			NowFunc: func() time.Time {
				return time.Now().In(
					time.FixedZone("Asia/Ho_Chi_Minh", 7*60*60),
				)
			},
		},
	)

	if err != nil {
		return nil, fmt.Errorf("connect to PostgreSQL: %w", err)
	}

	// 4. Get underlying SQL connection.
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("get SQL connection: %w", err)
	}

	// 5. Configure connection pool.
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)
	sqlDB.SetConnMaxIdleTime(cfg.ConnMaxIdleTime)

	// 6. Verify actual database connectivity.
	ctx, cancel := context.WithTimeout(
		context.Background(),
		cfg.ConnectTimeout,
	)
	defer cancel()

	if err := sqlDB.PingContext(ctx); err != nil {
		_ = sqlDB.Close()

		return nil, fmt.Errorf("PostgreSQL ping failed: %w", err)
	}

	log.Printf(
		"Connected to PostgreSQL successfully (database: %s)",
		cfg.DBName,
	)

	return db, nil
}

// CloseDatabase closes the PostgreSQL connection pool.
func CloseDatabase(db *gorm.DB) error {
	if db == nil {
		return nil
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("get SQL connection for closing: %w", err)
	}

	if err := sqlDB.Close(); err != nil {
		return fmt.Errorf("close PostgreSQL connection: %w", err)
	}

	log.Println("PostgreSQL connection closed")

	return nil
}

// loadEnv loads local .env configuration.
// Existing environment variables are not overwritten.
func loadEnv() error {
	err := godotenv.Load(".env")

	if err != nil {
		if os.IsNotExist(err) {
			log.Println(".env file not found, using system environment variables")
			return nil
		}

		return fmt.Errorf("load .env file: %w", err)
	}

	return nil
}

// loadConfig reads and validates environment variables.
func loadConfig() (Config, error) {
	cfg := Config{
		Host:     getEnv("DB_HOST", defaultDBHost),
		Port:     getEnv("DB_PORT", defaultDBPort),
		User:     strings.TrimSpace(os.Getenv("DB_USER")),
		Password: os.Getenv("DB_PASSWORD"),
		DBName:   strings.TrimSpace(os.Getenv("DB_NAME")),
		SSLMode:  getEnv("DB_SSLMODE", defaultSSLMode),

		MaxOpenConns: getIntEnv(
			"DB_MAX_OPEN_CONNS",
			defaultMaxOpenConns,
		),

		MaxIdleConns: getIntEnv(
			"DB_MAX_IDLE_CONNS",
			defaultMaxIdleConns,
		),

		ConnMaxLifetime: getDurationEnv(
			"DB_CONN_MAX_LIFETIME",
			defaultConnMaxLifetime,
		),

		ConnMaxIdleTime: getDurationEnv(
			"DB_CONN_MAX_IDLE_TIME",
			defaultConnMaxIdleTime,
		),

		ConnectTimeout: getDurationEnv(
			"DB_CONNECT_TIMEOUT",
			defaultConnectTimeout,
		),
	}

	// Validate required fields.
	if cfg.User == "" {
		return Config{}, fmt.Errorf("DB_USER is required")
	}

	if cfg.DBName == "" {
		return Config{}, fmt.Errorf("DB_NAME is required")
	}

	// Validate port.
	port, err := strconv.Atoi(cfg.Port)
	if err != nil || port < 1 || port > 65535 {
		return Config{}, fmt.Errorf("invalid DB_PORT: %s", cfg.Port)
	}

	// Validate SSL mode.
	switch cfg.SSLMode {
	case "disable", "allow", "prefer", "require", "verify-ca", "verify-full":
	default:
		return Config{}, fmt.Errorf("invalid DB_SSLMODE: %s", cfg.SSLMode)
	}

	// Validate connection pool.
	if cfg.MaxIdleConns > cfg.MaxOpenConns {
		return Config{}, fmt.Errorf(
			"DB_MAX_IDLE_CONNS cannot exceed DB_MAX_OPEN_CONNS",
		)
	}

	return cfg, nil
}

// buildDSN creates a PostgreSQL connection URL.

func buildDSN(cfg Config) string {
	connectionURL := &url.URL{
		Scheme: "postgres",
		User:   url.UserPassword(cfg.User, cfg.Password),
		Host:   net.JoinHostPort(cfg.Host, cfg.Port),
		Path:   "/" + cfg.DBName,
	}

	query := connectionURL.Query()

	query.Set("sslmode", cfg.SSLMode)

	connectionURL.RawQuery = query.Encode()

	return connectionURL.String()
}

// getEnv returns an environment variable or fallback value.
func getEnv(key string, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))

	if value == "" {
		return fallback
	}

	return value
}

// getIntEnv returns an integer environment variable or fallback.
func getIntEnv(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))

	if value == "" {
		return fallback
	}

	result, err := strconv.Atoi(value)

	if err != nil || result < 1 {
		log.Printf(
			"Invalid %s, using default value: %d",
			key,
			fallback,
		)

		return fallback
	}

	return result
}

// getDurationEnv returns a duration environment variable or fallback.
func getDurationEnv(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))

	if value == "" {
		return fallback
	}

	result, err := time.ParseDuration(value)

	if err != nil || result <= 0 {
		log.Printf(
			"Invalid %s, using default value: %s",
			key,
			fallback,
		)

		return fallback
	}

	return result
}
