export type User = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
};

export type TravelerDetail = {
  fullName: string;
  age?: number | null;
  gender: string;
  hobby: string;
  diet: string;
  allergy: string;
};

export type Tour = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  businessLine: "inbound" | "outbound" | "domestic";
  operationType: "scheduled" | "custom";
  tourKind: "multi_day" | "day_tour";
  durationDays: number;
  durationNights: number;
  priceAmount?: number;
  currency?: string;
  pricingNote?: string;
  route: string;
  coverImage: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  capacity: number;
  availabilityCount: number;
  departureDates: string[];
  itinerary: string[];
  inclusions: string[];
  exclusions: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  saved?: boolean;
};

export type Booking = {
  id: number;
  bookingReference: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  tourId: number;
  tourSlug: string;
  tourTitle: string;
  travelerName: string;
  email: string;
  phone: string;
  preferredDepartureDate: string;
  participantCount: number;
  note: string;
  travelerDetails: TravelerDetail[];
  amount: number;
  currency: string;
  bookingStatus: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "pending" | "partially_paid" | "paid" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  adminNote?: string;
  reviewFlag: boolean;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: number;
  paymentReference: string;
  bookingId: number;
  bookingReference?: string;
  userId: number;
  userName?: string;
  tourTitle?: string;
  provider: string;
  method: string;
  providerReference?: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  failureReason?: string;
  refundedAmount: number;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportEvent = {
  id: number;
  eventType: string;
  message: string;
  actorLabel: string;
  createdAt: string;
};

export type SupportRequest = {
  id: number;
  supportReference: string;
  userId?: number;
  userName?: string;
  bookingReference?: string;
  tourSlug?: string;
  tourTitle?: string;
  type: "support" | "feedback" | "complaint";
  subject: string;
  message: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "new" | "in_review" | "resolved" | "closed";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  events?: SupportEvent[];
};

export type DashboardSummary = {
  savedTours: number;
  pendingBookings: number;
  activePayments: number;
  openSupport: number;
};

export type AdminSummary = {
  totalUsers: number;
  publishedTours: number;
  pendingBookings: number;
  pendingPayments: number;
  unreconciled: number;
  openSupportRequests: number;
};

export type ReconciliationItem = {
  bookingReference: string;
  userName: string;
  tourTitle: string;
  expectedAmount: number;
  currency: string;
  paidAmount: number;
  outstanding: number;
  paymentCount: number;
  bookingStatus: string;
  paymentStatus: string;
  state: string;
  reviewFlag: boolean;
  reviewNote?: string;
  createdAt: string;
};

export type UserDetail = {
  user: User;
  favorites: Tour[];
  bookings: Booking[];
  payments: Payment[];
  support: SupportRequest[];
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type PaymentIntent = {
  provider: string;
  method: string;
  checkoutUrl: string;
  message: string;
};

export type PasswordResetResponse = {
  ok: boolean;
  previewResetLink?: string;
};

export type ServiceBooking = {
  id: number;
  serviceReference: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  serviceType: "hotel" | "restaurant" | "flight" | "taxi" | "esim" | "insurance";
  serviceLabel: string;
  status: "new" | "in_review" | "quoted" | "confirmed" | "cancelled" | "completed";
  destination: string;
  travelDate: string;
  endDate?: string;
  quantity: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  details: Record<string, string | number | boolean | null>;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};
