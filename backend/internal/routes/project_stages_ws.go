package routes

import (
	"lifeSync/internal/models"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var (
	stageClients   = make(map[uint]map[*websocket.Conn]bool)
	stageClientsMu sync.RWMutex
)

type StageWSResponse struct {
	Action  string        `json:"action"`
	Stage   StageResponse `json:"stage,omitempty"`
	StageID uint          `json:"stage_id,omitempty"`
}

func StageWebSocketHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")
		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		claims, err := getUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}

		var project models.Project
		if err := db.Where("id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))",
			projectID, uint(userID), uint(userID)).First(&project).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}
		defer conn.Close()

		stageClientsMu.Lock()
		if stageClients[uint(projectID)] == nil {
			stageClients[uint(projectID)] = make(map[*websocket.Conn]bool)
		}
		stageClients[uint(projectID)][conn] = true
		stageClientsMu.Unlock()

		defer func() {
			stageClientsMu.Lock()
			delete(stageClients[uint(projectID)], conn)
			stageClientsMu.Unlock()
		}()

		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}
}

func notifyStageClients(projectID uint, response StageWSResponse) {
	stageClientsMu.RLock()
	defer stageClientsMu.RUnlock()

	if clients, ok := stageClients[projectID]; ok {
		for client := range clients {
			err := client.WriteJSON(response)
			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}
