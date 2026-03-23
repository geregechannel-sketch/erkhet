package store

import (
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"time"
)

const bookingSelect = `
	select
		b.id,
		b.booking_reference,
		b.user_id,
		u.full_name,
		u.email,
		b.tour_id,
		t.slug,
		t.title,
		b.traveler_name,
		b.email,
		b.phone,
		b.preferred_departure_date,
		b.participant_count,
		b.note,
		b.traveler_details,
		b.amount,
		b.currency,
		b.booking_status,
		b.payment_status,
		b.admin_note,
		b.review_flag,
		b.review_note,
		b.created_at,
		b.updated_at
	from bookings b
	join users u on u.id = b.user_id
	join tours t on t.id = b.tour_id
`

const paymentSelect = `
	select
		p.id,
		p.payment_reference,
		p.booking_id,
		b.booking_reference,
		p.user_id,
		u.full_name,
		t.title,
		p.provider,
		p.method,
		p.provider_reference,
		p.amount,
		p.currency,
		p.status,
		p.failure_reason,
		p.refunded_amount,
		p.paid_at,
		p.created_at,
		p.updated_at
	from payments p
	join bookings b on b.id = p.booking_id
	join users u on u.id = p.user_id
	join tours t on t.id = b.tour_id
`

func normalizeTravelerDetails(details []TravelerDetail) []TravelerDetail {
	cleaned := make([]TravelerDetail, 0, len(details))
	for _, item := range details {
		normalized := TravelerDetail{
			FullName: strings.TrimSpace(item.FullName),
			Age:      item.Age,
			Gender:   strings.TrimSpace(item.Gender),
			Hobby:    strings.TrimSpace(item.Hobby),
			Diet:     strings.TrimSpace(item.Diet),
			Allergy:  strings.TrimSpace(item.Allergy),
		}
		if normalized.Age < 0 {
			normalized.Age = 0
		}
		if normalized.FullName == "" && normalized.Age == 0 && normalized.Gender == "" && normalized.Hobby == "" && normalized.Diet == "" && normalized.Allergy == "" {
			continue
		}
		cleaned = append(cleaned, normalized)
	}
	return cleaned
}

func (r Repository) CreateBooking(userID int64, tourSlug, travelerName, email, phone, preferredDepartureDate string, participantCount int, travelerDetails []TravelerDetail, note string) (Booking, error) {
	tour, err := r.GetTourBySlug(tourSlug, false)
	if err != nil {
		return Booking{}, err
	}

	if participantCount < 1 {
		participantCount = 1
	}
	currency := tour.Currency
	if currency == "" {
		currency = "MNT"
	}
	amount := 0.0
	if tour.PriceAmount != nil {
		amount = *tour.PriceAmount * float64(participantCount)
	}
	reference, err := newReference("BK")
	if err != nil {
		return Booking{}, err
	}
	travelerDetails = normalizeTravelerDetails(travelerDetails)
	travelerDetailsJSON, err := json.Marshal(travelerDetails)
	if err != nil {
		return Booking{}, err
	}

	const query = `
		insert into bookings (
			booking_reference,
			user_id,
			tour_id,
			traveler_name,
			email,
			phone,
			preferred_departure_date,
			participant_count,
			note,
			traveler_details,
			amount,
			currency
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
	`
	_, err = r.DB.Exec(
		query,
		reference,
		userID,
		tour.ID,
		strings.TrimSpace(travelerName),
		normalizeEmail(email),
		strings.TrimSpace(phone),
		strings.TrimSpace(preferredDepartureDate),
		participantCount,
		strings.TrimSpace(note),
		string(travelerDetailsJSON),
		amount,
		currency,
	)
	if err != nil {
		return Booking{}, err
	}
	return r.GetBookingByReference(reference)
}

func (r Repository) ListBookingsByUser(userID int64) ([]Booking, error) {
	rows, err := r.DB.Query(bookingSelect+` where b.user_id = $1 order by b.created_at desc`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bookings := []Booking{}
	for rows.Next() {
		booking, err := scanBooking(rows)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, booking)
	}
	return bookings, rows.Err()
}

