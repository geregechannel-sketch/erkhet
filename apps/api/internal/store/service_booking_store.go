package store

import (
	"encoding/json"
	"strings"
)

const serviceBookingSelect = `
	select
		sb.id,
		sb.service_reference,
		sb.user_id,
		u.full_name,
		u.email,
		sb.service_type,
		sb.service_label,
		sb.status,
		sb.destination,
		sb.travel_date,
		sb.end_date,
		sb.quantity,
		sb.contact_name,
		sb.contact_email,
		sb.contact_phone,
		sb.details,
		sb.admin_note,
		sb.created_at,
		sb.updated_at
	from service_bookings sb
	join users u on u.id = sb.user_id
`

func (r Repository) EnsureServiceBookingSchema() error {
	const query = `
		create table if not exists service_bookings (
			id bigserial primary key,
			service_reference text not null unique,
			user_id bigint not null references users(id) on delete cascade,
			service_type text not null check (service_type in ('hotel', 'restaurant', 'flight', 'taxi', 'esim', 'insurance')),
			service_label text not null,
			status text not null default 'new' check (status in ('new', 'in_review', 'quoted', 'confirmed', 'cancelled', 'completed')),
			destination text not null default '',
			travel_date text not null default '',
			end_date text not null default '',
			quantity int not null default 1,
			contact_name text not null,
			contact_email text not null,
			contact_phone text not null default '',
			details jsonb not null default '{}'::jsonb,
			admin_note text not null default '',
			created_at timestamptz not null default now(),
			updated_at timestamptz not null default now()
		);
		create index if not exists idx_service_bookings_user_id on service_bookings(user_id);
		create index if not exists idx_service_bookings_type on service_bookings(service_type);
		create index if not exists idx_service_bookings_status on service_bookings(status);
	`
	if _, err := r.DB.Exec(query); err != nil {
		return err
	}
	const migrateConstraints = `
		do $$
		begin
			if exists (
				select 1 from pg_constraint
				where conname = 'service_bookings_service_type_check'
			) then
				alter table service_bookings drop constraint service_bookings_service_type_check;
			end if;
			if not exists (
				select 1 from pg_constraint
				where conname = 'service_bookings_service_type_allowed'
			) then
				alter table service_bookings
				add constraint service_bookings_service_type_allowed
				check (service_type in ('hotel', 'restaurant', 'flight', 'taxi', 'esim', 'insurance'));
			end if;
		end $$;
	`
	_, err := r.DB.Exec(migrateConstraints)
	return err
}

func serviceBookingLabel(serviceType string) string {
	switch serviceType {
	case "hotel":
		return "Зочид буудал захиалга"
	case "restaurant":
		return "Ресторан захиалга"
	case "flight":
		return "Онгоцны суудал захиалга"
	case "taxi":
		return "Такси захиалга"
	case "esim":
		return "e-SIM захиалга"
	case "insurance":
		return "Даатгал захиалга"
	default:
		return "Үйлчилгээний захиалга"
	}
}

func scanServiceBooking(row scanner) (ServiceBooking, error) {
	var (
		booking    ServiceBooking
		detailsRaw []byte
	)
	if err := row.Scan(
		&booking.ID,
		&booking.ServiceReference,
		&booking.UserID,
		&booking.UserName,
		&booking.UserEmail,
		&booking.ServiceType,
		&booking.ServiceLabel,
		&booking.Status,
		&booking.Destination,
		&booking.TravelDate,
		&booking.EndDate,
		&booking.Quantity,
		&booking.ContactName,
		&booking.ContactEmail,
		&booking.ContactPhone,
		&detailsRaw,
		&booking.AdminNote,
		&booking.CreatedAt,
		&booking.UpdatedAt,
	); err != nil {
		return ServiceBooking{}, err
	}
	booking.Details = map[string]any{}
	if len(detailsRaw) > 0 {
		_ = json.Unmarshal(detailsRaw, &booking.Details)
	}
	return booking, nil
}

