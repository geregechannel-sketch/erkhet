"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { UserDetail } from "@/lib/types";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [detail, setDetail] = useState<UserDetail | null>(null);

  useEffect(() => {
    if (!token || !params.id) return;
    void browserApiFetch<UserDetail>(`/admin/users/${params.id}`, {
      headers: authHeaders(token)
    }).then(setDetail);
  }, [params.id, token]);

  if (!detail) {
    return <div className="panel loadingPanel">Ачааллаж байна...</div>;
  }

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{detail.user.fullName}</h1></div>
      <section className="panel stackMd">
        <p><strong>Email:</strong> {detail.user.email}</p>
        <p><strong>Phone:</strong> {detail.user.phone || "-"}</p>
        <p><strong>Role:</strong> {detail.user.role}</p>
        <p><strong>Status:</strong> {detail.user.status}</p>
        <p><strong>Created:</strong> {formatDate(detail.user.createdAt)}</p>
      </section>
      <section className="panel stackSm">
        <h2>Saved tours</h2>
        {detail.favorites.length === 0 ? <p className="meta">No saved tours.</p> : detail.favorites.map((tour) => <p key={tour.slug}>{tour.title}</p>)}
      </section>
      <section className="panel stackSm">
        <h2>Bookings</h2>
        {detail.bookings.length === 0 ? <p className="meta">No bookings.</p> : detail.bookings.map((booking) => <p key={booking.bookingReference}>{booking.bookingReference} • {booking.tourTitle} • {formatCurrency(booking.amount, booking.currency)}</p>)}
      </section>
      <section className="panel stackSm">
        <h2>Payments</h2>
        {detail.payments.length === 0 ? <p className="meta">No payments.</p> : detail.payments.map((payment) => <p key={payment.paymentReference}>{payment.paymentReference} • {payment.status} • {formatCurrency(payment.amount, payment.currency)}</p>)}
      </section>
      <section className="panel stackSm">
        <h2>Support history</h2>
        {detail.support.length === 0 ? <p className="meta">No support records.</p> : detail.support.map((request) => <p key={request.supportReference}>{request.supportReference} • {request.subject} • {request.status}</p>)}
      </section>
    </div>
  );
}