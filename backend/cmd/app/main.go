package main

import (
	"lifeSync/internal/config"
	"lifeSync/internal/database"
	"lifeSync/internal/routes"

	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	db := database.ConnectDB()

	r := gin.Default()
	routes.SetupRoutes(r, db)

	port := config.GetEnv("port")
	if port == "" {
		log.Fatal("PORT environment variable is not set")
	}

	r.Run(":" + port)
}
