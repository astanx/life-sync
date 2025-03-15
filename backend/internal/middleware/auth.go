package middleware

import (
	"errors"
	"fmt"
	"lifeSync/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func init() {
	config.LoadEnv()
}

var mySigningKey = []byte(config.GetEnv("JWT_SECRET"))

func GetSingingKey() []byte {
	return mySigningKey
}

func GetUserClaimsFromCookie(c *gin.Context) (jwt.MapClaims, error) {
	tokenString, err := c.Cookie("token")
	if err != nil {
		return nil, fmt.Errorf("no token provided")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(config.GetEnv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}

func CreateTokenFromClaims(claims map[string]interface{}) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(claims))
	tokenString, err := token.SignedString([]byte(mySigningKey))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func GetCurrentUserID(c *gin.Context) (uint, error) {
	claims, err := GetUserClaimsFromCookie(c)
	if err != nil {
		return 0, err
	}

	userID, ok := claims["userid"].(float64)
	if !ok {
		return 0, errors.New("invalid user ID in token")
	}
	return uint(userID), nil
}
