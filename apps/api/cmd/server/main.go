package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"erkhet-api/internal/auth"
	"erkhet-api/internal/db"
	httpapi "erkhet-api/internal/http"
	"erkhet-api/internal/payments"
	"erkhet-api/internal/store"
)

const (
	demoCustomerPassword = "ErkhetUser2!2026"
	demoAdminPassword    = "ErkhetAdmin3!2026"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	database, err := db.Open()
	if err != nil {
		log.Fatalf("database connection failed: %v", err)
	}
	defer database.Close()

	repo := store.Repository{DB: database}
	if err := repo.EnsureServiceBookingSchema(); err != nil {
		log.Fatalf("service booking schema failed: %v", err)
	}
	if err := repo.EnsureBookingFeatureSchema(); err != nil {
		log.Fatalf("booking feature schema failed: %v", err)
	}
	if err := repo.EnsurePasswordResetSchema(); err != nil {
		log.Fatalf("password reset schema failed: %v", err)
	}
	ensureBootstrapAdmin(repo)
	ensureDemoUsers(repo)

	ttlHours := 168
	if raw := os.Getenv("SESSION_TTL_HOURS"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			ttlHours = parsed
		}
	}

	passwordResetTTL := 30 * time.Minute
	if raw := os.Getenv("PASSWORD_RESET_TTL_MINUTES"); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil && parsed > 0 {
			passwordResetTTL = time.Duration(parsed) * time.Minute
		}
	}

	publicBaseURL := os.Getenv("PUBLIC_WEB_URL")
	if publicBaseURL == "" {
		publicBaseURL = "http://localhost:3000"
	}
	passwordResetPreview := !strings.EqualFold(os.Getenv("PASSWORD_RESET_PREVIEW"), "false")

	mux := http.NewServeMux()
	server := httpapi.Server{
		Repo:                 repo,
		Gateway:              payments.DemoGateway{},
		SessionTTL:           time.Duration(ttlHours) * time.Hour,
		PublicBaseURL:        publicBaseURL,
		PasswordResetTTL:     passwordResetTTL,
		PasswordResetPreview: passwordResetPreview,
	}
	server.Register(mux)

	handler := withCORS(mux)
	log.Printf("api server listening on :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

func ensureBootstrapAdmin(repo store.Repository) {
	email := os.Getenv("ADMIN_BOOTSTRAP_EMAIL")
	password := os.Getenv("ADMIN_BOOTSTRAP_PASSWORD")
	if email == "" || password == "" {
		return
	}
	fullName := os.Getenv("ADMIN_BOOTSTRAP_NAME")
	if fullName == "" {
		fullName = "System Admin"
	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		log.Printf("failed to hash bootstrap admin password: %v", err)
		return
	}
	if err := repo.EnsureAdminUser(fullName, email, hash); err != nil {
		log.Printf("failed to ensure bootstrap admin: %v", err)
	}
}

func ensureDemoUsers(repo store.Repository) {
	if !strings.EqualFold(os.Getenv("DEMO_USERS_ENABLED"), "true") {
		return
	}

	customerHash, err := auth.HashPassword(demoCustomerPassword)
	if err != nil {
		log.Printf("failed to hash demo customer password: %v", err)
		return
	}
	adminHash, err := auth.HashPassword(demoAdminPassword)
	if err != nil {
		log.Printf("failed to hash demo admin password: %v", err)
		return
	}

	demoSpecs := []struct {
		fullName     string
		email        string
		phone        string
		role         string
		passwordHash string
	}{
		{fullName: "user2", email: "user2", phone: "+976 99000002", role: "customer", passwordHash: customerHash},
		{fullName: "user3", email: "user3", phone: "+976 99000003", role: "super_admin", passwordHash: adminHash},
	}

	users := map[string]store.User{}
	for _, spec := range demoSpecs {
		user, err := repo.EnsureUser(spec.fullName, spec.email, spec.phone, spec.passwordHash, spec.role)
		if err != nil {
			log.Printf("failed to ensure demo user %s: %v", spec.email, err)
			continue
		}
		users[spec.email] = user
	}

	if demoUser, ok := users["user2"]; ok {
		ensureDemoCustomerScenario(repo, demoUser)
	}
}

func ensureDemoCustomerScenario(repo store.Repository, user store.User) {
	if err := repo.SaveFavorite(user.ID, "ub-4d"); err != nil {
		log.Printf("failed to seed demo favorite for %s: %v", user.Email, err)
	}

	bookings, err := repo.ListBookingsByUser(user.ID)
	if err != nil {
		log.Printf("failed to load demo bookings for %s: %v", user.Email, err)
		return
	}

	var booking store.Booking
	if len(bookings) == 0 {
		created, err := repo.CreateBooking(
			user.ID,
			"gobi-5d",
			user.FullName,
			user.Email,
			user.Phone,
			"2026-06-17",
			2,
			[]store.TravelerDetail{
				{FullName: "Demo Traveler One", Age: 32, Gender: "Male", Hobby: "Photography", Diet: "Regular", Allergy: "None"},
				{FullName: "Demo Traveler Two", Age: 29, Gender: "Female", Hobby: "Nature", Diet: "Vegetarian", Allergy: "None"},
			},
			"Demo seeded booking for user2 dashboard preview.",
		)
		if err != nil {
			log.Printf("failed to create demo booking for %s: %v", user.Email, err)
			return
		}
		booking = created
	} else {
		booking = bookings[0]
	}

	payments, err := repo.ListPaymentsByUser(user.ID)
	if err != nil {
		log.Printf("failed to load demo payments for %s: %v", user.Email, err)
		return
	}
	if len(payments) == 0 {
		payment, err := repo.CreatePayment(booking.BookingReference, user.ID, "demo_gateway", "qpay")
		if err != nil {
			log.Printf("failed to create demo payment for %s: %v", user.Email, err)
		} else if _, err := repo.SimulatePayment(payment.PaymentReference, user.ID, "success"); err != nil {
			log.Printf("failed to finalize demo payment for %s: %v", user.Email, err)
		}
	}

	supportItems, err := repo.ListSupportRequestsByUser(user.ID)
	if err != nil {
		log.Printf("failed to load demo support for %s: %v", user.Email, err)
		return
	}
	if len(supportItems) == 0 {
		userID := user.ID
		if _, err := repo.CreateSupportRequest(
			&userID,
			booking.BookingReference,
			booking.TourSlug,
			"support",
			"Demo support request",
			"This seeded request helps verify the registered customer menu and support history.",
			user.FullName,
			user.Email,
			user.Phone,
		); err != nil {
			log.Printf("failed to create demo support for %s: %v", user.Email, err)
		}
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
