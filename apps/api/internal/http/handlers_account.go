package httpapi

import (
	"errors"
	"net/http"
	"strings"

	"erkhet-api/internal/store"
)

type profileInput struct {
	FullName          string `json:"fullName"`
	Phone             string `json:"phone"`
	PreferredLanguage string `json:"preferredLanguage"`
}

type bookingInput struct {
	TourSlug               string                 `json:"tourSlug"`
	TravelerName           string                 `json:"travelerName"`
	Email                  string                 `json:"email"`
	Phone                  string                 `json:"phone"`
	PreferredDepartureDate string                 `json:"preferredDepartureDate"`
	ParticipantCount       int                    `json:"participantCount"`
	TravelerDetails        []store.TravelerDetail `json:"travelerDetails"`
	Note                   string                 `json:"note"`
}

type paymentInput struct {
	BookingReference string `json:"bookingReference"`
	Method           string `json:"method"`
}

type paymentSimulationInput struct {
	Outcome string `json:"outcome"`
}

func (s Server) dashboard(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	summary, err := s.Repo.GetDashboardSummary(session.User.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load dashboard")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"user": session.User, "summary": summary})
}

func (s Server) profile(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	writeJSON(w, http.StatusOK, session.User)
}

func (s Server) updateProfile(w http.ResponseWriter, r *http.Request, session sessionUser) {
	var input profileInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if strings.TrimSpace(input.FullName) == "" {
		writeError(w, http.StatusBadRequest, "full name is required")
		return
	}
	if input.PreferredLanguage == "" {
		input.PreferredLanguage = "mn"
	}
	updated, err := s.Repo.UpdateUserProfile(session.User.ID, input.FullName, input.Phone, input.PreferredLanguage)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (s Server) listFavorites(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	favorites, err := s.Repo.ListFavoriteTours(session.User.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load saved tours")
		return
	}
	writeJSON(w, http.StatusOK, favorites)
}

func (s Server) saveFavorite(w http.ResponseWriter, r *http.Request, session sessionUser) {
	if err := s.Repo.SaveFavorite(session.User.ID, r.PathValue("slug")); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "tour not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to save tour")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s Server) removeFavorite(w http.ResponseWriter, r *http.Request, session sessionUser) {
	if err := s.Repo.RemoveFavorite(session.User.ID, r.PathValue("slug")); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to remove saved tour")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s Server) listMyBookings(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	bookings, err := s.Repo.ListBookingsByUser(session.User.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load bookings")
		return
	}
	writeJSON(w, http.StatusOK, bookings)
}

func (s Server) myBookingDetail(w http.ResponseWriter, r *http.Request, session sessionUser) {
	booking, err := s.Repo.GetBookingByReference(r.PathValue("reference"))
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "booking not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load booking")
		return
	}
	if booking.UserID != session.User.ID {
		writeError(w, http.StatusForbidden, "forbidden")
		return
	}
	writeJSON(w, http.StatusOK, booking)
}

func (s Server) createBooking(w http.ResponseWriter, r *http.Request, session sessionUser) {
	var input bookingInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if strings.TrimSpace(input.TourSlug) == "" {
		writeError(w, http.StatusBadRequest, "tour is required")
		return
	}
	if strings.TrimSpace(input.TravelerName) == "" {
		input.TravelerName = session.User.FullName
	}
	if strings.TrimSpace(input.Email) == "" {
		input.Email = session.User.Email
	}
	if strings.TrimSpace(input.Phone) == "" {
		input.Phone = session.User.Phone
	}
	if strings.TrimSpace(input.TravelerName) == "" || strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.Phone) == "" {
		writeError(w, http.StatusBadRequest, "traveler name, email, and phone are required")
		return
	}
	created, err := s.Repo.CreateBooking(
		session.User.ID,
		input.TourSlug,
		input.TravelerName,
		input.Email,
		input.Phone,
		input.PreferredDepartureDate,
		input.ParticipantCount,
		input.TravelerDetails,
		input.Note,
	)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "tour not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to create booking")
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (s Server) listMyPayments(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	payments, err := s.Repo.ListPaymentsByUser(session.User.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load payments")
		return
	}
	writeJSON(w, http.StatusOK, payments)
}

func (s Server) createPayment(w http.ResponseWriter, r *http.Request, session sessionUser) {
	var input paymentInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if strings.TrimSpace(input.BookingReference) == "" || strings.TrimSpace(input.Method) == "" {
		writeError(w, http.StatusBadRequest, "booking and payment method are required")
		return
	}
	payment, err := s.Repo.CreatePayment(input.BookingReference, session.User.ID, "manual_demo", input.Method)
	if err != nil {
		switch {
		case errors.Is(err, store.ErrNotFound):
			writeError(w, http.StatusNotFound, "booking not found")
		case errors.Is(err, store.ErrConflict):
			writeError(w, http.StatusConflict, "payment is not available for this booking yet")
		default:
			writeError(w, http.StatusInternalServerError, "failed to create payment")
		}
		return
	}
	intent := s.Gateway.CreateIntent(input.BookingReference, payment.PaymentReference, input.Method)
	writeJSON(w, http.StatusCreated, map[string]any{"payment": payment, "intent": intent})
}

func (s Server) simulatePayment(w http.ResponseWriter, r *http.Request, session sessionUser) {
	var input paymentSimulationInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if !oneOf(input.Outcome, "success", "failed", "cancelled") {
		writeError(w, http.StatusBadRequest, "unsupported payment outcome")
		return
	}
	payment, err := s.Repo.SimulatePayment(r.PathValue("reference"), session.User.ID, input.Outcome)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "payment not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update payment")
		return
	}
	writeJSON(w, http.StatusOK, payment)
}

func (s Server) listMySupportRequests(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	requests, err := s.Repo.ListSupportRequestsByUser(session.User.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load support history")
		return
	}
	writeJSON(w, http.StatusOK, requests)
}