func (r Repository) CreateServiceBooking(userID int64, serviceType, destination, travelDate, endDate string, quantity int, contactName, contactEmail, contactPhone string, details map[string]any) (ServiceBooking, error) {
	user, err := r.GetUserByID(userID)
	if err != nil {
		return ServiceBooking{}, err
	}
	if quantity < 1 {
		quantity = 1
	}
	if strings.TrimSpace(contactName) == "" {
		contactName = user.FullName
	}
	if strings.TrimSpace(contactEmail) == "" {
		contactEmail = user.Email
	}
	if strings.TrimSpace(contactPhone) == "" {
		contactPhone = user.Phone
	}
	if details == nil {
		details = map[string]any{}
	}
	reference, err := newReference("SRV")
	if err != nil {
		return ServiceBooking{}, err
	}
	detailsJSON, err := json.Marshal(details)
	if err != nil {
		return ServiceBooking{}, err
	}
	const query = `
		insert into service_bookings (
			service_reference,
			user_id,
			service_type,
			service_label,
			destination,
			travel_date,
			end_date,
			quantity,
			contact_name,
			contact_email,
			contact_phone,
			details
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
	`
	if _, err := r.DB.Exec(
		query,
		reference,
		userID,
		serviceType,
		serviceBookingLabel(serviceType),
		strings.TrimSpace(destination),
		strings.TrimSpace(travelDate),
		strings.TrimSpace(endDate),
		quantity,
		strings.TrimSpace(contactName),
		normalizeEmail(contactEmail),
		strings.TrimSpace(contactPhone),
		string(detailsJSON),
	); err != nil {
		return ServiceBooking{}, err
	}
	return r.GetServiceBookingByReference(reference)
}

func (r Repository) GetServiceBookingByReference(reference string) (ServiceBooking, error) {
	return scanServiceBooking(r.DB.QueryRow(serviceBookingSelect+` where sb.service_reference = $1`, reference))
}

func (r Repository) ListServiceBookingsByUser(userID int64) ([]ServiceBooking, error) {
	rows, err := r.DB.Query(serviceBookingSelect+` where sb.user_id = $1 order by sb.created_at desc`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []ServiceBooking{}
	for rows.Next() {
		item, err := scanServiceBooking(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r Repository) ListServiceBookings(filter ServiceBookingFilter) ([]ServiceBooking, error) {
	query := serviceBookingSelect + ` where 1 = 1`
	args := []any{}
	if filter.Status != "" {
		args = append(args, filter.Status)
		query += ` and sb.status = $` + itoa(len(args))
	}
	if filter.ServiceType != "" {
		args = append(args, filter.ServiceType)
		query += ` and sb.service_type = $` + itoa(len(args))
	}
	if filter.Search != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		query += ` and (
			lower(sb.service_reference) like $` + itoa(len(args)) + `
			or lower(sb.service_label) like $` + itoa(len(args)) + `
			or lower(sb.destination) like $` + itoa(len(args)) + `
			or lower(sb.contact_name) like $` + itoa(len(args)) + `
			or lower(sb.contact_email) like $` + itoa(len(args)) + `
			or lower(coalesce(u.full_name, '')) like $` + itoa(len(args)) + `
		)`
	}
	query += ` order by sb.created_at desc`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []ServiceBooking{}
	for rows.Next() {
		item, err := scanServiceBooking(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r Repository) UpdateServiceBookingAdmin(reference, status, adminNote string) (ServiceBooking, error) {
	const query = `
		update service_bookings
		set status = $2,
			admin_note = $3,
			updated_at = now()
		where service_reference = $1
	`
	result, err := r.DB.Exec(query, reference, status, strings.TrimSpace(adminNote))
	if err != nil {
		return ServiceBooking{}, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return ServiceBooking{}, err
	}
	if affected == 0 {
		return ServiceBooking{}, ErrNotFound
	}
	return r.GetServiceBookingByReference(reference)
}






