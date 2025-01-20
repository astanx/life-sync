package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"unique" json:"username"`
	Password string `json:"password"`
}

type UserDB struct {
	gorm.Model
	Username string `gorm:"type:text" json:"username"`
	Password string `gorm:"type:text" json:"password"`
}

type Token struct {
	gorm.Model
	Token  string `gorm:"unique"`
	Userid uint   `gorm:"not null"`
	User   UserDB `gorm:"foreignKey:Userid"`
}
