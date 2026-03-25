"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Booking, SupportRequest } from "@/lib/types";

const requestTypeLabels = {
  support: "Тусламж",
  feedback: "Санал хүсэлт",
  complaint: "Гомдол",
} as const;

export default function SupportPage() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    const [nextRequests, nextBookings] = await Promise.all([
      browserApiFetch<SupportRequest[]>("/me/support-requests", {
        headers: authHeaders(token),
      }),
      browserApiFetch<Booking[]>("/me/bookings", { headers: authHeaders(token) }),
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
          customerPhone: user?.phone,
        }),
      });
      event.currentTarget.reset();
      await loadData();
      setMessage("Таны хүсэлтийг амжилттай хүлээн авлаа.");
    } catch (error) {
      setMessage(
        error instanceof ApiError ? error.message : "Хүсэлт илгээхэд алдаа гарлаа.",
      );
    }
  };

  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <h1>Санал хүсэлт</h1>
      </div>

      <article className="panel stackMd">
        <h2>Санал хүсэлт илгээх</h2>
        <p className="meta">
          Та бүхэн бидэнтэй бүх сувгаар дамжуулан холбогдох боломжтой. Бид
          тантай эргэн хурдан хугацаанд холбогдох болно.
        </p>
        <form className="formGrid" onSubmit={onSubmit}>
          <select name="type" defaultValue="support">
            <option value="support">{requestTypeLabels.support}</option>
            <option value="feedback">{requestTypeLabels.feedback}</option>
            <option value="complaint">{requestTypeLabels.complaint}</option>
          </select>
          <select name="bookingReference" defaultValue="">
            <option value="">Холбогдох захиалга сонгохгүй</option>
            {bookings.map((booking) => (
              <option key={booking.bookingReference} value={booking.bookingReference}>
                {booking.tourTitle}
              </option>
            ))}
          </select>
          <input className="full" name="subject" placeholder="Гарчиг" required />
          <textarea className="full" name="message" placeholder="Тайлбар" required />
          <button className="btn primary full" type="submit">
            Илгээх
          </button>
        </form>
      </article>

      {message ? <p className="inlineMessage success">{message}</p> : null}

      <div className="stackMd">
        {requests.length === 0 ? (
          <article className="panel emptyState">Одоогоор ирүүлсэн хүсэлт алга.</article>
        ) : (
          requests.map((request) => (
            <article key={request.supportReference} className="panel stackSm">
              <div className="sectionHeading compact">
                <div>
                  <h2>{request.subject}</h2>
                  <p className="meta">
                    {requestTypeLabels[request.type as keyof typeof requestTypeLabels] ||
                      "Хүсэлт"}{" "}
                    • {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
              <p>{request.message}</p>
              {request.bookingReference ? (
                <p className="meta">Холбогдох захиалга: {request.bookingReference}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
