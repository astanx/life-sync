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
