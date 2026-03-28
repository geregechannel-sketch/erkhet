package store

import (
	"database/sql"
	"strings"
)

const supportSelect = `
	select
		s.id,
		s.support_reference,
		s.user_id,
		u.full_name,
		b.booking_reference,
		t.slug,
		t.title,
		s.type,
		s.subject,
		s.message,
		s.customer_name,
		s.customer_email,
		s.customer_phone,
		s.status,
		s.admin_note,
		s.created_at,
		s.updated_at
	from support_requests s
	left join users u on u.id = s.user_id
	left join bookings b on b.id = s.booking_id
	left join tours t on t.id = s.tour_id
`

func (r Repository) CreateSupportRequest(userID *int64, bookingReference, tourSlug, supportType, subject, message, customerName, customerEmail, customerPhone, locale string) (SupportRequest, error) {
	var bookingID any = nil
	if strings.TrimSpace(bookingReference) != "" {
		var id int64
		if err := r.DB.QueryRow(`select id from bookings where booking_reference = $1`, strings.TrimSpace(bookingReference)).Scan(&id); err != nil {
			if err == sql.ErrNoRows {
				return SupportRequest{}, ErrNotFound
			}
			return SupportRequest{}, err
		}
		bookingID = id
	}

	var tourID any = nil
	if strings.TrimSpace(tourSlug) != "" {
		var id int64
		if err := r.DB.QueryRow(`select id from tours where slug = $1`, strings.TrimSpace(tourSlug)).Scan(&id); err != nil {
			if err == sql.ErrNoRows {
				return SupportRequest{}, ErrNotFound
			}
			return SupportRequest{}, err
		}
		tourID = id
	}

	userValue := any(nil)
	if userID != nil {
		user, err := r.GetUserByID(*userID)
		if err != nil {
			return SupportRequest{}, err
		}
		userValue = *userID
		if strings.TrimSpace(customerName) == "" {
			customerName = user.FullName
		}
		if strings.TrimSpace(customerEmail) == "" {
			customerEmail = user.Email
		}
		if strings.TrimSpace(customerPhone) == "" {
			customerPhone = user.Phone
		}
	}

	reference, err := newReference("SUP")
	if err != nil {
		return SupportRequest{}, err
	}
	const query = `
		insert into support_requests (
			support_reference,
			user_id,
			booking_id,
			tour_id,
			type,
			subject,
			message,
			customer_name,
			customer_email,
			customer_phone
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	if _, err := r.DB.Exec(
		query,
		reference,
		userValue,
		bookingID,
		tourID,
		supportType,
		strings.TrimSpace(subject),
		strings.TrimSpace(message),
		strings.TrimSpace(customerName),
		normalizeEmail(customerEmail),
		strings.TrimSpace(customerPhone),
	); err != nil {
		return SupportRequest{}, err
	}
	if err := r.insertSupportEvent(reference, "created", "Support request created", "Customer"); err != nil {
		return SupportRequest{}, err
	}
	autoReply := localizedSupportAutoReply(locale, supportType)
	if err := r.insertSupportEvent(reference, "auto_reply", autoReply.Message, autoReply.ActorLabel); err != nil {
		return SupportRequest{}, err
	}
	return r.GetSupportRequestByReference(reference, true)
}

func (r Repository) ListSupportRequestsByUser(userID int64) ([]SupportRequest, error) {
	rows, err := r.DB.Query(supportSelect+` where s.user_id = $1 order by s.created_at desc`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []SupportRequest{}
	for rows.Next() {
		request, err := scanSupportRequest(rows)
		if err != nil {
			return nil, err
		}
		events, err := r.ListSupportEvents(request.SupportReference)
		if err != nil {
			return nil, err
		}
		request.Events = events
		items = append(items, request)
	}
	return items, rows.Err()
}

func (r Repository) ListSupportRequests(filter SupportFilter) ([]SupportRequest, error) {
	query := supportSelect + ` where 1 = 1`
	args := []any{}
	if filter.Status != "" {
		args = append(args, filter.Status)
		query += ` and s.status = $` + itoa(len(args))
	}
	if filter.Type != "" {
		args = append(args, filter.Type)
		query += ` and s.type = $` + itoa(len(args))
	}
	if filter.Search != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		query += ` and (
			lower(s.support_reference) like $` + itoa(len(args)) + `
			or lower(coalesce(b.booking_reference, '')) like $` + itoa(len(args)) + `
			or lower(coalesce(t.slug, '')) like $` + itoa(len(args)) + `
			or lower(coalesce(t.title, '')) like $` + itoa(len(args)) + `
			or lower(s.subject) like $` + itoa(len(args)) + `
			or lower(s.customer_name) like $` + itoa(len(args)) + `
			or lower(coalesce(s.customer_email, '')) like $` + itoa(len(args)) + `
			or lower(coalesce(u.full_name, '')) like $` + itoa(len(args)) + `
		)`
	}
	query += ` order by s.created_at desc`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []SupportRequest{}
	for rows.Next() {
		request, err := scanSupportRequest(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, request)
	}
	return items, rows.Err()
}

func (r Repository) GetSupportRequestByReference(reference string, includeEvents bool) (SupportRequest, error) {
	request, err := scanSupportRequest(r.DB.QueryRow(supportSelect+` where s.support_reference = $1`, reference))
	if err != nil {
		return SupportRequest{}, err
	}
	if includeEvents {
		events, err := r.ListSupportEvents(reference)
		if err != nil {
			return SupportRequest{}, err
		}
		request.Events = events
	}
	return request, nil
}

func (r Repository) UpdateSupportRequestAdmin(reference, status, adminNote, actorLabel string) (SupportRequest, error) {
	const query = `
		update support_requests
		set status = $2,
			admin_note = $3,
			updated_at = now()
		where support_reference = $1
	`
	result, err := r.DB.Exec(query, reference, status, strings.TrimSpace(adminNote))
	if err != nil {
		return SupportRequest{}, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return SupportRequest{}, err
	}
	if affected == 0 {
		return SupportRequest{}, ErrNotFound
	}
	message := "Status updated to " + status
	if strings.TrimSpace(adminNote) != "" {
		message += ": " + strings.TrimSpace(adminNote)
	}
	if err := r.insertSupportEvent(reference, "status", message, actorLabel); err != nil {
		return SupportRequest{}, err
	}
	return r.GetSupportRequestByReference(reference, true)
}

func (r Repository) ListSupportEvents(reference string) ([]SupportEvent, error) {
	const query = `
		select e.id, e.event_type, e.message, e.actor_label, e.created_at
		from support_request_events e
		join support_requests s on s.id = e.support_request_id
		where s.support_reference = $1
		order by e.created_at asc
	`
	rows, err := r.DB.Query(query, reference)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []SupportEvent{}
	for rows.Next() {
		var event SupportEvent
		if err := rows.Scan(&event.ID, &event.EventType, &event.Message, &event.ActorLabel, &event.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, rows.Err()
}

func (r Repository) insertSupportEvent(reference, eventType, message, actorLabel string) error {
	const query = `
		insert into support_request_events (support_request_id, event_type, message, actor_label)
		values ((select id from support_requests where support_reference = $1), $2, $3, $4)
	`
	_, err := r.DB.Exec(query, reference, eventType, message, actorLabel)
	return err
}

func (r Repository) GetAdminSummary() (AdminSummary, error) {
	const query = `
		select
			(select count(*) from users),
			(select count(*) from tours where status = 'published'),
			(select count(*) from bookings where booking_status = 'pending'),
			(select count(*) from payments where status = 'pending'),
			(select count(*) from bookings where payment_status <> 'paid'),
			(select count(*) from support_requests where status in ('new', 'in_review'))
	`
	var summary AdminSummary
	if err := r.DB.QueryRow(query).Scan(
		&summary.TotalUsers,
		&summary.PublishedTours,
		&summary.PendingBookings,
		&summary.PendingPayments,
		&summary.Unreconciled,
		&summary.OpenSupportRequests,
	); err != nil {
		return AdminSummary{}, err
	}
	return summary, nil
}
