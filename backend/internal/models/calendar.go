package models

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Title      string    `gorm:"not null"`
	Start      time.Time `gorm:"not null"`
	End        time.Time `gorm:"not null"`
	Color      string    `gorm:"not null"`
	Userid     uint      `gorm:"not null"`
	CalendarID uint      `gorm:"not null"`
}

type Events []struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
	Start string `json:"start"`
	End   string `json:"end"`
	Color string `json:"color"`
}

type Calendar struct {
	gorm.Model
	Title  string  `gorm:"not null"`
	Userid uint    `gorm:"not null"`
	Events []Event `gorm:"foreignKey:CalendarID"`
}
