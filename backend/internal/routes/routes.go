package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	apiRoutes := r.Group("/api")
	userRoutes := apiRoutes.Group("/user")
	{
		userRoutes.POST("", RegisterUser(db))
		userRoutes.POST("/login", LoginUser(db))
		userRoutes.GET("/login", LoginFromCookie(db))
		userRoutes.PUT("", UpdateUser(db))
		userRoutes.PATCH("", LogoutUser())
		userRoutes.DELETE("", DeleteUser(db))
		userRoutes.GET("/verification", SendVerificationCode)
		userRoutes.POST("/verification", ValidateCode(db))
	}

	calendarRoutes := apiRoutes.Group("/calendar")
	{
		calendarRoutes.GET("", GetCalendars(db))
		calendarRoutes.POST("", CreateCalendar(db))
		calendarRoutes.PUT("", UpdateCalendar(db))
		calendarRoutes.DELETE("/:id", DeleteCalendar(db))
	}

	calendarEventRoutes := calendarRoutes.Group("/events/:calendarid")
	{
		calendarEventRoutes.GET("", GetCalendarEvents(db))
		calendarEventRoutes.POST("", CreateCalendarEvent(db))
		calendarEventRoutes.PUT("", UpdateCalendarEvent(db))
		calendarEventRoutes.DELETE("/:id", DeleteCalendarEvent(db))
	}

	projectRoutes := apiRoutes.Group("/project")
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
		projectStagesRoutes.DELETE("/:id", DeleteProjectStage(db))
		projectStagesRoutes.GET("/ws", ProjectWebSocketHandler(db))
	}

	projectCollaboratorRoutes := projectRoutes.Group("/:id/collaborators")
	{
		projectCollaboratorRoutes.POST("", AddCollaborator(db))
		projectCollaboratorRoutes.DELETE("/:userId", RemoveCollaborator(db))
	}

	chatRoutes := apiRoutes.Group("/chat")

	{
		chatRoutes.GET("", GetChats(db))
		chatRoutes.POST("", CreateChat(db))
		chatRoutes.PUT("/:id", UpdateChat(db))
		chatRoutes.DELETE("/:id", DeleteChat(db))
	}

	{
		chatRoutes.GET("/:id/messages", GetMessages(db))
		chatRoutes.POST("/:id/messages", CreateMessage(db))
		chatRoutes.PUT("/messages/:id", UpdateMessage(db))
		chatRoutes.DELETE("/messages/:id", DeleteMessage(db))
		chatRoutes.GET("/:id/ws", WebSocketHandler(db))
	}

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to lifeSync API"})
	})
}
