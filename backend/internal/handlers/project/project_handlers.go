package project

import (
	"errors"
	"lifeSync/internal/middleware"
	"lifeSync/internal/models"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ProjectResponse struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
}

func CreateProject(db *gorm.DB) gin.HandlerFunc {
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

		newProject := models.Project{
			Title:  payload.Title,
			Userid: uint(userID),
		}

		result := db.Create(&newProject)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		newChat := models.Chat{
			Title:     payload.Title + " chat",
			ProjectID: newProject.ID,
			CreatorID: uint(userID),
		}

		if err := db.Create(&newChat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create chat for the project"})
			return
		}

		response := ProjectResponse{
			ID:    newProject.ID,
			Title: newProject.Title,
		}

		c.JSON(http.StatusCreated, gin.H{"project": response})
	}
}

func UpdateProject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			ProjectID uint   `json:"id"`
			Title     string `json:"title"`
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

		var updatedProject models.Project
		result := db.First(&updatedProject, "id = ? AND userid = ?", payload.ProjectID, uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "No project with that ID exists"})
			return
		}

		updatedProject.Title = payload.Title
		if err := db.Save(&updatedProject).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update project"})
			return
		}

		var chat models.Chat
		if err := db.First(&chat, "project_id = ?", updatedProject.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find associated chat"})
			return
		}

		chat.Title = updatedProject.Title + " chat"
		if err := db.Save(&chat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update chat title"})
			return
		}

		response := ProjectResponse{
			ID:    updatedProject.ID,
			Title: updatedProject.Title,
		}

		c.JSON(http.StatusOK, gin.H{"project": response})
	}
}
func GetProjects(db *gorm.DB) gin.HandlerFunc {
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

		var projects []ProjectResponse

		result := db.Model(&models.Project{}).
			Select("id, title").
			Where("userid = ? OR ? = ANY(collaborator_user_ids)", uint(userID), uint(userID)).
			Find(&projects)

		if result.Error != nil {
			log.Printf("Error fetching projects: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"project": projects})
	}
}

func DeleteProject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")

		if projectIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
			return
		}

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			log.Printf("Error converting projectID to uint: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
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

		var project models.Project
		result := db.First(&project, "id = ? AND userid = ?", uint(projectID), uint(userID))
		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or access denied"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			}
			return
		}

		if err := db.Where("project_id = ?", project.ID).Delete(&models.Chat{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project chat"})
			return
		}

		result = db.Delete(&project)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Project and associated chat deleted successfully"})
	}
}

func UpdateLastOpenedProject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")

		if projectIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Project ID is required"})
			return
		}

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			log.Printf("Error converting projectID to uint: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID format"})
			return
		}

		claims, err := middleware.GetUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		userID := uint(claims["userid"].(float64))

		var project models.Project

		err = db.Where("id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))",
			projectID, userID, userID).
			First(&project).Error

		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Project access denied"})
			return
		}

		if err := db.Model(&project).Update("last_opened", time.Now()).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Last opened time updated"})
	}
}
