"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatBookingStatus, formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Booking } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Админ",
    title: "Захиалгууд",
    empty: "Одоогоор захиалгын бичлэг алга.",
    departure: "Гарах өдөр",
    arrangeLater: "Тохиролцоно",
    open: "Нээх",
  },
  en: {
    eyebrow: "Admin",
    title: "Bookings",
    empty: "No booking records yet.",
    departure: "Departure",
    arrangeLater: "To be arranged",
    open: "Open",
  },
  ru: {
    eyebrow: "Админ",
    title: "Бронирования",
    empty: "Пока нет записей о бронировании.",
    departure: "Дата выезда",
    arrangeLater: "Согласуем позже",
    open: "Открыть",
  },
  zh: {
    eyebrow: "管理",
    title: "预订列表",
    empty: "目前还没有预订记录。",
    departure: "出发日期",
    arrangeLater: "待确认",
    open: "打开",
  },
} as const;

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<Booking[]>("/admin/bookings", {
      headers: authHeaders(token),
    }).then(setBookings);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
      </div>

      <section className="panel stackMd">
        {bookings.length === 0 ? <p className="meta">{copy.empty}</p> : null}
        {bookings.map((booking) => (
          <article key={booking.bookingReference} className="listRow alignStart">
            <div className="stackXs">
              <Link href={`/admin/bookings/${booking.bookingReference}`}><strong>{booking.bookingReference}</strong></Link>
              <p className="meta">{booking.userName} • {booking.tourTitle}</p>
              <p className="meta">{copy.departure}: {formatDate(booking.preferredDepartureDate, locale) || copy.arrangeLater}</p>
            </div>
            <div className="stackXs alignEnd">
              <strong>{formatBookingStatus(booking.bookingStatus, locale)}</strong>
              <span className="meta">{formatPaymentStatus(booking.paymentStatus, locale)}</span>
              <span className="meta">{formatCurrency(booking.amount, booking.currency, locale)} • {formatDate(booking.createdAt, locale)}</span>
              <Link className="btn secondary btnSmall" href={`/admin/bookings/${booking.bookingReference}`}>{copy.open}</Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
