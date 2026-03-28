package httpapi

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"erkhet-api/internal/store"
)

func (s Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s Server) company(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"name":           "Erkhet Solar Tours LLC",
		"nameMn":         "Эрхэт Солар Турс ХХК",
		"founded":        2016,
		"phone":          "+976 95633513",
		"email":          "erkhetsolartours@gmail.com",
		"address":        "",
		"facebook":       "https://www.facebook.com/share/1bzQfpFhu3/",
		"paymentMethods": []string{"QPay (MN)", "Visa/Mastercard (Stripe)"},
	})
}

func (s Server) destinations(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"Төв бүс": []string{"Элсэн тасархай", "Эрдэнэзуу хийд", "Төвхөн хийд"},
		"Хангайн бүс": []string{"Чулуутын хавцал", "Тэрхийн цагаан нуур", "Хоргын тогоо", "Хөвсгөл нуур", "Алтай Таван богд"},
		"Зүүн бүс": []string{"Хар зүрхний Хөх нуур", "Аварга тосон рашаан", "Хэрхлүүр Сарьдаг"},
		"Говийн бүс": []string{"Цагаан суварга", "Хонгорын элс", "Баянзаг", "Ёлын ам", "Хамрын хийд"},
		"Улаанбаатар орчим": []string{"Сүхбаатарын талбай", "Гандан", "Зайсан", "Чингис хааны морьт хөшөөт цогцолбор"},
	})
}

func (s Server) listTours(w http.ResponseWriter, r *http.Request) {
	filter := store.TourFilter{
		Search:        r.URL.Query().Get("search"),
		BusinessLine:  r.URL.Query().Get("businessLine"),
		OperationType: r.URL.Query().Get("operationType"),
		TourKind:      r.URL.Query().Get("tourKind"),
	}
	tours, err := s.Repo.ListTours(filter, false)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to load tours")
		return
	}
	writeJSON(w, http.StatusOK, tours)
}

func (s Server) getTour(w http.ResponseWriter, r *http.Request) {
	tour, err := s.Repo.GetTourBySlug(r.PathValue("slug"), false)
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

type supportRequestInput struct {
	Type             string `json:"type"`
	Subject          string `json:"subject"`
	Message          string `json:"message"`
	CustomerName     string `json:"customerName"`
	CustomerEmail    string `json:"customerEmail"`
	CustomerPhone    string `json:"customerPhone"`
	BookingReference string `json:"bookingReference"`
	TourSlug         string `json:"tourSlug"`
	Locale           string `json:"locale"`
}

func (s Server) createSupportRequest(w http.ResponseWriter, r *http.Request) {
	var input supportRequestInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if input.Type == "" {
		input.Type = "support"
	}
	if !oneOf(input.Type, "support", "feedback", "complaint") {
		writeError(w, http.StatusBadRequest, "unsupported support type")
		return
	}
	if strings.TrimSpace(input.Subject) == "" || strings.TrimSpace(input.Message) == "" {
		writeError(w, http.StatusBadRequest, "subject and message are required")
		return
	}

	var userID *int64
	preferredLanguage := ""
	if session, err := s.currentSession(r); err == nil {
		userID = &session.User.ID
		preferredLanguage = session.User.PreferredLanguage
	}
	if userID == nil && strings.TrimSpace(input.CustomerName) == "" {
		writeError(w, http.StatusBadRequest, "customer name is required")
		return
	}
	created, err := s.Repo.CreateSupportRequest(
		userID,
		input.BookingReference,
		input.TourSlug,
		input.Type,
		input.Subject,
		input.Message,
		input.CustomerName,
		input.CustomerEmail,
		input.CustomerPhone,
		resolveSupportRequestLocale(input.Locale, preferredLanguage, r.Header.Get("Accept-Language")),
	)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusBadRequest, "booking or tour reference is invalid")
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to create support request")
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

type legacyInquiryInput struct {
	Name           string `json:"name"`
	Phone          string `json:"phone"`
	Email          string `json:"email"`
	InterestedTour string `json:"interested_tour"`
	PeopleCount    int    `json:"people_count"`
	DaysCount      int    `json:"days_count"`
	Note           string `json:"note"`
	Locale         string `json:"locale"`
}

func resolveSupportRequestLocale(explicitLocale, preferredLanguage, acceptLanguage string) string {
	for _, candidate := range []string{explicitLocale, preferredLanguage, acceptLanguage} {
		normalized := strings.ToLower(strings.TrimSpace(candidate))
		switch {
		case strings.HasPrefix(normalized, "zh"), strings.HasPrefix(normalized, "cn"):
			return "zh"
		case strings.HasPrefix(normalized, "ru"):
			return "ru"
		case strings.HasPrefix(normalized, "en"):
			return "en"
		case strings.HasPrefix(normalized, "mn"):
			return "mn"
		}
	}

	return "mn"
}

func (s Server) createInquiryAlias(w http.ResponseWriter, r *http.Request) {
	var input legacyInquiryInput
	if err := decodeJSON(r, &input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid payload")
		return
	}
	if strings.TrimSpace(input.Name) == "" || strings.TrimSpace(input.Phone) == "" {
		writeError(w, http.StatusBadRequest, "name and phone are required")
		return
	}
	lines := []string{}
	if strings.TrimSpace(input.InterestedTour) != "" {
		lines = append(lines, "Interested tour: "+strings.TrimSpace(input.InterestedTour))
	}
	if input.PeopleCount > 0 {
		lines = append(lines, "People count: "+strconv.Itoa(input.PeopleCount))
	}
	if input.DaysCount > 0 {
		lines = append(lines, "Preferred days: "+strconv.Itoa(input.DaysCount))
	}
	if strings.TrimSpace(input.Note) != "" {
		lines = append(lines, strings.TrimSpace(input.Note))
	}
	message := strings.Join(lines, "\n")
	created, err := s.Repo.CreateSupportRequest(
		nil,
		"",
		"",
		"support",
		"Public inquiry",
		message,
		input.Name,
		input.Email,
		input.Phone,
		resolveSupportRequestLocale(input.Locale, "", r.Header.Get("Accept-Language")),
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save inquiry")
		return
	}
	writeJSON(w, http.StatusCreated, created)
}
