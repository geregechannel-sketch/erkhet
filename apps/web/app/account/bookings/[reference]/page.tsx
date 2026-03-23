"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import type { Booking, Payment, Tour } from "@/lib/types";

export default function BookingDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const reference = params?.reference;

  const loadData = async () => {
    if (!token || !reference) {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const [nextBooking, nextPayments] = await Promise.all([
        browserApiFetch<Booking>(`/me/bookings/${reference}`, {
          headers: authHeaders(token)
        }),
        browserApiFetch<Payment[]>("/me/payments", {
          headers: authHeaders(token)
        })
      ]);
      setBooking(nextBooking);
      setPayments(nextPayments.filter((item) => item.bookingReference === nextBooking.bookingReference));

      try {
        const nextTour = await browserApiFetch<Tour>(`/tours/${nextBooking.tourSlug}`);
        setTour(nextTour);
      } catch {
        setTour(null);
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Захиалгын мэдээлэл ачаалахад алдаа гарлаа.");
      setBooking(null);
      setTour(null);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [reference, token]);

  const paymentSummary = useMemo(() => {
    return payments.reduce((sum, payment) => {
      if (payment.status === "paid" || payment.status === "partially_refunded") {
        return sum + payment.amount - payment.refundedAmount;
      }
      return sum;
    }, 0);
  }, [payments]);

  const createPayment = async () => {
    if (!token || !booking) return;
    try {
      const response = await browserApiFetch<{ payment: Payment }>("/payments", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ bookingReference: booking.bookingReference, method: "QPay (MN)" })
      });
      setMessage(`Төлбөрийн хүсэлт ${response.payment.paymentReference} үүслээ.`);
      await loadData();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Төлбөр үүсгэхэд алдаа гарлаа.");
    }
  };

  const simulate = async (paymentReference: string, outcome: "success" | "failed" | "cancelled") => {
    if (!token) return;
    try {
      await browserApiFetch<Payment>(`/payments/${paymentReference}/simulate`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ outcome })
      });
      setMessage("Төлбөрийн төлөв шинэчлэгдлээ.");
      await loadData();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Төлбөр шинэчлэхэд алдаа гарлаа.");
    }
  };

  if (loading) {
    return <div className="panel loadingPanel">Захиалгын мэдээлэл ачааллаж байна...</div>;
  }

  if (!booking) {
    return (
      <section className="stackLg">
        <div className="sectionHeading compact"><h1>Захиалга олдсонгүй</h1></div>
        {message ? <p className="inlineMessage error">{message}</p> : null}
        <Link className="btn secondary" href="/account/bookings">Захиалгууд руу буцах</Link>
      </section>
    );
  }

  return (
    <section className="stackLg bookingDetailPage">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">Booking detail</p>
          <h1>{booking.tourTitle}</h1>
          <p className="meta">{booking.bookingReference} • {formatDate(booking.createdAt)}</p>
        </div>
        <div className="stackXs alignEnd">
          <span className={`statusPill status-${booking.bookingStatus}`}>{formatBookingStatus(booking.bookingStatus)}</span>
          <span className={`statusPill status-${booking.paymentStatus}`}>{formatPaymentStatus(booking.paymentStatus)}</span>
        </div>
      </div>

      {message ? <p className="inlineMessage success">{message}</p> : null}

      <div className="bookingDetailSummary">
        <article className="summaryTile">
          <strong>{formatDate(booking.preferredDepartureDate) || "Тохиролцоно"}</strong>
          <span>Гарах өдөр</span>
        </article>
        <article className="summaryTile">
          <strong>{booking.participantCount} хүн</strong>
          <span>Оролцогчийн тоо</span>
        </article>
        <article className="summaryTile">
          <strong>{booking.amount > 0 ? formatCurrency(booking.amount, booking.currency) : "Үнэ хүсэлтээр"}</strong>
          <span>Нийт дүн</span>
        </article>
        <article className="summaryTile">
          <strong>{paymentSummary > 0 ? formatCurrency(paymentSummary, booking.currency) : "0"}</strong>
          <span>Төлөгдсөн дүн</span>
        </article>
      </div>

      <div className="grid c2 bookingDetailGrid">
        <article className="panel stackMd">
          <div className="sectionHeading compact">
            <div>
              <h2>Аяллын нэгдсэн төлөвлөгөө</h2>
              <p className="meta">Захиалга, маршрут, холбоо барих мэдээлэл нэг дор.</p>
            </div>
          </div>

          <div className="detailMetaGrid">
            <div>
              <strong>Аялагчийн нэр</strong>
              <p>{booking.travelerName}</p>
            </div>
            <div>
              <strong>И-мэйл</strong>
              <p>{booking.email}</p>
            </div>
            <div>
              <strong>Утас</strong>
              <p>{booking.phone}</p>
            </div>
            <div>
              <strong>Төлөв</strong>
              <p>{formatBookingStatus(booking.bookingStatus)}</p>
            </div>
          </div>

          {booking.note ? (
            <article className="card slimCard">
              <div className="content stackSm">
                <strong>Таны тэмдэглэл</strong>
                <p>{booking.note}</p>
              </div>
            </article>
          ) : null}

          {booking.adminNote ? (
            <article className="card slimCard softAccentCard">
              <div className="content stackSm">
                <strong>Операторын тэмдэглэл</strong>
                <p>{booking.adminNote}</p>
              </div>
            </article>
          ) : null}

          <div className="rowActions wrapActions">
            <Link className="btn secondary" href="/account/bookings">Бүх захиалгууд</Link>
            <Link className="btn secondary" href={`/tours/${booking.tourSlug}`}>Аялал харах</Link>
            {booking.amount > 0 && booking.paymentStatus !== "paid" ? (
              <button className="btn primary" type="button" onClick={() => void createPayment()}>
                Төлбөр үүсгэх
              </button>
            ) : null}
          </div>
        </article>

        <article className="panel stackMd">
          <div className="sectionHeading compact">
            <div>
              <h2>Аяллын маршрут</h2>
              <p className="meta">{tour ? describeDuration(tour.durationDays, tour.durationNights) : "Маршрут ачаалж байна"}</p>
            </div>
          </div>

          {tour ? (
            <>
              <img className="bookingDetailImage" src={tour.coverImage} alt={tour.title} />
              <p>{tour.summary}</p>
              <div className="stackSm">
                {tour.itinerary.map((item) => (
                  <article key={item} className="card slimCard">
                    <div className="content">{item}</div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <p className="meta">Энэ аяллын public маршрут одоогоор ачаалагдсангүй.</p>
          )}
        </article>
      </div>

      <article className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>Аялагчдын хүснэгт</h2>
            <p className="meta">Аюулгүй байдал болон зохион байгуулалтад ашиглах нэмэлт мэдээлэл.</p>
          </div>
        </div>
        <TravelerDetailsTable travelers={booking.travelerDetails} />
      </article>

      <article className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>Холбогдсон төлбөрүүд</h2>
            <p className="meta">Booking reference-ээр холбоотой бүх төлбөрийн бичлэг.</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="meta">Одоогоор төлбөрийн бичлэг үүсээгүй байна.</p>
        ) : (
          <div className="stackSm">
            {payments.map((payment) => (
              <article key={payment.paymentReference} className="card slimCard paymentRecordCard">
                <div className="content stackSm">
                  <div className="rowActions spread wrapActions">
                    <div>
                      <strong>{payment.paymentReference}</strong>
                      <p className="meta">{payment.method} • {formatDate(payment.createdAt)}</p>
                    </div>
                    <span className={`statusPill status-${payment.status}`}>{formatPaymentStatus(payment.status)}</span>
                  </div>
                  <div className="detailMetaGrid compactMetaGrid">
                    <div>
                      <strong>Дүн</strong>
                      <p>{formatCurrency(payment.amount, payment.currency)}</p>
                    </div>
                    <div>
                      <strong>Төлсөн огноо</strong>
                      <p>{formatDate(payment.paidAt) || "Хүлээгдэж буй"}</p>
                    </div>
                    <div>
                      <strong>Provider ref</strong>
                      <p>{payment.providerReference || "-"}</p>
                    </div>
                  </div>
                  {payment.status === "pending" ? (
                    <div className="rowActions wrapActions">
                      <button className="btn primary" type="button" onClick={() => void simulate(payment.paymentReference, "success")}>Амжилттай болгох</button>
                      <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "failed")}>Амжилтгүй</button>
                      <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "cancelled")}>Цуцлах</button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}