package main

import (
  "log"
  "net/http"
  "os"

  "erkhet-api/internal/db"
  httpapi "erkhet-api/internal/http"
  "erkhet-api/internal/store"
)

func main() {
  port := os.Getenv("PORT")
  if port == "" {
    port = "8080"
  }

  database, err := db.Open()
  if err != nil {
    log.Fatalf("database connection failed: %v", err)
  }
  defer database.Close()

  mux := http.NewServeMux()
  server := httpapi.Server{InquiryStore: store.InquiryStore{DB: database}}
  server.Register(mux)

  handler := withCORS(mux)
  log.Printf("api server listening on :%s", port)
  if err := http.ListenAndServe(":"+port, handler); err != nil {
    log.Fatal(err)
  }
}

func withCORS(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    if r.Method == http.MethodOptions {
      w.WriteHeader(http.StatusNoContent)
      return
    }
    next.ServeHTTP(w, r)
  })
}
