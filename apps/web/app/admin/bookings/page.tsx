"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatBookingStatus, formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Booking } from "@/lib/types";

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<Booking[]>("/admin/bookings", {
      headers: authHeaders(token)
    }).then(setBookings);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Захиалгууд</h1>
        </div>
      </div>

      <section className="panel stackMd">
        {bookings.length === 0 ? <p className="meta">Одоогоор захиалгын бичлэг алга.</p> : null}
        {bookings.map((booking) => (
          <article key={booking.bookingReference} className="listRow alignStart">
            <div className="stackXs">
              <Link href={`/admin/bookings/${booking.bookingReference}`}><strong>{booking.bookingReference}</strong></Link>
              <p className="meta">{booking.userName} • {booking.tourTitle}</p>
              <p className="meta">Гарах өдөр: {formatDate(booking.preferredDepartureDate) || "Тохиролцоно"}</p>
            </div>
            <div className="stackXs alignEnd">
              <strong>{formatBookingStatus(booking.bookingStatus)}</strong>
              <span className="meta">{formatPaymentStatus(booking.paymentStatus)}</span>
              <span className="meta">{formatCurrency(booking.amount, booking.currency)} • {formatDate(booking.createdAt)}</span>
              <Link className="btn secondary btnSmall" href={`/admin/bookings/${booking.bookingReference}`}>Нээх</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}