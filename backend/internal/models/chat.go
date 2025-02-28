package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Chat struct {
	gorm.Model
	Title               string        `gorm:"not null"`
	ProjectID           uint          `gorm:"not null"`
	CreatorID           uint          `gorm:"not null"`
	CollaboratorUserIDs pq.Int64Array `gorm:"type:integer[]"`
}

type Message struct {
	gorm.Model
	Content string `gorm:"type:text; not null"`
	ChatID  uint   `gorm:"not null"`
	UserID  uint   `gorm:"not null"`
	Sender  string `gorm:"type:text; not null"`
}
