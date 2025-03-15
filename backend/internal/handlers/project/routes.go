package project

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupProjectRoutes(r *gin.RouterGroup, db *gorm.DB) {
	projectRoutes := r.Group("/project")
	{
		projectRoutes.GET("", GetProjects(db))
		projectRoutes.POST("", CreateProject(db))
		projectRoutes.PUT("", UpdateProject(db))
		projectRoutes.DELETE("/:projectid", DeleteProject(db))
		projectRoutes.PATCH("/:projectid", UpdateLastOpenedProject(db))
	}

	projectStagesRoutes := projectRoutes.Group("/stages/:projectid")
	{
		projectStagesRoutes.GET("", GetProjectStages(db))
		projectStagesRoutes.POST("", CreateProjectStage(db))
		projectStagesRoutes.PUT("", UpdateProjectStage(db))
		projectStagesRoutes.PATCH("", UpdateStagePosition(db))
		projectStagesRoutes.DELETE("/:stageid", DeleteProjectStage(db))
		projectStagesRoutes.GET("/ws", ProjectWebSocketHandler(db))
	}

	projectWsRoutes := projectRoutes.Group("/:projectid/ws")
	{
		projectWsRoutes.GET("/tasks", TaskWebSocketHandler(db))
	}

	taskRoutes := projectStagesRoutes.Group("/:stageid/tasks")
	{
		taskRoutes.GET("", GetTasks(db))
		taskRoutes.POST("", CreateTask(db))
		taskRoutes.DELETE("/:taskid", DeleteTask(db))
		taskRoutes.PATCH("", UpdateTaskPosition(db))
	}

	projectCollaboratorRoutes := projectRoutes.Group("/:projectid/collaborators")
	{
		projectCollaboratorRoutes.POST("", AddCollaborator(db))
		projectCollaboratorRoutes.DELETE("/:userId", RemoveCollaborator(db))
	}
}