func (r Repository) ListBookings(filter BookingFilter) ([]Booking, error) {
	query := bookingSelect + ` where 1 = 1`
	args := []any{}
	if filter.Status != "" {
		args = append(args, filter.Status)
		query += ` and b.booking_status = $` + itoa(len(args))
	}
	if filter.Tour != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Tour))+"%")
		query += ` and lower(t.title) like $` + itoa(len(args))
	}
	if filter.User != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.User))+"%")
		query += ` and (lower(u.full_name) like $` + itoa(len(args)) + ` or lower(u.email) like $` + itoa(len(args)) + `)`
	}
	if filter.Search != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		query += ` and (lower(b.booking_reference) like $` + itoa(len(args)) + ` or lower(t.title) like $` + itoa(len(args)) + ` or lower(u.full_name) like $` + itoa(len(args)) + `)`
	}
	query += ` order by b.created_at desc`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bookings := []Booking{}
	for rows.Next() {
		booking, err := scanBooking(rows)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, booking)
	}
	return bookings, rows.Err()
}

func (r Repository) GetBookingByReference(reference string) (Booking, error) {
	return scanBooking(r.DB.QueryRow(bookingSelect+` where b.booking_reference = $1`, reference))
}

func (r Repository) UpdateBookingAdmin(reference, bookingStatus, adminNote string) (Booking, error) {
	const query = `
		update bookings
		set booking_status = $2,
			admin_note = $3,
			updated_at = now()
		where booking_reference = $1
	`
	result, err := r.DB.Exec(query, reference, bookingStatus, strings.TrimSpace(adminNote))
	if err != nil {
		return Booking{}, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return Booking{}, err
	}
	if affected == 0 {
		return Booking{}, ErrNotFound
	}
	return r.GetBookingByReference(reference)
}

func (r Repository) UpdateBookingReview(reference string, reviewFlag bool, reviewNote string) (Booking, error) {
	const query = `
		update bookings
		set review_flag = $2,
			review_note = $3,
			updated_at = now()
		where booking_reference = $1
	`
	result, err := r.DB.Exec(query, reference, reviewFlag, strings.TrimSpace(reviewNote))
	if err != nil {
		return Booking{}, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return Booking{}, err
	}
	if affected == 0 {
		return Booking{}, ErrNotFound
	}
	return r.GetBookingByReference(reference)
}

func (r Repository) ListPaymentsByUser(userID int64) ([]Payment, error) {
	rows, err := r.DB.Query(paymentSelect+` where p.user_id = $1 order by p.created_at desc`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	payments := []Payment{}
	for rows.Next() {
		payment, err := scanPayment(rows)
		if err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}
	return payments, rows.Err()
}

func (r Repository) ListPayments(filter PaymentFilter) ([]Payment, error) {
	query := paymentSelect + ` where 1 = 1`
	args := []any{}
	if filter.Status != "" {
		args = append(args, filter.Status)
		query += ` and p.status = $` + itoa(len(args))
	}
	if filter.Method != "" {
		args = append(args, filter.Method)
		query += ` and p.method = $` + itoa(len(args))
	}
	if filter.Search != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(filter.Search))+"%")
		query += ` and (lower(p.payment_reference) like $` + itoa(len(args)) + ` or lower(b.booking_reference) like $` + itoa(len(args)) + ` or lower(u.full_name) like $` + itoa(len(args)) + ` or lower(t.title) like $` + itoa(len(args)) + `)`
	}
	query += ` order by p.created_at desc`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	payments := []Payment{}
	for rows.Next() {
		payment, err := scanPayment(rows)
		if err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}
	return payments, rows.Err()
}

func (r Repository) GetPaymentByReference(reference string) (Payment, error) {
	return scanPayment(r.DB.QueryRow(paymentSelect+` where p.payment_reference = $1`, reference))
}

