package models

import (
	"gorm.io/gorm"
)

type UserDB struct {
	gorm.Model
	Username string `gorm:"type:text" json:"username"`
	Password string `gorm:"type:text" json:"password"`
}
type TokenDB struct {
	gorm.Model
	Token  string `gorm:"unique"`
	Userid uint   `gorm:"not null"`
	User   User   `gorm:"foreignKey:Userid"`
}
