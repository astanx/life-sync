package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	apiRoutes := r.Group("/api")
	userRoutes := apiRoutes.Group("/user")
	{
		userRoutes.POST("", RegisterUser(db))
		userRoutes.POST("/login", LoginUser(db))
		userRoutes.GET("login", LoginFromCookie(db))
		userRoutes.PUT("", UpdateUser(db))
		userRoutes.DELETE("", DeleteUser(db))
		userRoutes.GET("/verification", SendVerificationCode)
		userRoutes.POST("/verification", ValidateCode)
	}

	calendarRoutes := apiRoutes.Group("/calendar")

	{
		calendarRoutes.GET("", GetCalendarEvents(db))
		calendarRoutes.POST("", CreateCalendarEvent(db))
		calendarRoutes.PUT("", UpdateCalendarEvent(db))
		calendarRoutes.DELETE("/:id", DeleteCalendarEvent(db))
	}

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to lifeSync API"})
	})
}
