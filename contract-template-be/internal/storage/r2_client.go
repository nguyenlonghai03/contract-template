package storage

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// NewR2Client builds an S3-compatible client pointed at Cloudflare R2,
// using the R2_* environment variables already present in .env.
func NewR2Client(ctx context.Context) (*s3.Client, error) {
	accountID := strings.TrimSpace(os.Getenv("R2_ACCOUNT_ID"))
	accessKeyID := strings.TrimSpace(os.Getenv("R2_ACCESS_KEY_ID"))
	secretAccessKey := strings.TrimSpace(os.Getenv("R2_SECRET_ACCESS_KEY"))
	endpoint := strings.TrimSpace(os.Getenv("R2_ENDPOINT"))
	region := strings.TrimSpace(os.Getenv("R2_REGION"))

	if accountID == "" || accessKeyID == "" || secretAccessKey == "" || endpoint == "" {
		return nil, fmt.Errorf("missing required R2_* environment variables")
	}

	if region == "" {
		region = "auto"
	}

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKeyID, secretAccessKey, ""),
		),
	)

	if err != nil {
		return nil, fmt.Errorf("load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	return client, nil
}

// UploadObject uploads body to the given bucket/key.
func UploadObject(ctx context.Context, client *s3.Client, bucket, key string, body io.Reader, contentType string) error {
	_, err := client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})

	if err != nil {
		return fmt.Errorf("upload object %q: %w", key, err)
	}

	return nil
}

// DownloadToTempFile downloads an object to a local temp file and returns its path.
// Callers are responsible for removing the file (e.g. via defer os.Remove(path)).
func DownloadToTempFile(ctx context.Context, client *s3.Client, bucket, key, tempFilePattern string) (string, error) {
	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return "", fmt.Errorf("get object %q: %w", key, err)
	}

	defer output.Body.Close()

	tempFile, err := os.CreateTemp("", tempFilePattern)

	if err != nil {
		return "", fmt.Errorf("create temp file: %w", err)
	}

	defer tempFile.Close()

	if _, err := io.Copy(tempFile, output.Body); err != nil {
		os.Remove(tempFile.Name())
		return "", fmt.Errorf("write temp file: %w", err)
	}

	return tempFile.Name(), nil
}

// StreamObject writes the object's bytes to w and returns its content type.
func StreamObject(ctx context.Context, client *s3.Client, bucket, key string, w io.Writer) (string, error) {
	output, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return "", fmt.Errorf("get object %q: %w", key, err)
	}

	defer output.Body.Close()

	contentType := ""

	if output.ContentType != nil {
		contentType = *output.ContentType
	}

	if _, err := io.Copy(w, output.Body); err != nil {
		return "", fmt.Errorf("stream object %q: %w", key, err)
	}

	return contentType, nil
}

// PresignGetURL returns a short-lived, signed GET URL so the client downloads
// the object directly from R2 instead of proxying the bytes through this server.
// contentDisposition, if set, overrides the filename the browser saves the file as.
func PresignGetURL(
	ctx context.Context,
	client *s3.Client,
	bucket, key string,
	expiresIn time.Duration,
	contentDisposition string,
) (string, error) {
	presignClient := s3.NewPresignClient(client)

	input := &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}

	if contentDisposition != "" {
		input.ResponseContentDisposition = aws.String(contentDisposition)
	}

	request, err := presignClient.PresignGetObject(ctx, input, s3.WithPresignExpires(expiresIn))
	if err != nil {
		return "", fmt.Errorf("presign get object %q: %w", key, err)
	}

	return request.URL, nil
}

// DeleteObject removes an object from the bucket. Used for rollback on partial failures.
func DeleteObject(ctx context.Context, client *s3.Client, bucket, key string) error {
	_, err := client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	})

	if err != nil {
		return fmt.Errorf("delete object %q: %w", key, err)
	}

	return nil
}
