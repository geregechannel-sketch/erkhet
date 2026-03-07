package store

import "time"

type Inquiry struct {
  Name         string    `json:"name"`
  Phone        string    `json:"phone"`
  Email        string    `json:"email"`
  InterestedIn string    `json:"interested_tour"`
  PeopleCount  int       `json:"people_count"`
  DaysCount    int       `json:"days_count"`
  Note         string    `json:"note"`
  CreatedAt    time.Time `json:"created_at,omitempty"`
}
