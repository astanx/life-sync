package routes

import (
	"fmt"
	"lifeSync/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	apiRoutes := r.Group("/api")
	{
		apiRoutes.POST("/register", RegisterUser(db))
		apiRoutes.POST("/login", LoginUser(db))
		apiRoutes.GET("/createJWT", createToken(db))
		apiRoutes.GET("/validateJWT", validateToken(db))
	}

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Welcome to lifeSync API"})
	})
}

func RegisterUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not hash password"})
			return
		}
		user.Password = string(hashedPassword)

		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "user registered successfully"})
	}
}

func LoginUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		var foundUser models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Where("username = ?", user.Username).First(&foundUser).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(foundUser.Password), []byte(user.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		// JWT
		// github.com/dgrijalva/jwt-go
		// ...

		c.JSON(http.StatusOK, gin.H{"message": "login successful"})
	}
}

var mySigningKey = []byte("secret_key")

func createToken(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var request struct {
			Username string `json:"username"`
			Userid   uint   `json:"userid"`
		}

		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		token := jwt.New(jwt.SigningMethodHS256)

		claims := token.Claims.(jwt.MapClaims)
		claims["userid"] = request.Userid
		claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

		tokenString, err := token.SignedString(mySigningKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := db.WithContext(c).Create(&models.Token{Token: tokenString, Userid: request.Userid}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"token": tokenString})
	}
}

func validateToken(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("invalid signing method")
			}
			return mySigningKey, nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			var storedToken models.Token
			if err := db.Where("token = ?", tokenString).First(&storedToken).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
				return
			}

			c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Hello, %s!", claims["username"])})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		}
	}
}
