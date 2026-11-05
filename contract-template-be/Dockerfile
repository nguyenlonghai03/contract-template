# Sử dụng golang chính thức để build
FROM golang:1.27-alpine AS builder

WORKDIR /app

# Copy các file quản lý dependency
COPY go.mod go.sum ./
RUN go mod download

# Copy toàn bộ mã nguồn
COPY . .

# Build file thực thi
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Dùng một image siêu nhẹ để chạy ứng dụng
FROM alpine:latest
WORKDIR /app

# Copy file binary từ bản build ở trên
COPY --from=builder /app/main .

# Cloud Run sẽ tự động truyền biến môi trường PORT vào, ứng dụng Go cần lắng nghe cổng này
EXPOSE 8080

CMD ["./main"]