func (r Repository) CreatePayment(bookingReference string, userID int64, provider, method string) (Payment, error) {
	booking, err := r.GetBookingByReference(bookingReference)
	if err != nil {
		return Payment{}, err
	}
	if booking.UserID != userID {
		return Payment{}, ErrNotFound
	}
	if booking.Amount <= 0 {
		return Payment{}, ErrConflict
	}
	if booking.BookingStatus == "cancelled" {
		return Payment{}, ErrConflict
	}
	paymentReference, err := newReference("PAY")
	if err != nil {
		return Payment{}, err
	}
	providerReference, err := newReference("GW")
	if err != nil {
		return Payment{}, err
	}

	const query = `
		insert into payments (
			payment_reference,
			booking_id,
			user_id,
			provider,
			method,
			provider_reference,
			amount,
			currency,
			status
		)
		values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
	`
	if _, err := r.DB.Exec(query, paymentReference, booking.ID, userID, provider, method, providerReference, booking.Amount, booking.Currency); err != nil {
		return Payment{}, err
	}
	if err := r.refreshBookingPaymentStatus(booking.ID); err != nil {
		return Payment{}, err
	}
	return r.GetPaymentByReference(paymentReference)
}

func (r Repository) SimulatePayment(reference string, userID int64, outcome string) (Payment, error) {
	payment, err := r.GetPaymentByReference(reference)
	if err != nil {
		return Payment{}, err
	}
	if payment.UserID != userID {
		return Payment{}, ErrNotFound
	}
	if payment.Status != "pending" {
		return payment, nil
	}

	status := "pending"
	failureReason := ""
	paidAt := any(nil)
	refundedAmount := payment.RefundedAmount
	providerReference := payment.ProviderReference
	if providerReference == "" {
		providerReference, err = newReference("GW")
		if err != nil {
			return Payment{}, err
		}
	}

	switch outcome {
	case "success":
		status = "paid"
		now := time.Now().UTC()
		paidAt = now
	case "failed":
		status = "failed"
		failureReason = "Demo payment failed"
	case "cancelled":
		status = "cancelled"
		failureReason = "Customer cancelled payment"
	default:
		return Payment{}, fmt.Errorf("unsupported payment outcome")
	}

	const query = `
		update payments
		set status = $2,
			failure_reason = $3,
			provider_reference = $4,
			refunded_amount = $5,
			paid_at = $6,
			updated_at = now()
		where payment_reference = $1
	`
	if _, err := r.DB.Exec(query, reference, status, failureReason, providerReference, refundedAmount, paidAt); err != nil {
		return Payment{}, err
	}
	if err := r.refreshBookingPaymentStatus(payment.BookingID); err != nil {
		return Payment{}, err
	}
	return r.GetPaymentByReference(reference)
}

func (r Repository) UpdatePaymentAdmin(reference, status, providerReference, failureReason string, refundedAmount float64) (Payment, error) {
	payment, err := r.GetPaymentByReference(reference)
	if err != nil {
		return Payment{}, err
	}
	paidAt := any(nil)
	if payment.PaidAt != nil {
		paidAt = *payment.PaidAt
	}
	if status == "paid" && payment.PaidAt == nil {
		now := time.Now().UTC()
		paidAt = now
	}
	if status != "paid" {
		paidAt = nil
	}
	const query = `
		update payments
		set status = $2,
			provider_reference = $3,
			failure_reason = $4,
			refunded_amount = $5,
			paid_at = $6,
			updated_at = now()
		where payment_reference = $1
	`
	if _, err := r.DB.Exec(query, reference, status, strings.TrimSpace(providerReference), strings.TrimSpace(failureReason), refundedAmount, paidAt); err != nil {
		return Payment{}, err
	}
	if err := r.refreshBookingPaymentStatus(payment.BookingID); err != nil {
		return Payment{}, err
	}
	return r.GetPaymentByReference(reference)
}

