package main

import (
	"lifeSync/internal/database"
	"lifeSync/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	db := database.ConnectDB()

	r := gin.Default()
	routes.SetupRoutes(r, db)

	r.Run()
}
