package httpapi

import (
	"errors"
	"net/http"
	"strings"

	"erkhet-api/internal/store"
)

type adminTourInput struct {
	Slug              string   `json:"slug"`
	Title             string   `json:"title"`
	Summary           string   `json:"summary"`
	Description       string   `json:"description"`
	BusinessLine      string   `json:"businessLine"`
	OperationType     string   `json:"operationType"`
	TourKind          string   `json:"tourKind"`
	DurationDays      int      `json:"durationDays"`
	DurationNights    int      `json:"durationNights"`
	PriceAmount       *float64 `json:"priceAmount"`
	Currency          string   `json:"currency"`
	PricingNote       string   `json:"pricingNote"`
	Route             string   `json:"route"`
	CoverImage        string   `json:"coverImage"`
	Status            string   `json:"status"`
	Featured          bool     `json:"featured"`
	Capacity          int      `json:"capacity"`
	AvailabilityCount int      `json:"availabilityCount"`
	DepartureDates    []string `json:"departureDates"`
	Itinerary         []string `json:"itinerary"`
	Inclusions        []string `json:"inclusions"`
	Exclusions        []string `json:"exclusions"`
	SortOrder         int      `json:"sortOrder"`
}

type adminUserInput struct {
	Role   string `json:"role"`
	Status string `json:"status"`
}

type adminBookingInput struct {
	BookingStatus string `json:"bookingStatus"`
	AdminNote     string `json:"adminNote"`
}

type adminPaymentInput struct {
	Status            string  `json:"status"`
	ProviderReference string  `json:"providerReference"`
	FailureReason     string  `json:"failureReason"`
	RefundedAmount    float64 `json:"refundedAmount"`
}

type adminReconciliationInput struct {
	ReviewFlag bool   `json:"reviewFlag"`
	ReviewNote string `json:"reviewNote"`
}

type adminSupportInput struct {
	Status    string `json:"status"`
	AdminNote string `json:"adminNote"`
}

func (s Server) adminSummary(w http.ResponseWriter, _ *http.Request, _ sessionUser) {
	summary, err := s.Repo.GetAdminSummary()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load admin summary")
		return
	}
	writeJSON(w, http.StatusOK, summary)
}

func (s Server) adminTours(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	filter := store.TourFilter{
		Search:        r.URL.Query().Get("search"),
		BusinessLine:  r.URL.Query().Get("businessLine"),
		OperationType: r.URL.Query().Get("operationType"),
		TourKind:      r.URL.Query().Get("tourKind"),
		Status:        r.URL.Query().Get("status"),
	}
	tours, err := s.Repo.ListTours(filter, true)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load tours")
		return
	}
	writeJSON(w, http.StatusOK, tours)
}

func tourFromInput(input adminTourInput) store.Tour {
	slug := strings.TrimSpace(input.Slug)
	if slug == "" {
		slug = slugify(input.Title)
	}
	if input.DurationDays < 1 {
		input.DurationDays = 1
	}
	if input.Capacity < 1 {
		input.Capacity = 1
	}
	if input.AvailabilityCount < 0 {
		input.AvailabilityCount = 0
	}
	if input.AvailabilityCount == 0 {
		input.AvailabilityCount = input.Capacity
	}
	return store.Tour{
		Slug:              slug,
		Title:             strings.TrimSpace(input.Title),
		Summary:           strings.TrimSpace(input.Summary),
		Description:       strings.TrimSpace(input.Description),
		BusinessLine:      input.BusinessLine,
		OperationType:     input.OperationType,
		TourKind:          input.TourKind,
		DurationDays:      input.DurationDays,
		DurationNights:    input.DurationNights,
		PriceAmount:       input.PriceAmount,
		Currency:          strings.TrimSpace(input.Currency),
		PricingNote:       strings.TrimSpace(input.PricingNote),
		Route:             strings.TrimSpace(input.Route),
		CoverImage:        strings.TrimSpace(input.CoverImage),
		Status:            input.Status,
		Featured:          input.Featured,
		Capacity:          input.Capacity,
		AvailabilityCount: input.AvailabilityCount,
		DepartureDates:    input.DepartureDates,
		Itinerary:         input.Itinerary,
		Inclusions:        input.Inclusions,
		Exclusions:        input.Exclusions,
		SortOrder:         input.SortOrder,
	}
}

func validateTourInput(input adminTourInput) string {
	if strings.TrimSpace(input.Title) == "" || strings.TrimSpace(input.Summary) == "" || strings.TrimSpace(input.Description) == "" {
		return "title, summary, and description are required"
	}
	if !oneOf(input.BusinessLine, "inbound", "outbound", "domestic") {
		return "invalid business line"
	}
	if !oneOf(input.OperationType, "scheduled", "custom") {
		return "invalid operation type"
	}
	if !oneOf(input.TourKind, "multi_day", "day_tour") {
		return "invalid tour kind"
	}
	if !oneOf(input.Status, "draft", "published", "archived") {
		return "invalid status"
	}
	return ""
}

