package models

import (
	"gorm.io/gorm"
)

type UserDB struct {
	gorm.Model
	Username string `gorm:"type:text" json:"username"`
	Password string `gorm:"type:text" json:"password"`
}
