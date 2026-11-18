package controllers

import (
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestOrderCodeCandidates(t *testing.T) {
	tests := []struct {
		name    string
		content string
		want    []string
	}{
		{"new code", "HDAB12CD34EF56 thanh toan", []string{"HDAB12CD34EF56", "HDAB12CD34"}},
		{"lowercase content", "hdab12cd34ef56", []string{"HDAB12CD34EF56", "HDAB12CD34"}},
		{"bank suffix glued", "HDAB12CD34EF56FT24091234", []string{"HDAB12CD34EF56", "HDAB12CD34"}},
		{"legacy code", "CK HDab12cd34 nguyen van a", []string{"HDAB12CD34"}},
		{"name with HD is ignored", "NGUYEN THI HDUNG HDAB12CD34EF56", []string{"HDAB12CD34EF56", "HDAB12CD34"}},
		{"no code", "chuyen tien an trua", nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := orderCodeCandidates(tt.content)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("orderCodeCandidates(%q) = %v, want %v", tt.content, got, tt.want)
			}
		})
	}
}

func TestGenerateOrderCodeFormat(t *testing.T) {
	code, err := generateOrderCode()
	if err != nil {
		t.Fatal(err)
	}

	if len(code) != newOrderCodeLength || code != strings.ToUpper(code) || !strings.HasPrefix(code, "HD") {
		t.Fatalf("unexpected order code %q", code)
	}

	if got := orderCodeCandidates("ND " + code + " ABC"); len(got) == 0 || got[0] != code {
		t.Fatalf("generated code not extracted: %v", got)
	}
}

func TestOrderAccessToken(t *testing.T) {
	t.Setenv("ORDER_ACCESS_SECRET", "test-secret")

	token := orderAccessToken("HDAB12CD34EF56")

	if len(token) != orderAccessTokenLength {
		t.Fatalf("token length = %d", len(token))
	}

	if !validOrderAccessToken("HDAB12CD34EF56", token) {
		t.Fatal("valid token rejected")
	}

	if !validOrderAccessToken("HDAB12CD34EF56", strings.ToUpper(token)) {
		t.Fatal("token should be case-insensitive")
	}

	if validOrderAccessToken("HDAB12CD34EF57", token) {
		t.Fatal("token accepted for another order")
	}

	if validOrderAccessToken("HDAB12CD34EF56", "") {
		t.Fatal("empty token accepted")
	}

	t.Setenv("ORDER_ACCESS_SECRET", "other-secret")

	if validOrderAccessToken("HDAB12CD34EF56", token) {
		t.Fatal("token accepted after secret rotation")
	}
}

func TestSepayAuthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	newCtx := func(auth string) *gin.Context {
		c, _ := gin.CreateTestContext(httptest.NewRecorder())
		c.Request = httptest.NewRequest("POST", "/api/webhook/bank", nil)
		if auth != "" {
			c.Request.Header.Set("Authorization", auth)
		}
		return c
	}

	t.Setenv("SEPAY_WEBHOOK_API_KEY", "")
	if sepayAuthorized(newCtx("Apikey ")) {
		t.Fatal("must fail closed when key is not configured")
	}

	t.Setenv("SEPAY_WEBHOOK_API_KEY", "abc123")

	if !sepayAuthorized(newCtx("Apikey abc123")) {
		t.Fatal("correct key rejected")
	}

	for _, bad := range []string{"", "Apikey wrong", "abc123", "Bearer abc123"} {
		if sepayAuthorized(newCtx(bad)) {
			t.Fatalf("bad header %q accepted", bad)
		}
	}
}

func TestAttachmentDisposition(t *testing.T) {
	got := attachmentDisposition(`Thuê nhà "đặc biệt"`, "thue-nha", ".pdf")

	want := `attachment; filename="Hop-dong-thue-nha.pdf"; filename*=UTF-8''`
	if !strings.HasPrefix(got, want) {
		t.Fatalf("got %q", got)
	}

	if strings.Count(got, `"`) != 2 {
		t.Fatalf("quotes from title leaked into header: %q", got)
	}

	if strings.ContainsAny(got[len(want):], " \"';") {
		t.Fatalf("filename* not fully encoded: %q", got)
	}
}
