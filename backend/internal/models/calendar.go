package models

import (
	"time"

	"gorm.io/gorm"
)

type Event struct {
	gorm.Model
	Userid uint      `gorm:"not null"`
	Title  string    `gorm:"size:255;not null"`
	Start  time.Time `gorm:"not null"`
	End    time.Time `gorm:"not null"`
	Color  string    `gorm:"size:50"`
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
	Userid uint   `gorm:"not null"`
	Title  string `gorm:"size:255;not null"`
}
