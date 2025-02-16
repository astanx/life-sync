package routes

import (
	"lifeSync/internal/models"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StageResponse struct {
	ID    uint      `json:"id"`
	Title string    `json:"title"`
	Start time.Time `json:"start"`
	End   time.Time `json:"end"`
}

func CreateProjectStage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			Title string    `json:"title" binding:"required"`
			Start time.Time `json:"start" time_format:"2006-01-02" binding:"required"`
			End   time.Time `json:"end" time_format:"2006-01-02" binding:"required"`
		}

		loc, _ := time.LoadLocation("UTC")
		payload.Start = payload.Start.In(loc)
		payload.End = payload.End.In(loc)

		projectIDStr := c.Param("projectid")
		if projectIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
			return
		}

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
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

		var project models.Project
		result := db.First(&project, "id = ? AND userid = ?", uint(projectID), uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or access denied"})
			return
		}

		newStage := models.Stage{
			Title:     payload.Title,
			Start:     payload.Start,
			End:       payload.End,
			Userid:    uint(userID),
			ProjectID: uint(projectID),
		}

		result = db.Create(&newStage)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		response := StageResponse{
			ID:    newStage.ID,
			Title: newStage.Title,
			Start: newStage.Start,
			End:   newStage.End,
		}

		c.JSON(http.StatusCreated, gin.H{"stage": response})
	}
}

func UpdateProjectStage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			StageID uint      `json:"id"`
			Title   string    `json:"title"`
			Start   time.Time `json:"start" time_format:"2006-01-02" binding:"required"`
			End     time.Time `json:"end" time_format:"2006-01-02" binding:"required"`
		}

		projectIDStr := c.Param("projectid")
		if projectIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
			return
		}

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var project models.Project
		result := db.First(&project, "id = ? AND userid = ?", uint(projectID), uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or access denied"})
			return
		}

		var updatedStage models.Stage
		result = db.First(&updatedStage, "id = ? AND project_id = ?", payload.StageID, uint(projectID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stage not found in project"})
			return
		}

		updatedStage.Title = payload.Title
		updatedStage.Start = payload.Start
		updatedStage.End = payload.End

		db.Save(&updatedStage)

		response := StageResponse{
			ID:    updatedStage.ID,
			Title: updatedStage.Title,
			Start: updatedStage.Start,
			End:   updatedStage.End,
		}

		c.JSON(http.StatusOK, gin.H{"stage": response})
	}
}

func GetProjectStages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")
		if projectIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
			return
		}

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
			return
		}

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

		var project models.Project
		result := db.First(&project, "id = ? AND userid = ?", projectID, uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or access denied"})
			return
		}

		var stages []StageResponse
		result = db.Model(&models.Stage{}).
			Select(`id, title, start, "end"`).
			Where("project_id = ?", projectID).
			Find(&stages)

		if result.Error != nil {
			log.Printf("Error fetching stages: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stages"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"stage": stages})
	}
}

func DeleteProjectStage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		stageIDStr := c.Param("id")
		projectIDStr := c.Param("projectid")

		if stageIDStr == "" || projectIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Stage ID and Project ID are required"})
			return
		}

		stageID, err := strconv.ParseUint(stageIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stage ID format"})
			return
		}

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
			return
		}

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

		var project models.Project
		result := db.First(&project, "id = ? AND userid = ?", projectID, uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or access denied"})
			return
		}

		var stage models.Stage
		result = db.First(&stage, "id = ? AND project_id = ?", uint(stageID), uint(projectID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stage not found in project"})
			return
		}

		result = db.Delete(&stage)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Stage deleted successfully"})
	}
}
