package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Project struct {
	gorm.Model
	Title               string `gorm:"not null"`
	Userid              uint   `gorm:"not null"`
	LastOpened          time.Time
	CollaboratorUserIDs pq.Int64Array `gorm:"type:integer[]"`
	Stages              []Stage       `gorm:"foreignKey:ProjectID"`
}

type Stage struct {
	gorm.Model
	Title     string    `gorm:"not null"`
	Start     time.Time `gorm:"not null;type:date"`
	End       time.Time `gorm:"not null;type:date"`
	ProjectID uint      `gorm:"not null"`
	Userid    uint      `gorm:"not null"`
	Status    string    `gorm:"not null;default:'todo'"`
	Position  int       `gorm:"not null;default:0"`
}

type Task struct {
	gorm.Model
	Title     string `gorm:"not null"`
	Position  int    `gorm:"not null;default:0"`
	StageID   uint   `gorm:"not null"`
	ProjectID uint   `gorm:"not null"`
	Userid    uint   `gorm:"not null"`
}
