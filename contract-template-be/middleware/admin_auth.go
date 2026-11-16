package middleware

import (
	"crypto/subtle"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// AdminAuth guards admin-only routes with a static shared-secret API key
// provided via the ADMIN_API_KEY environment variable.
func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		expected := strings.TrimSpace(os.Getenv("ADMIN_API_KEY"))
		provided := strings.TrimSpace(c.GetHeader("X-Admin-Api-Key"))

		if expected == "" || provided == "" ||
			subtle.ConstantTimeCompare([]byte(provided), []byte(expected)) != 1 {

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Unauthorized",
			})
			return
		}

		c.Next()
	}
}