func (s Server) createAdminTour(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	var input adminTourInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if msg := validateTourInput(input); msg != "" {
		writeError(w, http.StatusBadRequest, msg)
		return
	}
	created, err := s.Repo.CreateTour(tourFromInput(input))
	if err != nil {
		if errors.Is(err, store.ErrConflict) {
			writeError(w, http.StatusConflict, "tour slug already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to create tour")
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (s Server) adminTourDetail(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	id, err := parsePathInt64(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid tour id")
		return
	}
	tour, err := s.Repo.GetTourByID(id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "tour not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load tour")
		return
	}
	writeJSON(w, http.StatusOK, tour)
}

func (s Server) updateAdminTour(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	id, err := parsePathInt64(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid tour id")
		return
	}
	var input adminTourInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if msg := validateTourInput(input); msg != "" {
		writeError(w, http.StatusBadRequest, msg)
		return
	}
	updated, err := s.Repo.UpdateTour(id, tourFromInput(input))
	if err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			writeError(w, http.StatusNotFound, "tour not found")
		case errors.Is(err, store.ErrConflict):
			writeError(w, http.StatusConflict, "tour slug already exists")
		default:
			writeError(w, http.StatusInternalServerError, "failed to update tour")
		}
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (s Server) deleteAdminTour(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	id, err := parsePathInt64(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid tour id")
		return
	}
	if err := s.Repo.DeleteTour(id); err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			writeError(w, http.StatusNotFound, "tour not found")
		case errors.Is(err, store.ErrConflict):
			writeError(w, http.StatusConflict, "tour cannot be deleted because it already has bookings")
		default:
			writeError(w, http.StatusInternalServerError, "failed to delete tour")
		}
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s Server) adminUsers(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	users, err := s.Repo.ListUsers(r.URL.Query().Get("search"), r.URL.Query().Get("role"), r.URL.Query().Get("status"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load users")
		return
	}
	writeJSON(w, http.StatusOK, users)
}

func (s Server) adminUserDetail(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	id, err := parsePathInt64(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}
	detail, err := s.Repo.GetUserDetail(id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load user")
		return
	}
	writeJSON(w, http.StatusOK, detail)
}

func (s Server) updateAdminUser(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	id, err := parsePathInt64(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid user id")
		return
	}
	var input adminUserInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if !oneOf(input.Role, "customer", "super_admin", "booking_manager", "finance", "support") || !oneOf(input.Status, "active", "inactive", "blocked") {
		writeError(w, http.StatusBadRequest, "invalid role or status")
		return
	}
	updated, err := s.Repo.UpdateUserAdmin(id, input.Role, input.Status)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "user not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update user")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (s Server) adminBookings(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	bookings, err := s.Repo.ListBookings(store.BookingFilter{
		Search: r.URL.Query().Get("search"),
		Status: r.URL.Query().Get("status"),
		Tour:   r.URL.Query().Get("tour"),
		User:   r.URL.Query().Get("user"),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load bookings")
		return
	}
	writeJSON(w, http.StatusOK, bookings)
}

func (s Server) adminBookingDetail(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	booking, err := s.Repo.GetBookingByReference(r.PathValue("reference"))
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "booking not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load booking")
		return
	}
	writeJSON(w, http.StatusOK, booking)
}

func (s Server) updateAdminBooking(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	var input adminBookingInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if !oneOf(input.BookingStatus, "pending", "confirmed", "cancelled", "completed") {
		writeError(w, http.StatusBadRequest, "invalid booking status")
		return
	}
	updated, err := s.Repo.UpdateBookingAdmin(r.PathValue("reference"), input.BookingStatus, input.AdminNote)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "booking not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update booking")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (s Server) adminPayments(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	payments, err := s.Repo.ListPayments(store.PaymentFilter{
		Search: r.URL.Query().Get("search"),
		Status: r.URL.Query().Get("status"),
		Method: r.URL.Query().Get("method"),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load payments")
		return
	}
	writeJSON(w, http.StatusOK, payments)
}

func (s Server) adminPaymentDetail(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	payment, err := s.Repo.GetPaymentByReference(r.PathValue("reference"))
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "payment not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load payment")
		return
	}
	writeJSON(w, http.StatusOK, payment)
}

func (s Server) updateAdminPayment(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	var input adminPaymentInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if !oneOf(input.Status, "pending", "paid", "failed", "cancelled", "refunded", "partially_refunded") {
		writeError(w, http.StatusBadRequest, "invalid payment status")
		return
	}
	updated, err := s.Repo.UpdatePaymentAdmin(r.PathValue("reference"), input.Status, input.ProviderReference, input.FailureReason, input.RefundedAmount)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "payment not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update payment")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (s Server) adminReconciliation(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	items, err := s.Repo.ListReconciliationItems(r.URL.Query().Get("search"), r.URL.Query().Get("matched"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load reconciliation items")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s Server) updateReconciliation(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	var input adminReconciliationInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	updated, err := s.Repo.UpdateBookingReview(r.PathValue("reference"), input.ReviewFlag, input.ReviewNote)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "booking not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update reconciliation state")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (s Server) adminSupportRequests(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	requests, err := s.Repo.ListSupportRequests(store.SupportFilter{
		Search: r.URL.Query().Get("search"),
		Status: r.URL.Query().Get("status"),
		Type:   r.URL.Query().Get("type"),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load support requests")
		return
	}
	writeJSON(w, http.StatusOK, requests)
}

func (s Server) adminSupportDetail(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	request, err := s.Repo.GetSupportRequestByReference(r.PathValue("reference"), true)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "support request not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load support request")
		return
	}
	writeJSON(w, http.StatusOK, request)
}

func (s Server) updateAdminSupport(w http.ResponseWriter, r *http.Request, session sessionUser) {
	var input adminSupportInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if !oneOf(input.Status, "new", "in_review", "resolved", "closed") {
		writeError(w, http.StatusBadRequest, "invalid support status")
		return
	}
	updated, err := s.Repo.UpdateSupportRequestAdmin(r.PathValue("reference"), input.Status, input.AdminNote, session.User.FullName)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "support request not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update support request")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}
