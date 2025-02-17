package routes

import (
	"lifeSync/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AddCollaborator добавляет пользователя в коллабораторы проекта
func AddCollaborator(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("id")

		var payload struct {
			UserID uint `json:"id" binding:"required"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		claims, err := getUserClaimsFromCookie(c)
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
			if id == payload.UserID {
				c.JSON(http.StatusConflict, gin.H{"error": "User is already a collaborator"})
				return
			}
		}

		project.CollaboratorUserIDs = append(project.CollaboratorUserIDs, payload.UserID)
		if err := db.Save(&project).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Collaborator added successfully"})
	}
}

func RemoveCollaborator(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectID := c.Param("id")
		userID := c.Param("userId")

		claims, err := getUserClaimsFromCookie(c)
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

		collaboratorID, err := strconv.ParseUint(userID, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		newCollaborators := make([]uint, 0)
		for _, id := range project.CollaboratorUserIDs {
			if id != uint(collaboratorID) {
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

		c.JSON(http.StatusOK, gin.H{"message": "Collaborator removed successfully"})
	}
}
