package store

func (r Repository) EnsureBookingFeatureSchema() error {
	const query = `
		alter table bookings add column if not exists traveler_details jsonb not null default '[]'::jsonb;
	`
	_, err := r.DB.Exec(query)
	return err
}