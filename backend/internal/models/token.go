package models

import (
	"gorm.io/gorm"
)

type Token struct {
	gorm.Model
	Token  string `gorm:"unique"`
	Userid uint   `gorm:"not null"`
	User   User   `gorm:"foreignKey:Userid"`
}
