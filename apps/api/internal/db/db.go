package db

import (
  "database/sql"
  "fmt"
  "os"
  "time"

  _ "github.com/lib/pq"
)

func Open() (*sql.DB, error) {
  dsn := os.Getenv("DATABASE_URL")
  if dsn == "" {
    return nil, fmt.Errorf("DATABASE_URL is required")
  }

  db, err := sql.Open("postgres", dsn)
  if err != nil {
    return nil, err
  }

  db.SetConnMaxLifetime(5 * time.Minute)
  db.SetMaxOpenConns(15)
  db.SetMaxIdleConns(5)

  if err := db.Ping(); err != nil {
    return nil, err
  }

  return db, nil
}
