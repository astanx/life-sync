package routes

import (
	"crypto/rand"
	"fmt"
	"lifeSync/internal/config"
	"lifeSync/internal/models"
	"net/http"
	"net/smtp"
	"time"

	"github.com/gin-gonic/gin"
)

func SendVerificationCode(c *gin.Context) {
	claims, err := getUserClaimsFromCookie(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	smtpHost := config.GetEnv("smtpHost")
	smtpPort := config.GetEnv("smtpPort")
	email := config.GetEnv("email")
	password := config.GetEnv("email_password")

	to, ok := claims["email"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "email not found in token claims", "claims": claims})
		return
	}

	verificationCode, err := generateVerificationCode()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	claims["code"] = verificationCode

	tokenString, err := createTokenFromClaims(claims)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	cookie := http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Path:     "/",
		Domain:   "lifesync-backend.onrender.com",
		MaxAge:   3600,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Expires:  time.Now().Add(1 * time.Hour),
	}

	http.SetCookie(c.Writer, &cookie)

	from := email
	subject := "Verification Code for Your LifeSync Account"
	body := fmt.Sprintf(
		"Hello!\n\nUse the following code to verify your account:\n\nVerification Code: %s\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nLifeSync Team.",
		verificationCode,
	)
	message := []byte("Subject: " + subject + "\n\n" + body)

	auth := smtp.PlainAuth("", email, password, smtpHost)

	if err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message); err != nil {
		fmt.Println("Error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification code"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Verification code sent to your email"})
}

func generateVerificationCode() (string, error) {
	b := make([]byte, 2)

	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	num := int(b[0])<<8 + int(b[1])
	code := num%90000 + 10000

	return fmt.Sprintf("%d", code), nil
}

func ValidateCode(c *gin.Context) {
	var code models.Code
	claims, err := getUserClaimsFromCookie(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No verification code found"})
		return
	}

	verificationCode, ok := claims["code"].(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No verification code found in token"})
		return
	}

	if err := c.ShouldBindJSON(&code); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if code.Code == verificationCode {
		c.JSON(http.StatusOK, gin.H{"message": "Code validated successfully"})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid verification code"})
	}
}
