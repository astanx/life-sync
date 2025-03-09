package project

import (
	"lifeSync/internal/middleware"
	"lifeSync/internal/models"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

type StageResponse struct {
	ID       uint      `json:"id"`
	Title    string    `json:"title"`
	Start    time.Time `json:"start"`
	End      time.Time `json:"end"`
	Type     string    `json:"type"`
	Status   string    `json:"status"`
	Position int       `json:"position"`
}

var (
	projectUpgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	projectClients      = make(map[uint]map[*websocket.Conn]bool)
	projectClientsMutex sync.RWMutex
)

func ProjectWebSocketHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")
		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		claims, err := middleware.GetUserClaimsFromCookie(c)
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

		conn, err := projectUpgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("WebSocket upgrade error: %v", err)
			return
		}
		defer conn.Close()

		projectClientsMutex.Lock()
		if projectClients[uint(projectID)] == nil {
			projectClients[uint(projectID)] = make(map[*websocket.Conn]bool)
		}
		projectClients[uint(projectID)][conn] = true
		projectClientsMutex.Unlock()

		defer func() {
			projectClientsMutex.Lock()
			delete(projectClients[uint(projectID)], conn)
			projectClientsMutex.Unlock()
		}()

		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}
}

func CreateProjectStage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			Title    string `json:"title" binding:"required"`
			Start    string `json:"start" binding:"required"`
			End      string `json:"end" binding:"required"`
			Status   string `json:"status"`
			Position int    `json:"position"`
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

		if payload.Status == "" {
			payload.Status = "todo"
		}

		if payload.Position == 0 {
			var maxPosition int
			db.Model(&models.Stage{}).Where("project_id = ? AND status = ?", projectID, payload.Status).
				Select("COALESCE(MAX(position), 0)").Scan(&maxPosition)
			payload.Position = maxPosition + 1
		}

		layout := "2006-01-02"
		startTime, err := time.Parse(layout, payload.Start)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
			return
		}

		endTime, err := time.Parse(layout, payload.End)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
			return
		}

		startTime = startTime.UTC()
		endTime = endTime.UTC()

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

		var project models.Project
		result := db.First(&project, "id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))", uint(projectID), uint(userID), uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or access denied"})
			return
		}

		newStage := models.Stage{
			Title:     payload.Title,
			Start:     startTime,
			End:       endTime,
			Userid:    uint(userID),
			ProjectID: uint(projectID),
			Status:    payload.Status,
			Position:  payload.Position,
		}

		result = db.Create(&newStage)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		response := StageResponse{
			ID:       newStage.ID,
			Title:    newStage.Title,
			Start:    newStage.Start,
			End:      newStage.End,
			Status:   newStage.Status,
			Position: newStage.Position,
			Type:     "create",
		}

		projectClientsMutex.RLock()
		projectWsClients := projectClients[uint(projectID)]
		for client := range projectWsClients {
			if err := client.WriteJSON(response); err != nil {
				client.Close()
				delete(projectWsClients, client)
			}
		}
		projectClientsMutex.RUnlock()

		c.JSON(http.StatusCreated, gin.H{"stage": response})
	}
}

