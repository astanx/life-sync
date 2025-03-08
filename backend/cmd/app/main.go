package main

import (
	"lifeSync/internal/config"
	"lifeSync/internal/database"
	"lifeSync/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	db := database.ConnectDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  false,
		AllowOrigins:     []string{"http://localhost:5173", "https://lifesync-frontend.onrender.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r, db)

	port := config.GetEnv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}
