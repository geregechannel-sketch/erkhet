package httpapi

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"erkhet-api/internal/auth"
	"erkhet-api/internal/store"
)

type authInput struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type forgotPasswordInput struct {
	Email string `json:"email"`
}

type resetPasswordInput struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

type changePasswordInput struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type forgotPasswordResponse struct {
	OK               bool   `json:"ok"`
	PreviewResetLink string `json:"previewResetLink,omitempty"`
}

func (s Server) register(w http.ResponseWriter, r *http.Request) {
	var input authInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if strings.TrimSpace(input.FullName) == "" || strings.TrimSpace(input.Email) == "" || len(strings.TrimSpace(input.Password)) < 8 {
		writeError(w, http.StatusBadRequest, "full name, email, and password are required")
		return
	}
	hash, err := auth.HashPassword(input.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create account")
		return
	}
	user, err := s.Repo.CreateUser(input.FullName, input.Email, input.Phone, hash)
	if err != nil {
		if errors.Is(err, store.ErrConflict) {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to create account")
		return
	}
	token, err := newSessionToken()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	ttl := s.SessionTTL
	if ttl == 0 {
		ttl = 72 * time.Hour
	}
	if err := s.Repo.CreateSession(user.ID, auth.HashToken(token), time.Now().UTC().Add(ttl)); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"token": token, "user": user})
}

func (s Server) login(w http.ResponseWriter, r *http.Request) {
	var input authInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	user, err := s.Repo.GetUserByEmail(input.Email)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}
	if user.Status != "active" {
		writeError(w, http.StatusForbidden, "account is not active")
		return
	}
	if err := auth.CheckPassword(user.PasswordHash, input.Password); err != nil {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}
	token, err := newSessionToken()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	ttl := s.SessionTTL
	if ttl == 0 {
		ttl = 72 * time.Hour
	}
	if err := s.Repo.CreateSession(user.ID, auth.HashToken(token), time.Now().UTC().Add(ttl)); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create session")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "user": user})
}

func (s Server) forgotPassword(w http.ResponseWriter, r *http.Request) {
	var input forgotPasswordInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if strings.TrimSpace(input.Email) == "" {
		writeError(w, http.StatusBadRequest, "email is required")
		return
	}

	response := forgotPasswordResponse{OK: true}
	user, err := s.Repo.GetUserByEmail(input.Email)
	if err == nil && user.Status == "active" {
		token, tokenErr := newSessionToken()
		if tokenErr != nil {
			writeError(w, http.StatusInternalServerError, "failed to create reset token")
			return
		}
		resetTTL := s.PasswordResetTTL
		if resetTTL == 0 {
			resetTTL = 30 * time.Minute
		}
		if err := s.Repo.CreatePasswordResetToken(user.ID, auth.HashToken(token), time.Now().UTC().Add(resetTTL)); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to create reset token")
			return
		}
		if s.PasswordResetPreview {
			baseURL := strings.TrimRight(s.PublicBaseURL, "/")
			if baseURL == "" {
				baseURL = "http://localhost:3000"
			}
			response.PreviewResetLink = baseURL + "/auth/reset-password/" + token
		}
	}

	writeJSON(w, http.StatusOK, response)
}

func (s Server) resetPassword(w http.ResponseWriter, r *http.Request) {
	var input resetPasswordInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if strings.TrimSpace(input.Token) == "" || len(strings.TrimSpace(input.Password)) < 8 {
		writeError(w, http.StatusBadRequest, "token and password are required")
		return
	}
	hash, err := auth.HashPassword(input.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to reset password")
		return
	}
	if err := s.Repo.ResetPasswordWithToken(auth.HashToken(input.Token), hash); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusBadRequest, "invalid or expired reset token")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to reset password")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s Server) changePassword(w http.ResponseWriter, r *http.Request, session sessionUser) {
	var input changePasswordInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}

	currentPassword := strings.TrimSpace(input.CurrentPassword)
	newPassword := strings.TrimSpace(input.NewPassword)
	if currentPassword == "" || len(newPassword) < 8 {
		writeError(w, http.StatusBadRequest, "current password and new password are required")
		return
	}
	if err := auth.CheckPassword(session.User.PasswordHash, currentPassword); err != nil {
		writeError(w, http.StatusUnauthorized, "current password is incorrect")
		return
	}
	newHash, err := auth.HashPassword(newPassword)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update password")
		return
	}
	if err := s.Repo.UpdateUserPassword(session.User.ID, newHash); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update password")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s Server) me(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	writeJSON(w, http.StatusOK, session.User)
}

func (s Server) logout(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	if err := s.Repo.DeleteSession(session.TokenHash); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to log out")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}
