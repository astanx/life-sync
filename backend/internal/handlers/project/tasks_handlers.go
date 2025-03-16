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

type TaskResponse struct {
	ID            uint                   `json:"id"`
	Title         string                 `json:"title"`
	Position      int                    `json:"position"`
	StageID       uint                   `json:"stage_id"`
	ProjectID     uint                   `json:"project_id"`
	Type          string                 `json:"type"`
	CreatedAt     time.Time              `json:"created_at"`
	Collaborators []CollaboratorResponse `json:"collaborators"`
}

type CollaboratorResponse struct {
	ID    uint   `json:"id"`
	Email string `json:"email"`
}

var (
	taskUpgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	taskClients      = make(map[uint]map[*websocket.Conn]bool)
	taskClientsMutex sync.RWMutex
)

func TaskWebSocketHandler(db *gorm.DB) gin.HandlerFunc {
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

		conn, err := taskUpgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Task WebSocket upgrade error: %v", err)
			return
		}
		defer conn.Close()

		taskClientsMutex.Lock()
		if taskClients[uint(projectID)] == nil {
			taskClients[uint(projectID)] = make(map[*websocket.Conn]bool)
		}
		taskClients[uint(projectID)][conn] = true
		taskClientsMutex.Unlock()

		defer func() {
			taskClientsMutex.Lock()
			delete(taskClients[uint(projectID)], conn)
			taskClientsMutex.Unlock()
		}()

		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}
}

func CreateTask(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			Title   string `json:"title" binding:"required"`
			StageID uint   `json:"stage_id" binding:"required"`
		}

		projectIDStr := c.Param("projectid")
		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
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
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}

		var project models.Project
		if err := db.Where("id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))",
			projectID, uint(userID), uint(userID)).First(&project).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		var maxPosition int
		db.Model(&models.Task{}).Where("stage_id = ?", payload.StageID).
			Select("COALESCE(MAX(position), 0)").Scan(&maxPosition)

		newTask := models.Task{
			Title:     payload.Title,
			Position:  maxPosition + 1,
			StageID:   payload.StageID,
			ProjectID: uint(projectID),
			Userid:    uint(userID),
		}

		result := db.Create(&newTask)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		response := TaskResponse{
			ID:        newTask.ID,
			Title:     newTask.Title,
			Position:  newTask.Position,
			StageID:   newTask.StageID,
			ProjectID: newTask.ProjectID,
			Type:      "create_task",
			CreatedAt: newTask.CreatedAt,
		}

		broadcastTaskUpdate(uint(projectID), response)
		c.JSON(http.StatusCreated, gin.H{"task": response})
	}
}

func GetTasks(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")
		stageIDStr := c.Param("stageid")

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		stageID, err := strconv.ParseUint(stageIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stage ID"})
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

		var project models.Project
		if err := db.Where("id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))",
			projectID, uint(userID), uint(userID)).First(&project).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		var tasks []models.Task
		result := db.Model(&models.Task{}).
			Where("project_id = ? AND stage_id = ?", projectID, stageID).
			Order("position ASC").
			Find(&tasks)

		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		response := make([]TaskResponse, len(tasks))
		for i, task := range tasks {
			response[i] = TaskResponse{
				ID:            task.ID,
				Title:         task.Title,
				Position:      task.Position,
				StageID:       task.StageID,
				ProjectID:     task.ProjectID,
				CreatedAt:     task.CreatedAt,
				Collaborators: getTaskCollaborators(db, task.ID),
			}
		}

		c.JSON(http.StatusOK, gin.H{"task": response})
	}
}

