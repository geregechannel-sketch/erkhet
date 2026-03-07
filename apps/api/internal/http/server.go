package httpapi

import (
  "encoding/json"
  "net/http"

  "erkhet-api/internal/store"
)

type Server struct {
  InquiryStore store.InquiryStore
}

func (s Server) Register(mux *http.ServeMux) {
  mux.HandleFunc("/api/health", s.health)
  mux.HandleFunc("/api/company", s.company)
  mux.HandleFunc("/api/tours", s.tours)
  mux.HandleFunc("/api/destinations", s.destinations)
  mux.HandleFunc("/api/inquiries", s.inquiries)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
  w.Header().Set("Content-Type", "application/json")
  w.WriteHeader(status)
  _ = json.NewEncoder(w).Encode(payload)
}
