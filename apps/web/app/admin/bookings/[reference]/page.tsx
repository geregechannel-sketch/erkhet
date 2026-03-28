"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TravelerDetailsTable } from "@/components/bookings/TravelerDetailsTable";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import {
  describeDuration,
  formatBookingStatus,
  formatCurrency,
  formatDate,
  formatPaymentStatus,
} from "@/lib/format";
import type { Booking, Tour } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Админ захиалга",
    loading: "Захиалгын мэдээлэл ачааллаж байна...",
    updated: "Захиалгын төлөв шинэчлэгдлээ.",
    updateFailed: "Захиалга шинэчлэхэд алдаа гарлаа.",
    user: "Хэрэглэгч",
    traveler: "Аялагч",
    phone: "Утас",
    email: "И-мэйл",
    departure: "Гарах өдөр",
    participants: "Оролцогч",
    amount: "Дүн",
    createdAt: "Үүссэн огноо",
    note: "Хэрэглэгчийн тэмдэглэл",
    itineraryTitle: "Аяллын маршрут",
    noPublicTour: "Public маршрут байхгүй",
    noPublicTourBody: "Энэ аяллын public дэлгэрэнгүй ачаалагдсангүй.",
    travelersTitle: "Аялагчдын хүснэгт",
    travelersBody: "Аюулгүй байдал болон үйлчилгээний зохион байгуулалтад ашиглах мэдээлэл.",
    workflowTitle: "Захиалгын workflow",
    adminNote: "Дотоод тэмдэглэл",
    save: "Шинэчлэх",
    back: "Жагсаалт руу буцах",
  },
  en: {
    eyebrow: "Admin booking",
    loading: "Loading booking details...",
    updated: "Booking status updated.",
    updateFailed: "Failed to update booking.",
    user: "User",
    traveler: "Traveler",
    phone: "Phone",
    email: "Email",
    departure: "Departure",
    participants: "Participants",
    amount: "Amount",
    createdAt: "Created",
    note: "Customer note",
    itineraryTitle: "Itinerary",
    noPublicTour: "No public itinerary",
    noPublicTourBody: "The public tour details are not available yet.",
    travelersTitle: "Traveler list",
    travelersBody: "Details used for operations and safety planning.",
    workflowTitle: "Booking workflow",
    adminNote: "Internal note",
    save: "Save",
    back: "Back to list",
  },
  ru: {
    eyebrow: "Бронирование в админке",
    loading: "Загружаем детали бронирования...",
    updated: "Статус бронирования обновлён.",
    updateFailed: "Не удалось обновить бронирование.",
    user: "Пользователь",
    traveler: "Путешественник",
    phone: "Телефон",
    email: "Email",
    departure: "Дата выезда",
    participants: "Участники",
    amount: "Сумма",
    createdAt: "Создано",
    note: "Примечание клиента",
    itineraryTitle: "Маршрут",
    noPublicTour: "Нет публичного маршрута",
    noPublicTourBody: "Публичные детали тура пока недоступны.",
    travelersTitle: "Список путешественников",
    travelersBody: "Данные для организации обслуживания и безопасности.",
    workflowTitle: "Процесс бронирования",
    adminNote: "Внутреннее примечание",
    save: "Сохранить",
    back: "Назад к списку",
  },
  zh: {
    eyebrow: "管理端预订",
    loading: "正在加载预订详情...",
    updated: "预订状态已更新。",
    updateFailed: "更新预订失败。",
    user: "用户",
    traveler: "旅客",
    phone: "电话",
    email: "邮箱",
    departure: "出发日期",
    participants: "人数",
    amount: "金额",
    createdAt: "创建时间",
    note: "客户备注",
    itineraryTitle: "行程安排",
    noPublicTour: "暂无公开行程",
    noPublicTourBody: "该线路的公开详情暂未加载。",
    travelersTitle: "旅客名单",
    travelersBody: "用于执行与安全安排的附加资料。",
    workflowTitle: "预订流程",
    adminNote: "内部备注",
    save: "保存",
    back: "返回列表",
  },
} as const;

type MessageTone = "success" | "error";

export default function AdminBookingDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadBooking = async () => {
    if (!token || !params.reference) return;
    const next = await browserApiFetch<Booking>(`/admin/bookings/${params.reference}`, {
      headers: authHeaders(token),
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
          adminNote: formData.get("adminNote"),
        }),
      });
      setMessageTone("success");
      setMessage(copy.updated);
      await loadBooking();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
    }
  };

  if (!booking) {
    return <div className="panel loadingPanel">{copy.loading}</div>;
  }

  return (
    <div className="stackLg bookingDetailPage">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{booking.bookingReference}</h1>
          <p className="meta">{booking.tourTitle} • {booking.userName}</p>
        </div>
        <div className="stackXs alignEnd">
          <span className={`statusPill status-${booking.bookingStatus}`}>{formatBookingStatus(booking.bookingStatus, locale)}</span>
          <span className={`statusPill status-${booking.paymentStatus}`}>{formatPaymentStatus(booking.paymentStatus, locale)}</span>
        </div>
      </div>

      <section className="panel stackMd">
        <div className="detailMetaGrid">
          <div><strong>{copy.user}</strong><p>{booking.userName} ({booking.userEmail})</p></div>
          <div><strong>{copy.traveler}</strong><p>{booking.travelerName}</p></div>
          <div><strong>{copy.phone}</strong><p>{booking.phone}</p></div>
          <div><strong>{copy.email}</strong><p>{booking.email}</p></div>
          <div><strong>{copy.departure}</strong><p>{formatDate(booking.preferredDepartureDate, locale) || "-"}</p></div>
          <div><strong>{copy.participants}</strong><p>{booking.participantCount}</p></div>
          <div><strong>{copy.amount}</strong><p>{formatCurrency(booking.amount, booking.currency, locale)}</p></div>
          <div><strong>{copy.createdAt}</strong><p>{formatDate(booking.createdAt, locale)}</p></div>
        </div>
        {booking.note ? <p><strong>{copy.note}:</strong> {booking.note}</p> : null}
      </section>

      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>{copy.itineraryTitle}</h2>
            <p className="meta">{tour ? describeDuration(tour.durationDays, tour.durationNights, locale) : copy.noPublicTour}</p>
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
          <p className="meta">{copy.noPublicTourBody}</p>
        )}
      </section>

      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>{copy.travelersTitle}</h2>
            <p className="meta">{copy.travelersBody}</p>
          </div>
        </div>
        <TravelerDetailsTable travelers={booking.travelerDetails} locale={locale} />
      </section>

      <section className="panel stackMd">
        <h2>{copy.workflowTitle}</h2>
        <form className="stackMd" onSubmit={onSubmit}>
          <select name="bookingStatus" defaultValue={booking.bookingStatus}>
            <option value="pending">{formatBookingStatus("pending", locale)}</option>
            <option value="confirmed">{formatBookingStatus("confirmed", locale)}</option>
            <option value="cancelled">{formatBookingStatus("cancelled", locale)}</option>
            <option value="completed">{formatBookingStatus("completed", locale)}</option>
          </select>
          <textarea name="adminNote" rows={5} defaultValue={booking.adminNote || ""} placeholder={copy.adminNote} />
          <div className="rowActions wrapActions">
            <button className="btn primary" type="submit">{copy.save}</button>
            <Link className="btn secondary" href="/admin/bookings">{copy.back}</Link>
          </div>
        </form>
        {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
      </section>
    </div>
  );
}
