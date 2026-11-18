package services

import (
	"context"
	"fmt"
	"github.com/disintegration/imaging"
	"image"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/fogleman/gg"
)

// pdftoppm có thể treo hoặc tốn rất nhiều CPU với PDF lớn/độc hại: luôn giới hạn thời gian.
const pdfRenderTimeout = 2 * time.Minute

// GenerateContractPreviews nhận vào đường dẫn file PDF, trả về danh sách URL/đường dẫn các ảnh preview
func GenerateContractPreviews(ctx context.Context, pdfPath string, outputDir string, publicURLPrefix string) ([]string, error) {
	// 1. Đảm bảo thư mục lưu ảnh preview tồn tại
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		return nil, fmt.Errorf("không thể tạo thư mục output: %v", err)
	}

	baseName := filepath.Base(pdfPath)
	ext := filepath.Ext(baseName)
	nameWithoutExt := strings.TrimSuffix(baseName, ext)

	// 2. Chạy lệnh pdftoppm để xuất toàn bộ trang PDF ra file PNG tạm thời
	// Yêu cầu máy chủ phải đã cài đặt công cụ poppler-utils (lệnh pdftoppm)
	tempPrefix := filepath.Join(outputDir, "temp_"+nameWithoutExt)
	renderCtx, cancel := context.WithTimeout(ctx, pdfRenderTimeout)
	defer cancel()

	cmd := exec.CommandContext(renderCtx, "pdftoppm", "-png", "-r", "150", pdfPath, tempPrefix)
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("lỗi khi chạy pdftoppm (kiểm tra poppler-utils): %v", err)
	}

	// 3. Quét các file ảnh tạm vừa sinh ra trong thư mục
	files, err := os.ReadDir(outputDir)
	if err != nil {
		return nil, fmt.Errorf("không đọc được thư mục output: %v", err)
	}

	var previewImagePaths []string

	for _, file := range files {
		fileName := file.Name()
		// Chỉ lọc các file ảnh tạm thuộc về hợp đồng này (ví dụ: temp_hop-dong-1.png, temp_hop-dong-2.png)
		if strings.HasPrefix(fileName, "temp_"+nameWithoutExt+"-") && strings.HasSuffix(fileName, ".png") {
			tempImgPath := filepath.Join(outputDir, fileName)

			// Đặt lại tên file chuẩn, ví dụ: hop-dong-p1.png, hop-dong-p2.png
			pageSuffix := strings.TrimPrefix(fileName, "temp_"+nameWithoutExt)
			finalImgName := nameWithoutExt + pageSuffix
			finalImgPath := filepath.Join(outputDir, finalImgName)

			// 🔍 KIỂM TRA THÔNG MINH: Nếu file ảnh preview đã tồn tại rồi thì BỎ QUA không render lại
			if _, err := os.Stat(finalImgPath); err == nil {
				os.Remove(tempImgPath) // Xóa file tạm đi
				publicURL := fmt.Sprintf("%s/%s", publicURLPrefix, finalImgName)
				previewImagePaths = append(previewImagePaths, publicURL)
				continue
			}

			// 4. Nếu chưa có, tiến hành vẽ Watermark & Lớp che lên ảnh
			err := ApplyBlurRightSideEffect(tempImgPath, finalImgPath)
			os.Remove(tempImgPath) // Xóa file tạm sau khi xử lý xong
			if err != nil {
				fmt.Printf("⚠️ Lỗi vẽ watermark cho trang %s: %v\n", fileName, err)
				continue
			}

			// 5. Lưu đường dẫn public để chuẩn bị gán vào DB
			publicURL := fmt.Sprintf("%s/%s", publicURLPrefix, finalImgName)
			previewImagePaths = append(previewImagePaths, publicURL)
		}
	}

	return previewImagePaths, nil
}

func ApplyBlurRightSideEffect(inputImagePath string, outputImagePath string) error {
	// 1. Đọc ảnh gốc bằng thư viện imaging
	src, err := imaging.Open(inputImagePath)
	if err != nil {
		return err
	}

	bounds := src.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	// 2. Xác định vùng cần làm mờ (Ví dụ: 30% bên phải, chừa 100px ở rìa phải cho banner xanh)
	bannerWidth := 100
	blurWidth := int(float64(width) * 0.30)
	blurX := width - bannerWidth - blurWidth

	// Cắt lấy phần bên phải cần blur
	cropRect := image.Rect(blurX, 0, width-bannerWidth, height)
	croppedImg := imaging.Crop(src, cropRect)

	// 3. Áp dụng hiệu ứng Blur mạnh (Gaussian Blur với bán kính lớn, ví dụ sigma = 15 hoặc 20 để không thể đọc được chữ)
	blurredImg := imaging.Blur(croppedImg, 18.0)

	// 4. Dán chồng phần ảnh đã blur trở lại ảnh gốc
	dst := imaging.Clone(src)
	dst = imaging.Paste(dst, blurredImg, image.Pt(blurX, 0))

	// 5. Dùng gg để vẽ dải banner xanh lá bên phải cùng lên trên kết quả
	dc := gg.NewContext(width, height)

	// Vẽ lại ảnh đã blur lên context của gg
	dc.DrawImage(dst, 0, 0)

	// Vẽ dải banner màu xanh lá ở mép phải
	dc.SetHexColor("#00875A")
	dc.DrawRectangle(float64(width-bannerWidth), 0, float64(bannerWidth), float64(height))
	dc.Fill()

	// (Tùy chọn) Thêm text hoặc icon trên banner xanh lá tại đây nếu muốn

	// 6. Lưu file hoàn thiện
	return dc.SavePNG(outputImagePath)
}