func UpdateTaskPosition(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var payload struct {
			TaskID   uint `json:"id"`
			StageID  uint `json:"stage_id"`
			Position int  `json:"position"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		projectIDStr := c.Param("projectid")
		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
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

		var project models.Project
		if err := db.Where("id = ? AND (userid = ? OR ? = ANY(collaborator_user_ids))",
			projectID, uint(userID), uint(userID)).First(&project).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		var task models.Task
		if err := db.First(&task, payload.TaskID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if task.StageID != payload.StageID {
				if err := tx.Model(&models.Task{}).
					Where("stage_id = ? AND position > ?", task.StageID, task.Position).
					Update("position", gorm.Expr("position - 1")).Error; err != nil {
					return err
				}

				if err := tx.Model(&models.Task{}).
					Where("stage_id = ? AND position >= ?", payload.StageID, payload.Position).
					Update("position", gorm.Expr("position + 1")).Error; err != nil {
					return err
				}
			} else {
				if task.Position < payload.Position {
					if err := tx.Model(&models.Task{}).
						Where("stage_id = ? AND position > ? AND position <= ?",
							payload.StageID, task.Position, payload.Position).
						Update("position", gorm.Expr("position - 1")).Error; err != nil {
						return err
					}
				} else {
					if err := tx.Model(&models.Task{}).
						Where("stage_id = ? AND position >= ? AND position < ?",
							payload.StageID, payload.Position, task.Position).
						Update("position", gorm.Expr("position + 1")).Error; err != nil {
						return err
					}
				}
			}

			task.StageID = payload.StageID
			task.Position = payload.Position
			return tx.Save(&task).Error
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := TaskResponse{
			ID:        task.ID,
			Title:     task.Title,
			Position:  task.Position,
			StageID:   task.StageID,
			ProjectID: task.ProjectID,
			Type:      "update_task",
			CreatedAt: task.CreatedAt,
		}

		broadcastTaskUpdate(uint(projectID), response)
		c.JSON(http.StatusOK, gin.H{"task": response})
	}
}

func DeleteTask(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")
		stageIDStr := c.Param("stageid")
		taskIDStr := c.Param("taskid")

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		stageID, err := strconv.ParseUint(stageIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid stage ID"})
			return
		}

		taskID, err := strconv.ParseUint(taskIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
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

		var task models.Task
		if err := db.Where("id = ? AND stage_id = ?", taskID, stageID).First(&task).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
			return
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Delete(&task).Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Task{}).
				Where("stage_id = ? AND position > ?", stageID, task.Position).
				Update("position", gorm.Expr("position - 1")).Error; err != nil {
				return err
			}

			return nil
		})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		response := TaskResponse{
			ID:        task.ID,
			Type:      "delete_task",
			CreatedAt: task.CreatedAt,
		}

		broadcastTaskUpdate(uint(projectID), response)
		c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
	}
}

func AddTaskCollaborator(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")
		taskIDStr := c.Param("taskid")

		var payload struct {
			UserID uint `json:"userId" binding:"required"`
		}

		if err := c.ShouldBindJSON(&payload); err != nil {
			log.Printf("Bind error: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		taskID, err := strconv.ParseUint(taskIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
			return
		}

		currentUserID, err := middleware.GetCurrentUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		if !isProjectCollaborator(db, uint(projectID), currentUserID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		var targetUser models.User
		if err := db.First(&targetUser, payload.UserID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		var existing models.TaskCollaborator
		if err := db.Where("task_id = ? AND user_id = ?", taskID, payload.UserID).First(&existing).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "User already collaborator"})
			return
		}

		collaborator := models.TaskCollaborator{
			TaskID:    uint(taskID),
			UserID:    payload.UserID,
			UserEmail: targetUser.Email,
		}

		if err := db.Create(&collaborator).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		broadcastTaskUpdate(uint(projectID), TaskResponse{
			ID:            uint(taskID),
			Type:          "update_collaborators",
			Collaborators: getTaskCollaborators(db, uint(taskID)),
		})

		c.JSON(http.StatusOK, gin.H{"message": "Collaborator added"})
	}
}

func RemoveTaskCollaborator(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		projectIDStr := c.Param("projectid")
		taskIDStr := c.Param("taskid")
		userIDStr := c.Param("userid")

		projectID, err := strconv.ParseUint(projectIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
			return
		}

		taskID, err := strconv.ParseUint(taskIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
			return
		}

		userID, err := strconv.ParseUint(userIDStr, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		currentUserID, err := middleware.GetCurrentUserID(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		if !isProjectOwner(db, uint(projectID), currentUserID) && currentUserID != uint(userID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		if err := db.Where("task_id = ? AND user_id = ?", taskID, userID).Delete(&models.TaskCollaborator{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		broadcastTaskUpdate(uint(projectID), TaskResponse{
			ID:            uint(taskID),
			Type:          "update_collaborators",
			Collaborators: getTaskCollaborators(db, uint(taskID)),
		})

		c.JSON(http.StatusOK, gin.H{"message": "Collaborator removed"})
	}
}

func getTaskCollaborators(db *gorm.DB, taskID uint) []CollaboratorResponse {
	var collaborators []models.TaskCollaborator
	db.Where("task_id = ?", taskID).Find(&collaborators)

	result := make([]CollaboratorResponse, len(collaborators))
	for i, c := range collaborators {
		result[i] = CollaboratorResponse{
			ID:    c.UserID,
			Email: c.UserEmail,
		}
	}
	return result
}

func isProjectCollaborator(db *gorm.DB, projectID uint, userID uint) bool {
	var project models.Project
	if err := db.First(&project, projectID).Error; err != nil {
		return false
	}

	if project.Userid == userID {
		return true
	}

	for _, id := range project.CollaboratorUserIDs {
		if uint(id) == userID {
			return true
		}
	}
	return false
}

func isProjectOwner(db *gorm.DB, projectID uint, userID uint) bool {
	var project models.Project
	if err := db.First(&project, projectID).Error; err != nil {
		return false
	}
	return project.Userid == userID
}

func broadcastTaskUpdate(projectID uint, response TaskResponse) {
	taskClientsMutex.RLock()
	defer taskClientsMutex.RUnlock()

	if clients, ok := taskClients[projectID]; ok {
		for client := range clients {
			if err := client.WriteJSON(response); err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}
