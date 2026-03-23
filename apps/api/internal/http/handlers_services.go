package httpapi

import (
	"errors"
	"net/http"
	"strings"

	"erkhet-api/internal/store"
)

type serviceBookingInput struct {
	ServiceType  string         `json:"serviceType"`
	Destination  string         `json:"destination"`
	TravelDate   string         `json:"travelDate"`
	EndDate      string         `json:"endDate"`
	Quantity     int            `json:"quantity"`
	ContactName  string         `json:"contactName"`
	ContactEmail string         `json:"contactEmail"`
	ContactPhone string         `json:"contactPhone"`
	Details      map[string]any `json:"details"`
}

type adminServiceBookingInput struct {
	Status    string `json:"status"`
	AdminNote string `json:"adminNote"`
}

func (s Server) listMyServiceBookings(w http.ResponseWriter, _ *http.Request, session sessionUser) {
	items, err := s.Repo.ListServiceBookingsByUser(session.User.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load service bookings")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s Server) createServiceBooking(w http.ResponseWriter, r *http.Request, session sessionUser) {
	var input serviceBookingInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if !oneOf(input.ServiceType, "hotel", "restaurant", "flight", "taxi", "esim", "insurance") {
		writeError(w, http.StatusBadRequest, "invalid service type")
		return
	}
	if strings.TrimSpace(input.Destination) == "" || strings.TrimSpace(input.TravelDate) == "" {
		writeError(w, http.StatusBadRequest, "destination and travel date are required")
		return
	}
	created, err := s.Repo.CreateServiceBooking(
		session.User.ID,
		input.ServiceType,
		input.Destination,
		input.TravelDate,
		input.EndDate,
		input.Quantity,
		input.ContactName,
		input.ContactEmail,
		input.ContactPhone,
		input.Details,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create service booking")
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (s Server) adminServiceBookings(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	items, err := s.Repo.ListServiceBookings(store.ServiceBookingFilter{
		Search:      r.URL.Query().Get("search"),
		Status:      r.URL.Query().Get("status"),
		ServiceType: r.URL.Query().Get("serviceType"),
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load service bookings")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (s Server) adminServiceBookingDetail(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	item, err := s.Repo.GetServiceBookingByReference(r.PathValue("reference"))
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "service booking not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load service booking")
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (s Server) updateAdminServiceBooking(w http.ResponseWriter, r *http.Request, _ sessionUser) {
	var input adminServiceBookingInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if !oneOf(input.Status, "new", "in_review", "quoted", "confirmed", "cancelled", "completed") {
		writeError(w, http.StatusBadRequest, "invalid service booking status")
		return
	}
	updated, err := s.Repo.UpdateServiceBookingAdmin(r.PathValue("reference"), input.Status, input.AdminNote)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusNotFound, "service booking not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to update service booking")
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

