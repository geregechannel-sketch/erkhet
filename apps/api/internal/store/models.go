package store

import "time"

type User struct {
	ID                int64     `json:"id"`
	FullName          string    `json:"fullName"`
	Email             string    `json:"email"`
	Phone             string    `json:"phone"`
	Role              string    `json:"role"`
	Status            string    `json:"status"`
	PreferredLanguage string    `json:"preferredLanguage"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	PasswordHash      string    `json:"-"`
}

func (u User) IsAdmin() bool {
	switch u.Role {
	case "super_admin", "booking_manager", "finance", "support":
		return true
	default:
		return false
	}
}

type TravelerDetail struct {
	FullName string `json:"fullName"`
	Age      int    `json:"age,omitempty"`
	Gender   string `json:"gender,omitempty"`
	Hobby    string `json:"hobby,omitempty"`
	Diet     string `json:"diet,omitempty"`
	Allergy  string `json:"allergy,omitempty"`
}

type Tour struct {
	ID                int64     `json:"id"`
	Slug              string    `json:"slug"`
	Title             string    `json:"title"`
	Summary           string    `json:"summary"`
	Description       string    `json:"description"`
	BusinessLine      string    `json:"businessLine"`
	OperationType     string    `json:"operationType"`
	TourKind          string    `json:"tourKind"`
	DurationDays      int       `json:"durationDays"`
	DurationNights    int       `json:"durationNights"`
	PriceAmount       *float64  `json:"priceAmount,omitempty"`
	Currency          string    `json:"currency,omitempty"`
	PricingNote       string    `json:"pricingNote,omitempty"`
	Route             string    `json:"route"`
	CoverImage        string    `json:"coverImage"`
	Status            string    `json:"status"`
	Featured          bool      `json:"featured"`
	Capacity          int       `json:"capacity"`
	AvailabilityCount int       `json:"availabilityCount"`
	DepartureDates    []string  `json:"departureDates"`
	Itinerary         []string  `json:"itinerary"`
	Inclusions        []string  `json:"inclusions"`
	Exclusions        []string  `json:"exclusions"`
	SortOrder         int       `json:"sortOrder"`
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
	Saved             bool      `json:"saved,omitempty"`
}

type Booking struct {
	ID                     int64            `json:"id"`
	BookingReference       string           `json:"bookingReference"`
	UserID                 int64            `json:"userId"`
	UserName               string           `json:"userName,omitempty"`
	UserEmail              string           `json:"userEmail,omitempty"`
	TourID                 int64            `json:"tourId"`
	TourSlug               string           `json:"tourSlug"`
	TourTitle              string           `json:"tourTitle"`
	TravelerName           string           `json:"travelerName"`
	Email                  string           `json:"email"`
	Phone                  string           `json:"phone"`
	PreferredDepartureDate string           `json:"preferredDepartureDate"`
	ParticipantCount       int              `json:"participantCount"`
	Note                   string           `json:"note"`
	TravelerDetails        []TravelerDetail `json:"travelerDetails,omitempty"`
	Amount                 float64          `json:"amount"`
	Currency               string           `json:"currency"`
	BookingStatus          string           `json:"bookingStatus"`
	PaymentStatus          string           `json:"paymentStatus"`
	AdminNote              string           `json:"adminNote,omitempty"`
	ReviewFlag             bool             `json:"reviewFlag"`
	ReviewNote             string           `json:"reviewNote,omitempty"`
	CreatedAt              time.Time        `json:"createdAt"`
	UpdatedAt              time.Time        `json:"updatedAt"`
}

type Payment struct {
	ID                int64      `json:"id"`
	PaymentReference  string     `json:"paymentReference"`
	BookingID         int64      `json:"bookingId"`
	BookingReference  string     `json:"bookingReference,omitempty"`
	UserID            int64      `json:"userId"`
	UserName          string     `json:"userName,omitempty"`
	TourTitle         string     `json:"tourTitle,omitempty"`
	Provider          string     `json:"provider"`
	Method            string     `json:"method"`
	ProviderReference string     `json:"providerReference,omitempty"`
	Amount            float64    `json:"amount"`
	Currency          string     `json:"currency"`
	Status            string     `json:"status"`
	FailureReason     string     `json:"failureReason,omitempty"`
	RefundedAmount    float64    `json:"refundedAmount"`
	PaidAt            *time.Time `json:"paidAt,omitempty"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

type SupportRequest struct {
	ID               int64          `json:"id"`
	SupportReference string         `json:"supportReference"`
	UserID           *int64         `json:"userId,omitempty"`
	UserName         string         `json:"userName,omitempty"`
	BookingReference string         `json:"bookingReference,omitempty"`
	TourSlug         string         `json:"tourSlug,omitempty"`
	TourTitle        string         `json:"tourTitle,omitempty"`
	Type             string         `json:"type"`
	Subject          string         `json:"subject"`
	Message          string         `json:"message"`
	CustomerName     string         `json:"customerName"`
	CustomerEmail    string         `json:"customerEmail"`
	CustomerPhone    string         `json:"customerPhone"`
	Status           string         `json:"status"`
	AdminNote        string         `json:"adminNote,omitempty"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	Events           []SupportEvent `json:"events,omitempty"`
}

type SupportEvent struct {
	ID         int64     `json:"id"`
	EventType  string    `json:"eventType"`
	Message    string    `json:"message"`
	ActorLabel string    `json:"actorLabel"`
	CreatedAt  time.Time `json:"createdAt"`
}

type UserDetail struct {
	User      User             `json:"user"`
	Favorites []Tour           `json:"favorites"`
	Bookings  []Booking        `json:"bookings"`
	Payments  []Payment        `json:"payments"`
	Support   []SupportRequest `json:"support"`
}

type DashboardSummary struct {
	SavedTours      int `json:"savedTours"`
	PendingBookings int `json:"pendingBookings"`
	ActivePayments  int `json:"activePayments"`
	OpenSupport     int `json:"openSupport"`
}

type AdminSummary struct {
	TotalUsers          int `json:"totalUsers"`
	PublishedTours      int `json:"publishedTours"`
	PendingBookings     int `json:"pendingBookings"`
	PendingPayments     int `json:"pendingPayments"`
	Unreconciled        int `json:"unreconciled"`
	OpenSupportRequests int `json:"openSupportRequests"`
}

type ReconciliationItem struct {
	BookingReference string    `json:"bookingReference"`
	UserName         string    `json:"userName"`
	TourTitle        string    `json:"tourTitle"`
	ExpectedAmount   float64   `json:"expectedAmount"`
	Currency         string    `json:"currency"`
	PaidAmount       float64   `json:"paidAmount"`
	Outstanding      float64   `json:"outstanding"`
	PaymentCount     int       `json:"paymentCount"`
	BookingStatus    string    `json:"bookingStatus"`
	PaymentStatus    string    `json:"paymentStatus"`
	State            string    `json:"state"`
	ReviewFlag       bool      `json:"reviewFlag"`
	ReviewNote       string    `json:"reviewNote,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
}

type TourFilter struct {
	Search        string
	BusinessLine  string
	OperationType string
	TourKind      string
	Status        string
}

type BookingFilter struct {
	Search string
	Status string
	Tour   string
	User   string
}

type PaymentFilter struct {
	Search string
	Status string
	Method string
}

type SupportFilter struct {
	Search string
	Status string
	Type   string
}