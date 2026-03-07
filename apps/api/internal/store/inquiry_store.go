package store

import "database/sql"

type InquiryStore struct {
  DB *sql.DB
}

func (s InquiryStore) Create(input Inquiry) error {
  const q = `
    insert into inquiries (name, phone, email, interested_tour, people_count, days_count, note)
    values ($1, $2, $3, $4, $5, $6, $7)
  `

  _, err := s.DB.Exec(q,
    input.Name,
    input.Phone,
    input.Email,
    input.InterestedIn,
    input.PeopleCount,
    input.DaysCount,
    input.Note,
  )

  return err
}
