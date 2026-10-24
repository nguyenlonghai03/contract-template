package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// ConnectDatabase khởi tạo và trả về đối tượng kết nối PostgreSQL (*gorm.DB)
func ConnectDatabase() *gorm.DB {
	err := godotenv.Load(".env")

	if err != nil {
		log.Println("Không tìm thấy file .env, hệ thống sẽ dùng biến môi trường mặc định")
	}

	host := os.Getenv("DB_HOST")

	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")

	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	if sslmode == "" {
		sslmode = "disable"
	}

	// Đây là tạo connection string
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, dbname, port, sslmode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatalf("Lỗi kết nối PostgreSQL: %v", err)
	}

	log.Println("Kết nối thành công tới PostgreSQL database:", dbname)

	return db
}
