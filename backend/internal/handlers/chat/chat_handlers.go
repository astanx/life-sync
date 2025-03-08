package chat

import (
	"lifeSync/internal/middleware"
	"lifeSync/internal/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ChatResponse struct {
	ID        uint   `json:"id"`
	Title     string `json:"title"`
	ProjectID uint   `json:"project_id"`
}

func CreateChat(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			ProjectID uint `json:"id"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var project models.Project
		if err := db.First(&project, payload.ProjectID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
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

		newChat := models.Chat{
			Title:     project.Title + " chat",
			ProjectID: payload.ProjectID,
			CreatorID: uint(userID),
		}

		if err := db.Create(&newChat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := ChatResponse{
			ID:        newChat.ID,
			Title:     newChat.Title,
			ProjectID: newChat.ProjectID,
		}

		c.JSON(http.StatusCreated, gin.H{"chat": response})
	}
}

func UpdateChat(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatIDStr := c.Param("id")
		chatID, err := strconv.ParseUint(chatIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
			return
		}

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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var chat models.Chat
		if err := db.First(&chat, "id = ? AND creator_id = ?", chatID, uint(userID)).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found or access denied"})
			return
		}

		chat.Title = payload.Title
		if err := db.Save(&chat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := ChatResponse{
			ID:        chat.ID,
			Title:     chat.Title,
			ProjectID: chat.ProjectID,
		}

		c.JSON(http.StatusOK, gin.H{"chat": response})
	}
}

func GetChats(db *gorm.DB) gin.HandlerFunc {
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

		var chats []models.Chat
		if err := db.Where("creator_id = ? OR ? = ANY(collaborator_user_ids)", uint(userID), uint(userID)).Find(&chats).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var response []ChatResponse
		for _, chat := range chats {
			response = append(response, ChatResponse{
				ID:        chat.ID,
				Title:     chat.Title,
				ProjectID: chat.ProjectID,
			})
		}

		c.JSON(http.StatusOK, gin.H{"chat": response})
	}
}

func DeleteChat(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatIDStr := c.Param("id")
		chatID, err := strconv.ParseUint(chatIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
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

		var chat models.Chat
		if err := db.First(&chat, "id = ? AND creator_id = ?", chatID, uint(userID)).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found or access denied"})
			return
		}

		if err := db.Delete(&chat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Chat deleted successfully"})
	}
}
