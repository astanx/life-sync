package auth

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupAuthRoutes(r *gin.RouterGroup, db *gorm.DB) {
	userRoutes := r.Group("/user")
	{
		userRoutes.POST("", RegisterUser(db))
		userRoutes.POST("/login", LoginUser(db))
		userRoutes.GET("/login", LoginFromCookie(db))
		userRoutes.PUT("", UpdateUser(db))
		userRoutes.PATCH("", LogoutUser())
		userRoutes.DELETE("", DeleteUser(db))
		userRoutes.GET("/verification", SendVerificationCode)
		userRoutes.POST("/verification", ValidateCode(db))
	}
}
