package api_tests

import (
	"bytes"
	"encoding/json"
	"lifeSync/internal/handlers/auth"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRegisterUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, mock := setupMockDB(t)

	mock.ExpectBegin()
	mock.ExpectQuery(`^INSERT INTO "users" \("created_at","updated_at","deleted_at","email","password"\) VALUES \(\$1,\$2,\$3,\$4,\$5\) RETURNING "id"$`).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), "test@example.com", sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	router := gin.Default()
	router.POST("/register", auth.RegisterUser(db))

	registerData := map[string]string{
		"email":    "test@example.com",
		"password": "password123",
	}
	jsonData, _ := json.Marshal(registerData)

	req, _ := http.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	router.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response map[string]interface{}
	json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Equal(t, "user registered successfully", response["message"])
	assert.Equal(t, float64(1), response["id"])

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
