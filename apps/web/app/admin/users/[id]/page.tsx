"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatPaymentStatus, formatUserRole, formatUserStatus } from "@/lib/format";
import { supportStatusLabels } from "@/lib/support-copy";
import type { UserDetail } from "@/lib/types";

const copyByLocale = {
  mn: {
    loading: "Ачааллаж байна...",
    email: "Email",
    phone: "Утас",
    role: "Эрх",
    status: "Төлөв",
    createdAt: "Үүссэн огноо",
    savedTours: "Хадгалсан аяллууд",
    noSavedTours: "Хадгалсан аялал алга.",
    bookings: "Захиалгууд",
    noBookings: "Захиалга алга.",
    payments: "Төлбөрүүд",
    noPayments: "Төлбөр алга.",
    support: "Support түүх",
    noSupport: "Support бүртгэл алга.",
  },
  en: {
    loading: "Loading...",
    email: "Email",
    phone: "Phone",
    role: "Role",
    status: "Status",
    createdAt: "Created",
    savedTours: "Saved tours",
    noSavedTours: "No saved tours.",
    bookings: "Bookings",
    noBookings: "No bookings.",
    payments: "Payments",
    noPayments: "No payments.",
    support: "Support history",
    noSupport: "No support records.",
  },
  ru: {
    loading: "Загрузка...",
    email: "Email",
    phone: "Телефон",
    role: "Роль",
    status: "Статус",
    createdAt: "Создано",
    savedTours: "Сохранённые туры",
    noSavedTours: "Нет сохранённых туров.",
    bookings: "Бронирования",
    noBookings: "Нет бронирований.",
    payments: "Платежи",
    noPayments: "Нет платежей.",
    support: "История поддержки",
    noSupport: "Нет записей поддержки.",
  },
  zh: {
    loading: "加载中...",
    email: "邮箱",
    phone: "电话",
    role: "角色",
    status: "状态",
    createdAt: "创建时间",
    savedTours: "收藏线路",
    noSavedTours: "暂无收藏线路。",
    bookings: "预订",
    noBookings: "暂无预订。",
    payments: "支付",
    noPayments: "暂无支付。",
    support: "支持记录",
    noSupport: "暂无支持记录。",
  },
} as const;

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const supportStatuses = supportStatusLabels[locale];
  const [detail, setDetail] = useState<UserDetail | null>(null);

  useEffect(() => {
    if (!token || !params.id) return;
    void browserApiFetch<UserDetail>(`/admin/users/${params.id}`, {
      headers: authHeaders(token),
    }).then(setDetail);
  }, [params.id, token]);

  if (!detail) {
    return <div className="panel loadingPanel">{copy.loading}</div>;
  }

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{detail.user.fullName}</h1></div>
      <section className="panel stackMd">
        <p><strong>{copy.email}:</strong> {detail.user.email}</p>
        <p><strong>{copy.phone}:</strong> {detail.user.phone || "-"}</p>
        <p><strong>{copy.role}:</strong> {formatUserRole(detail.user.role, locale)}</p>
        <p><strong>{copy.status}:</strong> {formatUserStatus(detail.user.status, locale)}</p>
        <p><strong>{copy.createdAt}:</strong> {formatDate(detail.user.createdAt, locale)}</p>
      </section>
      <section className="panel stackSm">
        <h2>{copy.savedTours}</h2>
        {detail.favorites.length === 0 ? <p className="meta">{copy.noSavedTours}</p> : detail.favorites.map((tour) => <p key={tour.slug}>{tour.title}</p>)}
      </section>
      <section className="panel stackSm">
        <h2>{copy.bookings}</h2>
        {detail.bookings.length === 0 ? <p className="meta">{copy.noBookings}</p> : detail.bookings.map((booking) => <p key={booking.bookingReference}>{booking.bookingReference} • {booking.tourTitle} • {formatCurrency(booking.amount, booking.currency, locale)}</p>)}
      </section>
      <section className="panel stackSm">
        <h2>{copy.payments}</h2>
        {detail.payments.length === 0 ? <p className="meta">{copy.noPayments}</p> : detail.payments.map((payment) => <p key={payment.paymentReference}>{payment.paymentReference} • {formatPaymentStatus(payment.status, locale)} • {formatCurrency(payment.amount, payment.currency, locale)}</p>)}
      </section>
      <section className="panel stackSm">
        <h2>{copy.support}</h2>
        {detail.support.length === 0 ? <p className="meta">{copy.noSupport}</p> : detail.support.map((request) => <p key={request.supportReference}>{request.supportReference} • {request.subject} • {supportStatuses[request.status]}</p>)}
      </section>
    </div>
  );
}
