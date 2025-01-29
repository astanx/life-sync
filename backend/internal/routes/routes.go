package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	apiRoutes := r.Group("/api")
	{
		apiRoutes.POST("/user", RegisterUser(db))
		apiRoutes.POST("/user/login", LoginUser(db))
		apiRoutes.PUT("/user/:id", UpdateUser(db))
		apiRoutes.DELETE("/user/:id", DeleteUser(db))
		apiRoutes.GET("/createJWT", CreateToken(db))
		apiRoutes.GET("/validateJWT", ValidateToken(db))
	}

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to lifeSync API"})
	})
}
