package routes

import (
	"lifeSync/internal/models"
	"lifeSync/internal/ws"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var (
	hub *ws.Hub
)

func InitWebSocket() {
	hub = ws.NewHub()
	go hub.Run()
}

func GetHub() *ws.Hub {
	return hub
}

func WebSocketHandler(db *gorm.DB) gin.HandlerFunc {
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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
			return
		}

		var chat models.Chat
		if err := db.Where("id = ? AND (creator_id = ? OR ? = ANY(collaborator_user_ids))",
			chatID, uint(userID), uint(userID)).First(&chat).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}

		client := &ws.Client{
			UserID: uint(userID),
			ChatID: uint(chatID),
			Conn:   conn,
			Send:   make(chan models.Message, 256),
		}

		hub.Register <- client

		go func() {
			defer func() {
				hub.Unregister <- client
				client.Conn.Close()
			}()

			for {
				message, ok := <-client.Send
				if !ok {
					client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}

				if err := client.Conn.WriteJSON(message); err != nil {
					log.Printf("Write error: %v", err)
					return
				}
			}
		}()

		go func() {
			defer client.Conn.Close()
			for {
				if _, _, err := client.Conn.NextReader(); err != nil {
					break
				}
			}
		}()
	}
}