func UpdateProjectStage(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			StageID  uint   `json:"id"`
			Title    string `json:"title"`
			Start    string `json:"start" binding:"required"`
			End      string `json:"end" binding:"required"`
			Status   string `json:"status"`
			Position int    `json:"position"`
		}

		projectIDStr := c.Param("projectid")
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

		layout := "2006-01-02"
		startTime, err := time.Parse(layout, payload.Start)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format"})
			return
		}

		endTime, err := time.Parse(layout, payload.End)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format"})
			return
		}

		if startTime.After(endTime) {
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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "userid not found in token claims"})
			return
		}

		var project models.Project
		result := db.First(&project, "id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))", uint(projectID), uint(userID), uint(userID))
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
		updatedStage.Start = startTime
		updatedStage.End = endTime

		if err := db.Save(&updatedStage).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := StageResponse{
			ID:       updatedStage.ID,
			Title:    updatedStage.Title,
			Start:    updatedStage.Start,
			End:      updatedStage.End,
			Status:   updatedStage.Status,
			Position: updatedStage.Position,
			Type:     "update",
		}

		projectClientsMutex.RLock()
		projectWsClients := projectClients[uint(projectID)]
		for client := range projectWsClients {
			if err := client.WriteJSON(response); err != nil {
				client.Close()
				delete(projectWsClients, client)
			}
		}
		projectClientsMutex.RUnlock()

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
		result := db.First(&project, "id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))", projectID, uint(userID), uint(userID))
		if result.Error != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or access denied"})
			return
		}

		var stages []StageResponse
		result = db.Model(&models.Stage{}).
			Select(`id, title, start, "end", status, position`).
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
		result := db.First(&project, "id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))", projectID, uint(userID), uint(userID))
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

		if err := db.Delete(&stage).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := StageResponse{
			ID:   stage.ID,
			Type: "delete",
		}

		projectClientsMutex.RLock()
		projectWsClients := projectClients[uint(projectID)]
		for client := range projectWsClients {
			if err := client.WriteJSON(response); err != nil {
				client.Close()
				delete(projectWsClients, client)
			}
		}
		projectClientsMutex.RUnlock()

		c.JSON(http.StatusOK, gin.H{"message": "Stage deleted successfully"})
	}
}

func UpdateStagePosition(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			StageID  uint   `json:"id"`
			Status   string `json:"status"`
			Position int    `json:"position"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
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

		validStatuses := map[string]bool{
			"todo":        true,
			"in_progress": true,
			"done":        true,
		}
		if !validStatuses[payload.Status] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
			return
		}

		claims, err := middleware.GetUserClaimsFromCookie(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, ok := claims["userid"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}

		var stage models.Stage
		if err := db.Preload("Project").
			Where("id = ?", payload.StageID).
			First(&stage).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Stage not found"})
			return
		}

		var project models.Project
		err = db.Where("id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))",
			projectID, uint(userID), uint(userID)).
			First(&project).Error
		if err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if stage.Status != payload.Status {
				if err := tx.Model(&models.Stage{}).
					Where("status = ? AND position > ?", stage.Status, stage.Position).
					Update("position", gorm.Expr("position - 1")).Error; err != nil {
					return err
				}

				if err := tx.Model(&models.Stage{}).
					Where("status = ? AND position >= ?", payload.Status, payload.Position).
					Update("position", gorm.Expr("position + 1")).Error; err != nil {
					return err
				}
			} else {
				if stage.Position < payload.Position {
					if err := tx.Model(&models.Stage{}).
						Where("status = ? AND position > ? AND position <= ?", payload.Status, stage.Position, payload.Position).
						Update("position", gorm.Expr("position - 1")).Error; err != nil {
						return err
					}
				} else {
					if err := tx.Model(&models.Stage{}).
						Where("status = ? AND position >= ? AND position < ?", payload.Status, payload.Position, stage.Position).
						Update("position", gorm.Expr("position + 1")).Error; err != nil {
						return err
					}
				}
			}

			stage.Status = payload.Status
			stage.Position = payload.Position
			if err := tx.Save(&stage).Error; err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := StageResponse{
			ID:       stage.ID,
			Title:    stage.Title,
			Start:    stage.Start,
			End:      stage.End,
			Type:     "update",
			Status:   stage.Status,
			Position: stage.Position,
		}

		projectClientsMutex.RLock()
		projectWsClients := projectClients[stage.ProjectID]
		for client := range projectWsClients {
			if err := client.WriteJSON(response); err != nil {
				client.Close()
				delete(projectWsClients, client)
			}
		}
		projectClientsMutex.RUnlock()

		c.JSON(http.StatusOK, gin.H{"stage": response})
	}
}
