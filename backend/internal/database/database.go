package database

import (
	"fmt"
	"lifeSync/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {

	config.LoadEnv()

	user := config.GetEnv("user")
	pass := config.GetEnv("password")
	host := config.GetEnv("host")
	port := config.GetEnv("port")
	dbname := config.GetEnv("dbname")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, pass, dbname, port)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database")
	}

	return db
}
