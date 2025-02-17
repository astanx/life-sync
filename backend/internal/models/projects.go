package models

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	gorm.Model
	Title               string `gorm:"not null"`
	Userid              uint   `gorm:"not null"`
	LastOpened          time.Time
	CollaboratorUserIDs []uint  `gorm:"type:integer[]"`
	Stages              []Stage `gorm:"foreignKey:ProjectID"`
}

type Stage struct {
	gorm.Model
	Title     string    `gorm:"not null"`
	Start     time.Time `gorm:"not null;type:date"`
	End       time.Time `gorm:"not null;type:date"`
	ProjectID uint      `gorm:"not null"`
	Userid    uint      `gorm:"not null"`
}
