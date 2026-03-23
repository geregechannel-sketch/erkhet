package httpapi

import (
	"errors"
	"net/http"
	"strings"

	"erkhet-api/internal/auth"
	"erkhet-api/internal/store"
)

type sessionUser struct {
	User      store.User
	RawToken  string
	TokenHash string
}

type authedHandler func(http.ResponseWriter, *http.Request, sessionUser)

func (s Server) requireAuth(next authedHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, err := s.currentSession(r)
		if err != nil {
			writeError(w, http.StatusUnauthorized, "authentication required")
			return
		}
		if session.User.Status != "active" {
			writeError(w, http.StatusForbidden, "account is not active")
			return
		}
		next(w, r, *session)
	}
}

func (s Server) requireAdmin(next authedHandler) http.HandlerFunc {
	return s.requireAuth(func(w http.ResponseWriter, r *http.Request, session sessionUser) {
		if !session.User.IsAdmin() {
			writeError(w, http.StatusForbidden, "admin access required")
			return
		}
		next(w, r, session)
	})
}

func (s Server) currentSession(r *http.Request) (*sessionUser, error) {
	authorization := strings.TrimSpace(r.Header.Get("Authorization"))
	if authorization == "" {
		return nil, store.ErrNotFound
	}
	if !strings.HasPrefix(strings.ToLower(authorization), "bearer ") {
		return nil, store.ErrNotFound
	}
	rawToken := strings.TrimSpace(authorization[7:])
	if rawToken == "" {
		return nil, store.ErrNotFound
	}
	tokenHash := auth.HashToken(rawToken)
	user, err := s.Repo.GetUserBySession(tokenHash)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return nil, err
		}
		return nil, err
	}
	return &sessionUser{User: user, RawToken: rawToken, TokenHash: tokenHash}, nil
}
