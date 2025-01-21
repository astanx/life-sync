package database

import (
	"fmt"
	"lifeSync/internal/config"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ConnectDB() *gorm.DB {
	// Загрузка переменных окружения
	config.LoadEnv()

	user := config.GetEnv("user")
	pass := config.GetEnv("password")
	host := config.GetEnv("host")
	port := config.GetEnv("port")
	dbname := config.GetEnv("dbname")

	// Формирование строки подключения
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host, user, pass, dbname, port)

	// Конфигурация GORM
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // Отключить кэширование подготовленных выражений
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Логирование SQL-запросов
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	return db
}
