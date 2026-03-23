"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Booking, SupportRequest } from "@/lib/types";

export default function SupportPage() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    const [nextRequests, nextBookings] = await Promise.all([
      browserApiFetch<SupportRequest[]>("/me/support-requests", { headers: authHeaders(token) }),
      browserApiFetch<Booking[]>("/me/bookings", { headers: authHeaders(token) })
    ]);
    setRequests(nextRequests);
    setBookings(nextBookings);
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const formData = new FormData(event.currentTarget);
    try {
      await browserApiFetch<SupportRequest>("/support-requests", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          type: formData.get("type"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          bookingReference: formData.get("bookingReference"),
          customerName: user?.fullName,
          customerEmail: user?.email,
          customerPhone: user?.phone
        })
      });
      event.currentTarget.reset();
      await loadData();
      setMessage("Support request амжилттай үүслээ.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Support request үүсгэхэд алдаа гарлаа.");
    }
  };

  return (
    <section className="stackLg">
      <div className="sectionHeading compact"><h1>Feedback / Support</h1></div>
      <article className="panel stackMd">
        <h2>Шинэ хүсэлт</h2>
        <form className="formGrid" onSubmit={onSubmit}>
          <select name="type" defaultValue="support">
            <option value="support">Support</option>
            <option value="feedback">Feedback</option>
            <option value="complaint">Complaint</option>
          </select>
          <select name="bookingReference" defaultValue="">
            <option value="">Booking сонгохгүй</option>
            {bookings.map((booking) => (
              <option key={booking.bookingReference} value={booking.bookingReference}>{booking.bookingReference} • {booking.tourTitle}</option>
            ))}
          </select>
          <input className="full" name="subject" placeholder="Гарчиг" required />
          <textarea className="full" name="message" placeholder="Тайлбар" required />
          <button className="btn primary full" type="submit">Илгээх</button>
        </form>
      </article>
      {message ? <p className="inlineMessage success">{message}</p> : null}
      <div className="stackMd">
        {requests.length === 0 ? <article className="panel emptyState">Support history хоосон байна.</article> : requests.map((request) => (
          <article key={request.supportReference} className="panel stackSm">
            <div className="sectionHeading compact">
              <div>
                <h2>{request.subject}</h2>
                <p className="meta">{request.supportReference} • {formatDate(request.createdAt)}</p>
              </div>
              <strong>{request.status}</strong>
            </div>
            <p>{request.message}</p>
            {request.bookingReference ? <p className="meta">Booking: {request.bookingReference}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}