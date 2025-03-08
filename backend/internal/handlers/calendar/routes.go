package calendar

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupCalendarRoutes(r *gin.RouterGroup, db *gorm.DB) {
	calendarRoutes := r.Group("/calendar")
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
}
