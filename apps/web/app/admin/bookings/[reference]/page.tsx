"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TravelerDetailsTable } from "@/components/bookings/TravelerDetailsTable";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import {
  describeDuration,
  formatBookingStatus,
  formatCurrency,
  formatDate,
  formatPaymentStatus
} from "@/lib/format";
import type { Booking, Tour } from "@/lib/types";

export default function AdminBookingDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadBooking = async () => {
    if (!token || !params.reference) return;
    const next = await browserApiFetch<Booking>(`/admin/bookings/${params.reference}`, {
      headers: authHeaders(token)
    });
    setBooking(next);
    try {
      const nextTour = await browserApiFetch<Tour>(`/tours/${next.tourSlug}`);
      setTour(nextTour);
    } catch {
      setTour(null);
    }
  };

  useEffect(() => {
    void loadBooking();
  }, [params.reference, token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !params.reference) return;
    const formData = new FormData(event.currentTarget);
    try {
      await browserApiFetch(`/admin/bookings/${params.reference}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          bookingStatus: formData.get("bookingStatus"),
          adminNote: formData.get("adminNote")
        })
      });
      setMessage("Захиалгын төлөв шинэчлэгдлээ.");
      await loadBooking();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Захиалга шинэчлэхэд алдаа гарлаа.");
    }
  };

  if (!booking) {
    return <div className="panel loadingPanel">Захиалгын мэдээлэл ачааллаж байна...</div>;
  }

  return (
    <div className="stackLg bookingDetailPage">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">Admin booking</p>
          <h1>{booking.bookingReference}</h1>
          <p className="meta">{booking.tourTitle} • {booking.userName}</p>
        </div>
        <div className="stackXs alignEnd">
          <span className={`statusPill status-${booking.bookingStatus}`}>{formatBookingStatus(booking.bookingStatus)}</span>
          <span className={`statusPill status-${booking.paymentStatus}`}>{formatPaymentStatus(booking.paymentStatus)}</span>
        </div>
      </div>

      <section className="panel stackMd">
        <div className="detailMetaGrid">
          <div><strong>Хэрэглэгч</strong><p>{booking.userName} ({booking.userEmail})</p></div>
          <div><strong>Аялагч</strong><p>{booking.travelerName}</p></div>
          <div><strong>Утас</strong><p>{booking.phone}</p></div>
          <div><strong>И-мэйл</strong><p>{booking.email}</p></div>
          <div><strong>Гарах өдөр</strong><p>{formatDate(booking.preferredDepartureDate) || "Тохиролцоно"}</p></div>
          <div><strong>Оролцогч</strong><p>{booking.participantCount} хүн</p></div>
          <div><strong>Дүн</strong><p>{formatCurrency(booking.amount, booking.currency)}</p></div>
          <div><strong>Үүссэн огноо</strong><p>{formatDate(booking.createdAt)}</p></div>
        </div>
        {booking.note ? <p><strong>Хэрэглэгчийн тэмдэглэл:</strong> {booking.note}</p> : null}
      </section>

      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>Аяллын маршрут</h2>
            <p className="meta">{tour ? describeDuration(tour.durationDays, tour.durationNights) : "Public маршрут байхгүй"}</p>
          </div>
        </div>
        {tour ? (
          <div className="stackSm">
            <img className="bookingDetailImage" src={tour.coverImage} alt={tour.title} />
            {tour.itinerary.map((item) => (
              <article key={item} className="card slimCard">
                <div className="content">{item}</div>
              </article>
            ))}
          </div>
        ) : (
          <p className="meta">Энэ аяллын public дэлгэрэнгүй ачаалагдсангүй.</p>
        )}
      </section>

      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>Аялагчдын хүснэгт</h2>
            <p className="meta">Аюулгүй байдал болон үйлчилгээний зохион байгуулалтад ашиглах мэдээлэл.</p>
          </div>
        </div>
        <TravelerDetailsTable travelers={booking.travelerDetails} />
      </section>

      <section className="panel stackMd">
        <h2>Захиалгын workflow</h2>
        <form className="stackMd" onSubmit={onSubmit}>
          <select name="bookingStatus" defaultValue={booking.bookingStatus}>
            <option value="pending">pending</option>
            <option value="confirmed">confirmed</option>
            <option value="cancelled">cancelled</option>
            <option value="completed">completed</option>
          </select>
          <textarea name="adminNote" rows={5} defaultValue={booking.adminNote || ""} placeholder="Дотоод тэмдэглэл" />
          <div className="rowActions wrapActions">
            <button className="btn primary" type="submit">Шинэчлэх</button>
            <Link className="btn secondary" href="/admin/bookings">Жагсаалт руу буцах</Link>
          </div>
        </form>
        {message ? <p className="inlineMessage success">{message}</p> : null}
      </section>
    </div>
  );
}