func (r Repository) refreshBookingPaymentStatus(bookingID int64) error {
	const query = `
		select
			b.amount,
			coalesce(sum(case when p.status in ('paid', 'partially_refunded', 'refunded') then p.amount - p.refunded_amount else 0 end), 0),
			count(p.id),
			coalesce(bool_or(p.status = 'pending'), false),
			coalesce(bool_or(p.status = 'failed'), false),
			coalesce(bool_or(p.status = 'cancelled'), false),
			coalesce(bool_or(p.status in ('refunded', 'partially_refunded')), false)
		from bookings b
		left join payments p on p.booking_id = b.id
		where b.id = $1
		group by b.amount
	`
	var (
		expected     float64
		paidAmount   float64
		paymentCount int
		hasPending   bool
		hasFailed    bool
		hasCancelled bool
		hasRefunded  bool
	)
	if err := r.DB.QueryRow(query, bookingID).Scan(&expected, &paidAmount, &paymentCount, &hasPending, &hasFailed, &hasCancelled, &hasRefunded); err != nil {
		return err
	}

	status := "unpaid"
	switch {
	case paymentCount == 0:
		status = "unpaid"
	case hasRefunded && paidAmount <= 0:
		status = "refunded"
	case paidAmount <= 0 && hasPending:
		status = "pending"
	case paidAmount <= 0 && hasFailed:
		status = "failed"
	case paidAmount <= 0 && hasCancelled:
		status = "cancelled"
	case expected > 0 && paidAmount < expected:
		if hasRefunded {
			status = "partially_refunded"
		} else if hasPending {
			status = "pending"
		} else {
			status = "partially_paid"
		}
	case hasRefunded && expected > 0 && paidAmount < expected:
		status = "partially_refunded"
	default:
		status = "paid"
	}

	_, err := r.DB.Exec(`update bookings set payment_status = $2, updated_at = now() where id = $1`, bookingID, status)
	return err
}

func (r Repository) ListReconciliationItems(search string, matchedOnly string) ([]ReconciliationItem, error) {
	query := `
		select
			b.booking_reference,
			u.full_name,
			t.title,
			b.amount,
			b.currency,
			coalesce(sum(case when p.status in ('paid', 'partially_refunded', 'refunded') then p.amount - p.refunded_amount else 0 end), 0) as paid_amount,
			count(p.id),
			b.booking_status,
			b.payment_status,
			b.review_flag,
			b.review_note,
			b.created_at
		from bookings b
		join users u on u.id = b.user_id
		join tours t on t.id = b.tour_id
		left join payments p on p.booking_id = b.id
		where 1 = 1
	`
	args := []any{}
	if search != "" {
		args = append(args, "%"+strings.ToLower(strings.TrimSpace(search))+"%")
		query += ` and (lower(b.booking_reference) like $` + itoa(len(args)) + ` or lower(u.full_name) like $` + itoa(len(args)) + ` or lower(t.title) like $` + itoa(len(args)) + `)`
	}
	query += ` group by b.id, u.full_name, t.title`
	query += ` order by b.created_at desc`

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []ReconciliationItem{}
	for rows.Next() {
		var item ReconciliationItem
		if err := rows.Scan(
			&item.BookingReference,
			&item.UserName,
			&item.TourTitle,
			&item.ExpectedAmount,
			&item.Currency,
			&item.PaidAmount,
			&item.PaymentCount,
			&item.BookingStatus,
			&item.PaymentStatus,
			&item.ReviewFlag,
			&item.ReviewNote,
			&item.CreatedAt,
		); err != nil {
			return nil, err
		}
		item.Outstanding = math.Max(item.ExpectedAmount-item.PaidAmount, 0)
		item.State = reconcileState(item.ExpectedAmount, item.PaidAmount, item.PaymentStatus)
		if matchedOnly == "matched" && item.State != "matched" {
			continue
		}
		if matchedOnly == "unmatched" && item.State == "matched" {
			continue
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func reconcileState(expected, paid float64, paymentStatus string) string {
	switch {
	case paymentStatus == "paid" && math.Abs(expected-paid) < 0.01:
		return "matched"
	case paymentStatus == "pending":
		return "pending"
	case paymentStatus == "failed":
		return "failed"
	case paymentStatus == "cancelled":
		return "cancelled"
	case paymentStatus == "refunded":
		return "refunded"
	case paymentStatus == "partially_refunded":
		return "underpaid"
	case paid == 0:
		return "unpaid"
	case paid > expected:
		return "overpaid"
	case paid < expected:
		return "underpaid"
	default:
		return "matched"
	}
}
