package httpapi

import (
	"encoding/json"
	"net/http"
	"time"

	"erkhet-api/internal/payments"
	"erkhet-api/internal/store"
)

type Server struct {
	Repo                 store.Repository
	Gateway              payments.Gateway
	SessionTTL           time.Duration
	PublicBaseURL        string
	PasswordResetTTL     time.Duration
	PasswordResetPreview bool
}

func (s Server) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/health", s.health)
	mux.HandleFunc("GET /api/company", s.company)
	mux.HandleFunc("GET /api/destinations", s.destinations)
	mux.HandleFunc("GET /api/tours", s.listTours)
	mux.HandleFunc("GET /api/tours/{slug}", s.getTour)

	mux.HandleFunc("POST /api/auth/register", s.register)
	mux.HandleFunc("POST /api/auth/login", s.login)
	mux.HandleFunc("POST /api/auth/forgot-password", s.forgotPassword)
	mux.HandleFunc("POST /api/auth/reset-password", s.resetPassword)
	mux.HandleFunc("POST /api/auth/change-password", s.requireAuth(s.changePassword))
	mux.HandleFunc("GET /api/auth/me", s.requireAuth(s.me))
	mux.HandleFunc("POST /api/auth/logout", s.requireAuth(s.logout))

	mux.HandleFunc("GET /api/me/dashboard", s.requireAuth(s.dashboard))
	mux.HandleFunc("GET /api/me/profile", s.requireAuth(s.profile))
	mux.HandleFunc("PUT /api/me/profile", s.requireAuth(s.updateProfile))
	mux.HandleFunc("GET /api/me/favorites", s.requireAuth(s.listFavorites))
	mux.HandleFunc("POST /api/me/favorites/{slug}", s.requireAuth(s.saveFavorite))
	mux.HandleFunc("DELETE /api/me/favorites/{slug}", s.requireAuth(s.removeFavorite))
	mux.HandleFunc("GET /api/me/bookings", s.requireAuth(s.listMyBookings))
	mux.HandleFunc("GET /api/me/bookings/{reference}", s.requireAuth(s.myBookingDetail))
	mux.HandleFunc("POST /api/bookings", s.requireAuth(s.createBooking))
	mux.HandleFunc("GET /api/me/payments", s.requireAuth(s.listMyPayments))
	mux.HandleFunc("POST /api/payments", s.requireAuth(s.createPayment))
	mux.HandleFunc("POST /api/payments/{reference}/simulate", s.requireAuth(s.simulatePayment))
	mux.HandleFunc("GET /api/me/support-requests", s.requireAuth(s.listMySupportRequests))
	mux.HandleFunc("GET /api/me/service-bookings", s.requireAuth(s.listMyServiceBookings))
	mux.HandleFunc("POST /api/service-bookings", s.requireAuth(s.createServiceBooking))

	mux.HandleFunc("POST /api/support-requests", s.createSupportRequest)
	mux.HandleFunc("POST /api/inquiries", s.createInquiryAlias)

	mux.HandleFunc("GET /api/admin/summary", s.requireAdmin(s.adminSummary))
	mux.HandleFunc("GET /api/admin/tours", s.requireAdmin(s.adminTours))
	mux.HandleFunc("POST /api/admin/tours", s.requireAdmin(s.createAdminTour))
	mux.HandleFunc("GET /api/admin/tours/{id}", s.requireAdmin(s.adminTourDetail))
	mux.HandleFunc("PUT /api/admin/tours/{id}", s.requireAdmin(s.updateAdminTour))
	mux.HandleFunc("DELETE /api/admin/tours/{id}", s.requireAdmin(s.deleteAdminTour))
	mux.HandleFunc("GET /api/admin/users", s.requireAdmin(s.adminUsers))
	mux.HandleFunc("GET /api/admin/users/{id}", s.requireAdmin(s.adminUserDetail))
	mux.HandleFunc("PATCH /api/admin/users/{id}", s.requireAdmin(s.updateAdminUser))
	mux.HandleFunc("GET /api/admin/bookings", s.requireAdmin(s.adminBookings))
	mux.HandleFunc("GET /api/admin/bookings/{reference}", s.requireAdmin(s.adminBookingDetail))
	mux.HandleFunc("PATCH /api/admin/bookings/{reference}", s.requireAdmin(s.updateAdminBooking))
	mux.HandleFunc("GET /api/admin/payments", s.requireAdmin(s.adminPayments))
	mux.HandleFunc("GET /api/admin/payments/{reference}", s.requireAdmin(s.adminPaymentDetail))
	mux.HandleFunc("PATCH /api/admin/payments/{reference}", s.requireAdmin(s.updateAdminPayment))
	mux.HandleFunc("GET /api/admin/reconciliation", s.requireAdmin(s.adminReconciliation))
	mux.HandleFunc("PATCH /api/admin/reconciliation/{reference}", s.requireAdmin(s.updateReconciliation))
	mux.HandleFunc("GET /api/admin/support-requests", s.requireAdmin(s.adminSupportRequests))
	mux.HandleFunc("GET /api/admin/support-requests/{reference}", s.requireAdmin(s.adminSupportDetail))
	mux.HandleFunc("PATCH /api/admin/support-requests/{reference}", s.requireAdmin(s.updateAdminSupport))
	mux.HandleFunc("GET /api/admin/service-bookings", s.requireAdmin(s.adminServiceBookings))
	mux.HandleFunc("GET /api/admin/service-bookings/{reference}", s.requireAdmin(s.adminServiceBookingDetail))
	mux.HandleFunc("PATCH /api/admin/service-bookings/{reference}", s.requireAdmin(s.updateAdminServiceBooking))
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(sanitizeJSONPayload(payload))
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{"error": message})
}

func decodeJSON(r *http.Request, target any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(target)
}
