package project

import (
	"lifeSync/internal/middleware"
	"lifeSync/internal/models"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

func AddCollaborator(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("id")

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

		var payload struct {
			UserID uint `json:"id" binding:"required"`
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
		currentUserID := uint(claims["userid"].(float64))

		var project models.Project
		if err := db.First(&project, projectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}

		if project.Userid != currentUserID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only project owner can add collaborators"})
			return
		}

		var user models.User
		if err := db.First(&user, payload.UserID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
			return
		}

		for _, id := range project.CollaboratorUserIDs {
			if uint(id) == payload.UserID {
				c.JSON(http.StatusConflict, gin.H{"error": "User is already a collaborator"})
				return
			}
		}

		project.CollaboratorUserIDs = append(project.CollaboratorUserIDs, int64(payload.UserID))
		if err := db.Save(&project).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var chat models.Chat
		if err := db.First(&chat, "project_id = ?", project.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find associated chat"})
			return
		}

		chat.CollaboratorUserIDs = append(chat.CollaboratorUserIDs, int64(payload.UserID))
		if err := db.Save(&chat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add collaborator to chat"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Collaborator added successfully to project and chat"})
	}
}

func RemoveCollaborator(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("id")

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

		userID := c.Param("userId")

		claims, err := middleware.GetUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		currentUserID := uint(claims["userid"].(float64))

		var project models.Project
		if err := db.First(&project, projectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}

		if project.Userid != currentUserID {
			c.JSON(http.StatusForbidden, gin.H{"error": "Only project owner can remove collaborators"})
			return
		}

		collaboratorID, err := strconv.ParseInt(userID, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		newCollaborators := make(pq.Int64Array, 0)
		for _, id := range project.CollaboratorUserIDs {
			if id != collaboratorID {
				newCollaborators = append(newCollaborators, id)
			}
		}

		if len(newCollaborators) == len(project.CollaboratorUserIDs) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User is not a collaborator"})
			return
		}

		project.CollaboratorUserIDs = newCollaborators
		if err := db.Save(&project).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var chat models.Chat
		if err := db.First(&chat, "project_id = ?", project.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find associated chat"})
			return
		}

		newChatCollaborators := make(pq.Int64Array, 0)
		for _, id := range chat.CollaboratorUserIDs {
			if id != collaboratorID {
				newChatCollaborators = append(newChatCollaborators, id)
			}
		}

		chat.CollaboratorUserIDs = newChatCollaborators
		if err := db.Save(&chat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove collaborator from chat"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Collaborator removed successfully from project and chat"})
	}
}
