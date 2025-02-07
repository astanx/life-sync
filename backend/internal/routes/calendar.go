package routes

import (
	"lifeSync/internal/models"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateCalendarEvent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			Title string    `json:"title"`
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
			Color string    `json:"color"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if payload.Title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
			return
		}

		if payload.Start.IsZero() || payload.End.IsZero() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Start and End times are required"})
			return
		}

		if payload.Start.After(payload.End) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Start time must be before End time"})
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

		newEvent := models.Event{
			Title:  payload.Title,
			Start:  payload.Start,
			End:    payload.End,
			Color:  payload.Color,
			Userid: uint(userID),
		}

		result := db.Create(&newEvent)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"data": newEvent})
	}
}

func UpdateCalendarEvent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventId := c.Param("eventId")

		var payload struct {
			Title string    `json:"title"`
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
			Color string    `json:"color"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if payload.Title == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
			return
		}

		if payload.Start.IsZero() || payload.End.IsZero() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Start and End times are required"})
			return
		}

		if payload.Start.After(payload.End) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Start time must be before End time"})
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

		var updatedEvent models.Event
		result := db.First(&updatedEvent, "id = ?, userid = ?", eventId, userID)
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No event with that ID exists"})
			return
		}

		updatedEvent.Title = payload.Title
		updatedEvent.Start = payload.Start
		updatedEvent.End = payload.End
		updatedEvent.Color = payload.Color

		db.Save(&updatedEvent)

		c.JSON(http.StatusOK, gin.H{"data": updatedEvent})
	}
}

func GetCalendarEvents(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, err := getUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var events models.Events

		result := db.Model(&models.Event{}).
			Select(`id, title, start, "end", color`).
			Where("userid = ?", uint(userID)).
			Find(&events)

		if result.Error != nil {
			log.Printf("Error fetching events: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"events": events})
	}
}
