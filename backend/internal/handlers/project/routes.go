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
		projectRoutes.DELETE("/:id", DeleteProject(db))
		projectRoutes.PATCH("/:id", UpdateLastOpenedProject(db))
	}

	projectStagesRoutes := projectRoutes.Group("/stages/:projectid")
	{
		projectStagesRoutes.GET("", GetProjectStages(db))
		projectStagesRoutes.POST("", CreateProjectStage(db))
		projectStagesRoutes.PUT("", UpdateProjectStage(db))
		projectStagesRoutes.PATCH("", UpdateStagePosition(db))
		projectStagesRoutes.DELETE("/:id", DeleteProjectStage(db))
		projectStagesRoutes.GET("/ws", ProjectWebSocketHandler(db))
	}

	projectCollaboratorRoutes := projectRoutes.Group("/:id/collaborators")
	{
		projectCollaboratorRoutes.POST("", AddCollaborator(db))
		projectCollaboratorRoutes.DELETE("/:userId", RemoveCollaborator(db))
	}
}
