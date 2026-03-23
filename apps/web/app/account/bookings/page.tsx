"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatBookingStatus, formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Booking, Payment } from "@/lib/types";

export default function BookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!token) {
      return;
    }
    const next = await browserApiFetch<Booking[]>("/me/bookings", {
      headers: authHeaders(token)
    });
    setBookings(next);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const created = params.get("created");
    if (created) {
      setMessage(`${created} дугаартай захиалга үүслээ.`);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [token]);

  const createPayment = async (bookingReference: string) => {
    if (!token) return;
    try {
      const response = await browserApiFetch<{ payment: Payment }>("/payments", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ bookingReference, method: "QPay (MN)" })
      });
      setMessage(`Төлбөрийн хүсэлт ${response.payment.paymentReference} амжилттай үүслээ.`);
      await loadBookings();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Төлбөр үүсгэхэд алдаа гарлаа.");
    }
  };

  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">My Account</p>
          <h1>Миний захиалгууд</h1>
        </div>
      </div>

      {message ? <p className="inlineMessage success">{message}</p> : null}

      <div className="stackMd">
        {bookings.length === 0 ? (
          <article className="panel emptyState stackSm">
            <h3>Одоогоор захиалгын бүртгэл алга.</h3>
            <p>Хуваарьт аялал сонгох эсвэл захиалгат хүсэлт илгээх боломжтой.</p>
            <div className="rowActions">
              <Link className="btn primary" href="/tours">Аяллууд үзэх</Link>
              <Link className="btn secondary" href="/enquire/step/1">Аялал төлөвлөх</Link>
            </div>
          </article>
        ) : bookings.map((booking) => (
          <article key={booking.bookingReference} className="panel stackSm bookingListCard">
            <div className="sectionHeading compact">
              <div>
                <h2>{booking.tourTitle}</h2>
                <p className="meta">{booking.bookingReference} • {formatDate(booking.createdAt)}</p>
              </div>
              <div className="stackXs alignEnd">
                <strong>{formatBookingStatus(booking.bookingStatus)}</strong>
                <span className="meta">{formatPaymentStatus(booking.paymentStatus)}</span>
              </div>
            </div>

            <div className="detailMetaGrid">
              <div>
                <strong>Гарах өдөр</strong>
                <p>{formatDate(booking.preferredDepartureDate) || "Тохиролцоно"}</p>
              </div>
              <div>
                <strong>Оролцогч</strong>
                <p>{booking.participantCount} хүн</p>
              </div>
              <div>
                <strong>Дүн</strong>
                <p>{booking.amount > 0 ? formatCurrency(booking.amount, booking.currency) : "Үнэ хүсэлтээр"}</p>
              </div>
            </div>

            <div className="cardActions wrapActions">
              <Link className="btn secondary" href={`/account/bookings/${booking.bookingReference}`}>Нээх</Link>
              <Link className="btn secondary" href={`/tours/${booking.tourSlug}`}>Аялал харах</Link>
              {booking.amount > 0 && booking.paymentStatus !== "paid" ? (
                <button className="btn primary" type="button" onClick={() => void createPayment(booking.bookingReference)}>
                  Төлбөр үүсгэх
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}