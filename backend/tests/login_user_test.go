package api_tests

import (
	"bytes"
	"encoding/json"
	"lifeSync/internal/routes"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Email    string `gorm:"unique"`
	Password string
}

func setupMockDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a gorm database", err)
	}

	return gormDB, mock
}

func TestLoginUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, mock := setupMockDB(t)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	rows := sqlmock.NewRows([]string{"id", "email", "password"}).
		AddRow(1, "test@example.com", string(hashedPassword))

	mock.ExpectQuery("^SELECT (.+) FROM \"users\" WHERE email = \\$1 AND \"users\".\"deleted_at\" IS NULL ORDER BY \"users\".\"id\" LIMIT \\$2$").
		WithArgs("test@example.com", 1).
		WillReturnRows(rows)

	router := gin.Default()
	router.POST("/login", routes.LoginUser(db))

	loginData := map[string]string{
		"email":    "test@example.com",
		"password": "password123",
	}
	jsonData, _ := json.Marshal(loginData)

	req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	log.Println("Запрос на вход выполнен")
	log.Printf("Статус ответа: %d\n", resp.Code)
	log.Printf("Тело ответа: %s\n", resp.Body.String())

	assert.Equal(t, http.StatusOK, resp.Code)

	var response map[string]uint
	json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Equal(t, uint(1), response["id"])

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestLoginUserInvalidCredentials(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, mock := setupMockDB(t)

	mock.ExpectQuery("^SELECT (.+) FROM \"users\" WHERE email = \\$1 AND \"users\".\"deleted_at\" IS NULL ORDER BY \"users\".\"id\" LIMIT \\$2$").
		WithArgs("wrong@example.com", 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "email", "password"}))

	router := gin.Default()
	router.POST("/login", routes.LoginUser(db))

	loginData := map[string]string{
		"email":    "wrong@example.com",
		"password": "wrongpassword",
	}
	jsonData, _ := json.Marshal(loginData)

	req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	log.Println("Запрос на вход с неверными учетными данными выполнен")
	log.Printf("Статус ответа: %d\n", resp.Code)
	log.Printf("Тело ответа: %s\n", resp.Body.String())

	assert.Equal(t, http.StatusUnauthorized, resp.Code)

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
