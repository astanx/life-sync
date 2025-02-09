package routes

import (
	"lifeSync/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CalendarResponse struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
}

func CreateCalendar(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			Title string `json:"title"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if payload.Title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
			return
		}

		claims, err := getUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims", "claims": claims})
			return
		}

		newCalendar := models.Calendar{
			Title:  payload.Title,
			Userid: uint(userID),
		}

		result := db.Create(&newCalendar)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		response := CalendarResponse{
			ID:    newCalendar.ID,
			Title: newCalendar.Title,
		}

		c.JSON(http.StatusCreated, gin.H{"calendar": response})
	}
}
