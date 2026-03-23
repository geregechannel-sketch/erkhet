package store

import "time"

type ServiceBooking struct {
	ID               int64          `json:"id"`
	ServiceReference string         `json:"serviceReference"`
	UserID           int64          `json:"userId"`
	UserName         string         `json:"userName,omitempty"`
	UserEmail        string         `json:"userEmail,omitempty"`
	ServiceType      string         `json:"serviceType"`
	ServiceLabel     string         `json:"serviceLabel"`
	Status           string         `json:"status"`
	Destination      string         `json:"destination"`
	TravelDate       string         `json:"travelDate"`
	EndDate          string         `json:"endDate,omitempty"`
	Quantity         int            `json:"quantity"`
	ContactName      string         `json:"contactName"`
	ContactEmail     string         `json:"contactEmail"`
	ContactPhone     string         `json:"contactPhone"`
	Details          map[string]any `json:"details"`
	AdminNote        string         `json:"adminNote,omitempty"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
}

type ServiceBookingFilter struct {
	Search      string
	Status      string
	ServiceType string
}
