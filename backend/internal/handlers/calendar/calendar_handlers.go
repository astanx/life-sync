package calendar

import (
	"errors"
	"lifeSync/internal/middleware"
	"lifeSync/internal/models"
	"log"
	"net/http"
	"strconv"

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

		claims, err := middleware.GetUserClaimsFromCookie(c)
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

func UpdateCalendar(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {

		var payload struct {
			CalendarID uint   `json:"id"`
			Title      string `json:"title"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if payload.Title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
			return
		}

		claims, err := middleware.GetUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims", "claims": claims})
			return
		}

		var updatedCalendar models.Calendar
		result := db.First(&updatedCalendar, "id = ? AND userid = ?", payload.CalendarID, userID)
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No calendar with that ID exists"})
			return
		}

		updatedCalendar.Title = payload.Title

		db.Save(&updatedCalendar)

		response := CalendarResponse{
			ID:    updatedCalendar.ID,
			Title: updatedCalendar.Title,
		}

		c.JSON(http.StatusOK, gin.H{"calendar": response})
	}
}

func GetCalendars(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, err := middleware.GetUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var calendars []CalendarResponse

		result := db.Model(&models.Calendar{}).
			Select(`id, title`).
			Where("userid = ?", uint(userID)).
			Find(&calendars)

		if result.Error != nil {
			log.Printf("Error fetching calendars: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch calendars"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"calendar": calendars})
	}
}

func DeleteCalendar(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		calendarIDStr := c.Param("id")

		if calendarIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Calendar ID is required"})
			return
		}

		calendarID, err := strconv.ParseUint(calendarIDStr, 10, 64)
		if err != nil {
			log.Printf("Error converting calendarID to uint: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calendar ID format"})
			return
		}

		claims, err := middleware.GetUserClaimsFromCookie(c)
		if err != nil {
			log.Printf("Error getting user claims: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, ok := claims["userid"].(float64)
		if !ok {
			log.Printf("Invalid userID in claims: %v", claims)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var calendar models.Calendar
		result := db.First(&calendar, "id = ? AND userid = ?", uint(calendarID), uint(userID))
		if result.Error != nil {
			log.Printf("Error finding calendar: %v", result.Error)
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Calendar not found or access denied"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			}
			return
		}

		result = db.Delete(&calendar)
		if result.Error != nil {
			log.Printf("Error deleting calendar: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Calendar deleted successfully"})
	}
}
