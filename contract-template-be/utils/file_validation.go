package utils

import (
	"fmt"
	"mime/multipart"
	"os"
	"strconv"
	"strings"
)

const defaultMaxUploadSizeMB = 20

// MaxUploadSizeBytes returns the configured max upload size (MAX_UPLOAD_SIZE_MB), in bytes.
func MaxUploadSizeBytes() int64 {
	value := strings.TrimSpace(os.Getenv("MAX_UPLOAD_SIZE_MB"))

	mb := defaultMaxUploadSizeMB

	if value != "" {
		if parsed, err := strconv.Atoi(value); err == nil && parsed > 0 {
			mb = parsed
		}
	}

	return int64(mb) * 1024 * 1024
}

// ValidatePDF checks that fh is a well-formed PDF file within the size limit.
func ValidatePDF(fh *multipart.FileHeader, maxSizeBytes int64) error {
	if !strings.HasSuffix(strings.ToLower(fh.Filename), ".pdf") {
		return fmt.Errorf("file %q phải có đuôi .pdf", fh.Filename)
	}

	if fh.Size > maxSizeBytes {
		return fmt.Errorf("file %q vượt quá dung lượng cho phép (%d MB)", fh.Filename, maxSizeBytes/(1024*1024))
	}

	header, err := readHeader(fh, 5)
	if err != nil {
		return err
	}

	if string(header) != "%PDF-" {
		return fmt.Errorf("file %q không phải là PDF hợp lệ", fh.Filename)
	}

	return nil
}

// ValidateDOCX checks that fh is a well-formed DOCX (zip container) file within the size limit.
func ValidateDOCX(fh *multipart.FileHeader, maxSizeBytes int64) error {
	if !strings.HasSuffix(strings.ToLower(fh.Filename), ".docx") {
		return fmt.Errorf("file %q phải có đuôi .docx", fh.Filename)
	}

	if fh.Size > maxSizeBytes {
		return fmt.Errorf("file %q vượt quá dung lượng cho phép (%d MB)", fh.Filename, maxSizeBytes/(1024*1024))
	}

	header, err := readHeader(fh, 4)
	if err != nil {
		return err
	}

	// DOCX is a ZIP container; ZIP local file header signature is PK\x03\x04.
	if header[0] != 'P' || header[1] != 'K' || header[2] != 0x03 || header[3] != 0x04 {
		return fmt.Errorf("file %q không phải là DOCX hợp lệ", fh.Filename)
	}

	return nil
}

func readHeader(fh *multipart.FileHeader, n int) ([]byte, error) {
	f, err := fh.Open()
	if err != nil {
		return nil, fmt.Errorf("không thể đọc file %q: %w", fh.Filename, err)
	}
	defer f.Close()

	buf := make([]byte, n)

	if _, err := f.Read(buf); err != nil {
		return nil, fmt.Errorf("không thể đọc nội dung file %q: %w", fh.Filename, err)
	}

	return buf, nil
}
