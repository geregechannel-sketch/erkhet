"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatBookingStatus, formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Booking, Payment } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Миний хэсэг",
    title: "Миний захиалгууд",
    createdMessage: (reference: string) => `${reference} дугаартай захиалга үүслээ.`,
    paymentCreated: (reference: string) => `Төлбөрийн хүсэлт ${reference} амжилттай үүслээ.`,
    paymentFailed: "Төлбөр үүсгэхэд алдаа гарлаа.",
    emptyTitle: "Одоогоор захиалгын бүртгэл алга.",
    emptyBody: "Хуваарьт аялал сонгох эсвэл захиалгат хүсэлт илгээх боломжтой.",
    browseTours: "Аяллууд үзэх",
    planTrip: "Аялал төлөвлөх",
    departure: "Гарах өдөр",
    participants: "Оролцогч",
    amount: "Дүн",
    open: "Нээх",
    openTour: "Аялал харах",
    createPayment: "Төлбөр үүсгэх",
    arrangeLater: "Тохиролцоно",
    peopleSuffix: "хүн",
    priceOnRequest: "Үнэ хүсэлтээр",
  },
  en: {
    eyebrow: "My account",
    title: "My bookings",
    createdMessage: (reference: string) => `Booking ${reference} was created successfully.`,
    paymentCreated: (reference: string) => `Payment request ${reference} was created successfully.`,
    paymentFailed: "Failed to create payment.",
    emptyTitle: "No bookings yet.",
    emptyBody: "Choose a scheduled tour or send a custom travel request.",
    browseTours: "Browse tours",
    planTrip: "Plan a trip",
    departure: "Departure",
    participants: "Participants",
    amount: "Amount",
    open: "Open",
    openTour: "View tour",
    createPayment: "Create payment",
    arrangeLater: "To be arranged",
    peopleSuffix: "people",
    priceOnRequest: "Price on request",
  },
  ru: {
    eyebrow: "Мой кабинет",
    title: "Мои бронирования",
    createdMessage: (reference: string) => `Бронирование ${reference} успешно создано.`,
    paymentCreated: (reference: string) => `Платёжный запрос ${reference} успешно создан.`,
    paymentFailed: "Не удалось создать платёж.",
    emptyTitle: "Пока нет бронирований.",
    emptyBody: "Выберите тур по расписанию или отправьте индивидуальный запрос.",
    browseTours: "Смотреть туры",
    planTrip: "Планировать поездку",
    departure: "Дата выезда",
    participants: "Участники",
    amount: "Сумма",
    open: "Открыть",
    openTour: "Открыть тур",
    createPayment: "Создать платёж",
    arrangeLater: "Согласуем позже",
    peopleSuffix: "чел.",
    priceOnRequest: "Цена по запросу",
  },
  zh: {
    eyebrow: "我的账户",
    title: "我的预订",
    createdMessage: (reference: string) => `预订 ${reference} 已成功创建。`,
    paymentCreated: (reference: string) => `支付申请 ${reference} 已成功创建。`,
    paymentFailed: "创建支付失败。",
    emptyTitle: "目前还没有预订记录。",
    emptyBody: "您可以选择固定线路，或提交定制出行需求。",
    browseTours: "查看线路",
    planTrip: "规划行程",
    departure: "出发日期",
    participants: "人数",
    amount: "金额",
    open: "打开",
    openTour: "查看线路",
    createPayment: "创建支付",
    arrangeLater: "待确认",
    peopleSuffix: "人",
    priceOnRequest: "价格面议",
  },
} as const;

type MessageTone = "success" | "error";

export default function BookingsPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadBookings = async () => {
    if (!token) {
      return;
    }
    const next = await browserApiFetch<Booking[]>("/me/bookings", {
      headers: authHeaders(token),
    });
    setBookings(next);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const created = params.get("created");
    if (created) {
      setMessageTone("success");
      setMessage(copy.createdMessage(created));
    }
  }, [copy]);

  useEffect(() => {
    void loadBookings();
  }, [token]);

  const createPayment = async (bookingReference: string) => {
    if (!token) return;
    try {
      const response = await browserApiFetch<{ payment: Payment }>("/payments", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ bookingReference, method: "QPay (MN)" }),
      });
      setMessageTone("success");
      setMessage(copy.paymentCreated(response.payment.paymentReference));
      await loadBookings();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.paymentFailed);
    }
  };

  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
      </div>

      {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}

      <div className="stackMd">
        {bookings.length === 0 ? (
          <article className="panel emptyState stackSm">
            <h3>{copy.emptyTitle}</h3>
            <p>{copy.emptyBody}</p>
            <div className="rowActions">
              <Link className="btn primary" href="/tours">{copy.browseTours}</Link>
              <Link className="btn secondary" href="/enquire/step/1">{copy.planTrip}</Link>
            </div>
          </article>
        ) : bookings.map((booking) => (
          <article key={booking.bookingReference} className="panel stackSm bookingListCard">
            <div className="sectionHeading compact">
              <div>
                <h2>{booking.tourTitle}</h2>
                <p className="meta">{booking.bookingReference} • {formatDate(booking.createdAt, locale)}</p>
              </div>
              <div className="stackXs alignEnd">
                <strong>{formatBookingStatus(booking.bookingStatus, locale)}</strong>
                <span className="meta">{formatPaymentStatus(booking.paymentStatus, locale)}</span>
              </div>
            </div>

            <div className="detailMetaGrid">
              <div>
                <strong>{copy.departure}</strong>
                <p>{formatDate(booking.preferredDepartureDate, locale) || copy.arrangeLater}</p>
              </div>
              <div>
                <strong>{copy.participants}</strong>
                <p>{booking.participantCount} {copy.peopleSuffix}</p>
              </div>
              <div>
                <strong>{copy.amount}</strong>
                <p>{booking.amount > 0 ? formatCurrency(booking.amount, booking.currency, locale) : copy.priceOnRequest}</p>
              </div>
            </div>

            <div className="cardActions wrapActions">
              <Link className="btn secondary" href={`/account/bookings/${booking.bookingReference}`}>{copy.open}</Link>
              <Link className="btn secondary" href={`/tours/${booking.tourSlug}`}>{copy.openTour}</Link>
              {booking.amount > 0 && booking.paymentStatus !== "paid" ? (
                <button className="btn primary" type="button" onClick={() => void createPayment(booking.bookingReference)}>
                  {copy.createPayment}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
