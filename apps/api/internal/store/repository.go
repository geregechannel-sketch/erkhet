package store

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/lib/pq"
)

var (
	ErrNotFound = errors.New("not found")
	ErrConflict = errors.New("conflict")
)

type Repository struct {
	DB *sql.DB
}

type scanner interface {
	Scan(dest ...any) error
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func nullableString(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

func nullableFloat(value sql.NullFloat64) *float64 {
	if value.Valid {
		copy := value.Float64
		return &copy
	}
	return nil
}

func nullableTime(value sql.NullTime) *time.Time {
	if value.Valid {
		copy := value.Time
		return &copy
	}
	return nil
}

func nullableInt64Ptr(value sql.NullInt64) *int64 {
	if value.Valid {
		copy := value.Int64
		return &copy
	}
	return nil
}

func itoa(value int) string {
	return strconv.Itoa(value)
}

func newReference(prefix string) (string, error) {
	buffer := make([]byte, 6)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return prefix + "-" + strings.ToUpper(hex.EncodeToString(buffer)), nil
}

func scanTour(row scanner) (Tour, error) {
	var (
		tour       Tour
		price      sql.NullFloat64
		currency   sql.NullString
		departure  []string
		itinerary  []string
		inclusions []string
		exclusions []string
	)

	err := row.Scan(
		&tour.ID,
		&tour.Slug,
		&tour.Title,
		&tour.Summary,
		&tour.Description,
		&tour.BusinessLine,
		&tour.OperationType,
		&tour.TourKind,
		&tour.DurationDays,
		&tour.DurationNights,
		&price,
		&currency,
		&tour.PricingNote,
		&tour.Route,
		&tour.CoverImage,
		&tour.Status,
		&tour.Featured,
		&tour.Capacity,
		&tour.AvailabilityCount,
		pq.Array(&departure),
		pq.Array(&itinerary),
		pq.Array(&inclusions),
		pq.Array(&exclusions),
		&tour.SortOrder,
		&tour.CreatedAt,
		&tour.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Tour{}, ErrNotFound
		}
		return Tour{}, err
	}

	tour.PriceAmount = nullableFloat(price)
	tour.Currency = nullableString(currency)
	tour.DepartureDates = departure
	tour.Itinerary = itinerary
	tour.Inclusions = inclusions
	tour.Exclusions = exclusions
	return tour, nil
}

func scanBooking(row scanner) (Booking, error) {
	var (
		booking            Booking
		travelerDetailsRaw []byte
	)
	err := row.Scan(
		&booking.ID,
		&booking.BookingReference,
		&booking.UserID,
		&booking.UserName,
		&booking.UserEmail,
		&booking.TourID,
		&booking.TourSlug,
		&booking.TourTitle,
		&booking.TravelerName,
		&booking.Email,
		&booking.Phone,
		&booking.PreferredDepartureDate,
		&booking.ParticipantCount,
		&booking.Note,
		&travelerDetailsRaw,
		&booking.Amount,
		&booking.Currency,
		&booking.BookingStatus,
		&booking.PaymentStatus,
		&booking.AdminNote,
		&booking.ReviewFlag,
		&booking.ReviewNote,
		&booking.CreatedAt,
		&booking.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Booking{}, ErrNotFound
		}
		return Booking{}, err
	}
	if len(travelerDetailsRaw) > 0 {
		_ = json.Unmarshal(travelerDetailsRaw, &booking.TravelerDetails)
	}
	if booking.TravelerDetails == nil {
		booking.TravelerDetails = []TravelerDetail{}
	}
	return booking, nil
}

func scanPayment(row scanner) (Payment, error) {
	var (
		payment Payment
		paidAt  sql.NullTime
	)
	err := row.Scan(
		&payment.ID,
		&payment.PaymentReference,
		&payment.BookingID,
		&payment.BookingReference,
		&payment.UserID,
		&payment.UserName,
		&payment.TourTitle,
		&payment.Provider,
		&payment.Method,
		&payment.ProviderReference,
		&payment.Amount,
		&payment.Currency,
		&payment.Status,
		&payment.FailureReason,
		&payment.RefundedAmount,
		&paidAt,
		&payment.CreatedAt,
		&payment.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Payment{}, ErrNotFound
		}
		return Payment{}, err
	}
	payment.PaidAt = nullableTime(paidAt)
	return payment, nil
}

func scanSupportRequest(row scanner) (SupportRequest, error) {
	var (
		request    SupportRequest
		userID     sql.NullInt64
		userName   sql.NullString
		bookingRef sql.NullString
		tourSlug   sql.NullString
		tourTitle  sql.NullString
	)
	if err := row.Scan(
		&request.ID,
		&request.SupportReference,
		&userID,
		&userName,
		&bookingRef,
		&tourSlug,
		&tourTitle,
		&request.Type,
		&request.Subject,
		&request.Message,
		&request.CustomerName,
		&request.CustomerEmail,
		&request.CustomerPhone,
		&request.Status,
		&request.AdminNote,
		&request.CreatedAt,
		&request.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return SupportRequest{}, ErrNotFound
		}
		return SupportRequest{}, err
	}
	request.UserID = nullableInt64Ptr(userID)
	request.UserName = nullableString(userName)
	request.BookingReference = nullableString(bookingRef)
	request.TourSlug = nullableString(tourSlug)
	request.TourTitle = nullableString(tourTitle)
	return request, nil
}