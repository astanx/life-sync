package chat

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupChatRoutes(r *gin.RouterGroup, db *gorm.DB) {
	chatRoutes := r.Group("/chat")

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
}
