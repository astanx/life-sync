package routes

import (
	"lifeSync/internal/handlers/auth"
	"lifeSync/internal/handlers/calendar"
	"lifeSync/internal/handlers/chat"
	"lifeSync/internal/handlers/project"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	apiRoutes := r.Group("/api")

	auth.SetupAuthRoutes(apiRoutes, db)
	calendar.SetupCalendarRoutes(apiRoutes, db)
	project.SetupProjectRoutes(apiRoutes, db)
	chat.SetupChatRoutes(apiRoutes, db)

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to lifeSync API"})
	})
}
