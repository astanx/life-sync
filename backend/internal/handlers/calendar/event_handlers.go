package calendar

import (
	"lifeSync/internal/middleware"
	"lifeSync/internal/models"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EventResponse struct {
	ID    uint      `json:"id"`
	Title string    `json:"title"`
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
	Color string    `json:"color"`
}

func CreateCalendarEvent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			Title string    `json:"title"`
			Start time.Time `json:"start"`
			End   time.Time `json:"end"`
			Color string    `json:"color"`
		}

		calendarIDStr := c.Param("calendarid")
		if calendarIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Calendar ID is required"})
			return
		}

		calendarID, err := strconv.ParseUint(calendarIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calendar ID format"})
			return
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

		var calendar models.Calendar
		result := db.First(&calendar, "id = ? AND userid = ?", uint(calendarID), uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calendar not found or access denied"})
			return
		}

		newEvent := models.Event{
			Title:      payload.Title,
			Start:      payload.Start,
			End:        payload.End,
			Color:      payload.Color,
			Userid:     uint(userID),
			CalendarID: uint(calendarID),
		}

		result = db.Create(&newEvent)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		response := EventResponse{
			ID:    newEvent.ID,
			Title: newEvent.Title,
			Start: newEvent.Start,
			End:   newEvent.End,
			Color: newEvent.Color,
		}

		c.JSON(http.StatusCreated, gin.H{"event": response})
	}
}

func UpdateCalendarEvent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			EventID uint      `json:"id"`
			Title   string    `json:"title"`
			Start   time.Time `json:"start"`
			End     time.Time `json:"end"`
		}

		calendarIDStr := c.Param("calendarid")
		if calendarIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Calendar ID is required"})
			return
		}

		calendarID, err := strconv.ParseUint(calendarIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calendar ID format"})
			return
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

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

		var calendar models.Calendar
		result := db.First(&calendar, "id = ? AND userid = ?", uint(calendarID), uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calendar not found or access denied"})
			return
		}

		var updatedEvent models.Event
		result = db.First(&updatedEvent, "id = ? AND calendar_id = ?", payload.EventID, uint(calendarID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No event with that ID exists in the specified calendar"})
			return
		}

		updatedEvent.Title = payload.Title
		updatedEvent.Start = payload.Start
		updatedEvent.End = payload.End

		db.Save(&updatedEvent)

		response := EventResponse{
			ID:    updatedEvent.ID,
			Title: updatedEvent.Title,
			Start: updatedEvent.Start,
			End:   updatedEvent.End,
		}

		c.JSON(http.StatusOK, gin.H{"event": response})
	}
}

func GetCalendarEvents(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		calendarIDStr := c.Param("calendarid")
		if calendarIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Calendar ID is required"})
			return
		}

		calendarID, err := strconv.ParseUint(calendarIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calendar ID format"})
			return
		}

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

		var calendar models.Calendar
		result := db.First(&calendar, "id = ? AND userid = ?", calendarID, uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calendar not found or access denied"})
			return
		}

		var events []EventResponse
		result = db.Model(&models.Event{}).
			Select(`id, title, start, "end", color`).
			Where("calendar_id = ?", calendarID).
			Find(&events)

		if result.Error != nil {
			log.Printf("Error fetching events: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"event": events})
	}
}

func DeleteCalendarEvent(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		eventIDStr := c.Param("id")
		calendarIDStr := c.Param("calendarid")

		if eventIDStr == "" || calendarIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Event ID and Calendar ID are required"})
			return
		}

		eventID, err := strconv.ParseUint(eventIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID format"})
			return
		}

		calendarID, err := strconv.ParseUint(calendarIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid calendar ID format"})
			return
		}

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

		var calendar models.Calendar
		result := db.First(&calendar, "id = ? AND userid = ?", calendarID, uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Calendar not found or access denied"})
			return
		}

		var event models.Event
		result = db.First(&event, "id = ? AND calendar_id = ?", uint(eventID), uint(calendarID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found or access denied"})
			return
		}

		result = db.Delete(&event)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
	}
}
