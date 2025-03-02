package routes

import (
	"lifeSync/internal/models"
	"lifeSync/internal/ws"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MessageResponse struct {
	ID        uint      `json:"id"`
	Content   string    `json:"content"`
	ChatID    uint      `json:"chat_id"`
	UserID    uint      `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
	Sender    string    `json:"sender"`
}

func CreateMessage(db *gorm.DB, hub *ws.Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatIDStr := c.Param("id")
		chatID, err := strconv.ParseUint(chatIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
			return
		}

		var payload struct {
			Content string `json:"content" binding:"required"`
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

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var chat models.Chat
		if err := db.Where("id = ? AND (creator_id = ? OR ? = ANY(collaborator_user_ids))",
			chatID, uint(userID), uint(userID)).First(&chat).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access to chat denied"})
			return
		}

		email, ok := claims["email"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "email not found in token claims"})
			return
		}

		newMessage := models.Message{
			Content: payload.Content,
			ChatID:  uint(chatID),
			UserID:  uint(userID),
			Sender:  email,
		}

		if err := db.Create(&newMessage).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		hub.Broadcast <- newMessage

		response := MessageResponse{
			ID:        newMessage.ID,
			Content:   newMessage.Content,
			ChatID:    newMessage.ChatID,
			UserID:    newMessage.UserID,
			CreatedAt: newMessage.CreatedAt,
			Sender:    newMessage.Sender,
		}

		c.JSON(http.StatusCreated, gin.H{"message": response})
	}
}

func GetMessages(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		chatIDStr := c.Param("id")
		chatID, err := strconv.ParseUint(chatIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chat ID"})
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

		var chat models.Chat
		if err := db.Where("id = ? AND (creator_id = ? OR ? = ANY(collaborator_user_ids))",
			chatID, uint(userID), uint(userID)).First(&chat).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access to chat denied"})
			return
		}

		var messages []models.Message
		if err := db.Where("chat_id = ?", chatID).Order("created_at asc").Find(&messages).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var response []MessageResponse
		for _, msg := range messages {
			response = append(response, MessageResponse{
				ID:        msg.ID,
				Content:   msg.Content,
				ChatID:    msg.ChatID,
				UserID:    msg.UserID,
				CreatedAt: msg.CreatedAt,
				Sender:    msg.Sender,
			})
		}

		c.JSON(http.StatusOK, gin.H{"message": response})
	}
}

func UpdateMessage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		messageIDStr := c.Param("id")
		messageID, err := strconv.ParseUint(messageIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
			return
		}

		var payload struct {
			Content string `json:"content" binding:"required"`
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

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var message models.Message
		if err := db.First(&message, "id = ? AND user_id = ?", messageID, uint(userID)).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Message not found or access denied"})
			return
		}

		message.Content = payload.Content
		if err := db.Save(&message).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := MessageResponse{
			ID:        message.ID,
			Content:   message.Content,
			ChatID:    message.ChatID,
			UserID:    message.UserID,
			CreatedAt: message.CreatedAt,
			Sender:    message.Sender,
		}

		c.JSON(http.StatusOK, gin.H{"message": response})
	}
}

func DeleteMessage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		messageIDStr := c.Param("id")
		messageID, err := strconv.ParseUint(messageIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
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

		var message models.Message
		if err := db.First(&message, "id = ? AND user_id = ?", messageID, uint(userID)).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Message not found or access denied"})
			return
		}

		if err := db.Delete(&message).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Message deleted successfully"})
	}
}
