package main

import (
	"lifeSync/internal/config"
	"lifeSync/internal/database"
	"lifeSync/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	db := database.ConnectDB()

	r := gin.Default()
	routes.SetupRoutes(r, db)

	port := config.GetEnv("PORT")
	if port == "" {
		port = "8080"
	}

	r.Run(":" + port)
}
