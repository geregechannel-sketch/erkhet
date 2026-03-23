package payments

import "fmt"

type Intent struct {
	Provider    string `json:"provider"`
	Method      string `json:"method"`
	CheckoutURL string `json:"checkoutUrl"`
	Message     string `json:"message"`
}

type Gateway interface {
	CreateIntent(bookingReference, paymentReference, method string) Intent
}

type DemoGateway struct{}

func (DemoGateway) CreateIntent(bookingReference, paymentReference, method string) Intent {
	return Intent{
		Provider:    "manual_demo",
		Method:      method,
		CheckoutURL: "/account/payments?booking=" + bookingReference + "&payment=" + paymentReference,
		Message:     fmt.Sprintf("%s payment request created. Complete, fail, or cancel it from My Payments.", method),
	}
}
