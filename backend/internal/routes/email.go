package routes

import (
	"crypto/rand"
	"fmt"
	"lifeSync/internal/config"
	"net/http"
	"net/smtp"

	"github.com/gin-gonic/gin"
)

func SendVerificationCode(c *gin.Context) {
	fmt.Print(c.Cookie("token"))
	fmt.Print(121321)
	claims, err := getUserClaimsFromCookie(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	smtpHost := config.GetEnv("smtpHost")
	smtpPort := config.GetEnv("smtpPort")
	email := config.GetEnv("email")
	password := config.GetEnv("email_password")

	from := email
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

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "verification_code",
		Value:    verificationCode,
		Path:     "/api",
		HttpOnly: true,
		Secure:   true,
		MaxAge:   300,
	})

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
	cookie, err := c.Cookie("verification_code")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No verification code found"})
		return
	}

	userInput := c.PostForm("code")

	if userInput == cookie {
		c.JSON(http.StatusOK, gin.H{"message": "Code validated successfully"})
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid verification code"})
	}
}
