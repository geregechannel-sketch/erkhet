"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import type { Booking, Payment, Tour } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Захиалгын дэлгэрэнгүй",
    loading: "Захиалгын мэдээлэл ачааллаж байна...",
    notFound: "Захиалга олдсонгүй",
    backToBookings: "Захиалгууд руу буцах",
    paymentCreated: (reference: string) => `Төлбөрийн хүсэлт ${reference} үүслээ.`,
    paymentFailed: "Төлбөр үүсгэхэд алдаа гарлаа.",
    paymentUpdated: "Төлбөрийн төлөв шинэчлэгдлээ.",
    paymentUpdateFailed: "Төлбөр шинэчлэхэд алдаа гарлаа.",
    arrangeLater: "Тохиролцоно",
    priceOnRequest: "Үнэ хүсэлтээр",
    totalAmount: "Нийт дүн",
    paidAmount: "Төлөгдсөн дүн",
    departure: "Гарах өдөр",
    participants: "Оролцогчийн тоо",
    overviewTitle: "Аяллын нэгдсэн төлөвлөгөө",
    overviewBody: "Захиалга, маршрут, холбоо барих мэдээлэл нэг дор.",
    travelerName: "Аялагчийн нэр",
    email: "И-мэйл",
    phone: "Утас",
    status: "Төлөв",
    note: "Таны тэмдэглэл",
    adminNote: "Операторын тэмдэглэл",
    allBookings: "Бүх захиалгууд",
    openTour: "Аялал харах",
    createPayment: "Төлбөр үүсгэх",
    itineraryTitle: "Аяллын маршрут",
    itineraryLoading: "Маршрут ачаалж байна",
    noPublicTour: "Энэ аяллын public маршрут одоогоор ачаалагдаагүй байна.",
    travelersTitle: "Аялагчдын хүснэгт",
    travelersBody: "Аюулгүй байдал болон зохион байгуулалтад ашиглах нэмэлт мэдээлэл.",
    paymentsTitle: "Холбогдсон төлбөрүүд",
    paymentsBody: "Захиалгын дугаартай холбоотой бүх төлбөрийн бичлэг.",
    noPayments: "Одоогоор төлбөрийн бичлэг үүсээгүй байна.",
    amount: "Дүн",
    paidAt: "Төлсөн огноо",
    providerRef: "Provider ref",
    pending: "Хүлээгдэж буй",
    markPaid: "Амжилттай болгох",
    markFailed: "Амжилтгүй",
    markCancelled: "Цуцлах",
  },
  en: {
    eyebrow: "Booking detail",
    loading: "Loading booking details...",
    notFound: "Booking not found",
    backToBookings: "Back to bookings",
    paymentCreated: (reference: string) => `Payment request ${reference} was created.`,
    paymentFailed: "Failed to create payment.",
    paymentUpdated: "Payment status updated.",
    paymentUpdateFailed: "Failed to update payment.",
    arrangeLater: "To be arranged",
    priceOnRequest: "Price on request",
    totalAmount: "Total amount",
    paidAmount: "Paid amount",
    departure: "Departure",
    participants: "Participants",
    overviewTitle: "Trip summary",
    overviewBody: "Booking, route, and contact details in one place.",
    travelerName: "Traveler name",
    email: "Email",
    phone: "Phone",
    status: "Status",
    note: "Your note",
    adminNote: "Operator note",
    allBookings: "All bookings",
    openTour: "View tour",
    createPayment: "Create payment",
    itineraryTitle: "Itinerary",
    itineraryLoading: "Loading itinerary",
    noPublicTour: "The public itinerary for this tour is not available right now.",
    travelersTitle: "Traveler list",
    travelersBody: "Additional details used for operations and safety planning.",
    paymentsTitle: "Linked payments",
    paymentsBody: "All payment records linked to this booking reference.",
    noPayments: "No payment records yet.",
    amount: "Amount",
    paidAt: "Paid at",
    providerRef: "Provider ref",
    pending: "Pending",
    markPaid: "Mark successful",
    markFailed: "Mark failed",
    markCancelled: "Cancel",
  },
  ru: {
    eyebrow: "Детали бронирования",
    loading: "Загружаем детали бронирования...",
    notFound: "Бронирование не найдено",
    backToBookings: "Назад к бронированиям",
    paymentCreated: (reference: string) => `Платёжный запрос ${reference} создан.`,
    paymentFailed: "Не удалось создать платёж.",
    paymentUpdated: "Статус платежа обновлён.",
    paymentUpdateFailed: "Не удалось обновить платёж.",
    arrangeLater: "Согласуем позже",
    priceOnRequest: "Цена по запросу",
    totalAmount: "Общая сумма",
    paidAmount: "Оплачено",
    departure: "Дата выезда",
    participants: "Количество участников",
    overviewTitle: "Сводка поездки",
    overviewBody: "Бронирование, маршрут и контакты в одном месте.",
    travelerName: "Имя путешественника",
    email: "Email",
    phone: "Телефон",
    status: "Статус",
    note: "Ваше примечание",
    adminNote: "Примечание оператора",
    allBookings: "Все бронирования",
    openTour: "Открыть тур",
    createPayment: "Создать платёж",
    itineraryTitle: "Маршрут",
    itineraryLoading: "Маршрут загружается",
    noPublicTour: "Публичный маршрут для этого тура пока недоступен.",
    travelersTitle: "Список путешественников",
    travelersBody: "Дополнительные данные для организации поездки и безопасности.",
    paymentsTitle: "Связанные платежи",
    paymentsBody: "Все платежи, связанные с этим номером бронирования.",
    noPayments: "Платежей пока нет.",
    amount: "Сумма",
    paidAt: "Дата оплаты",
    providerRef: "Ссылка провайдера",
    pending: "Ожидается",
    markPaid: "Отметить успешным",
    markFailed: "Отметить неуспешным",
    markCancelled: "Отменить",
  },
  zh: {
    eyebrow: "预订详情",
    loading: "正在加载预订详情...",
    notFound: "未找到该预订",
    backToBookings: "返回预订列表",
    paymentCreated: (reference: string) => `支付申请 ${reference} 已创建。`,
    paymentFailed: "创建支付失败。",
    paymentUpdated: "支付状态已更新。",
    paymentUpdateFailed: "更新支付失败。",
    arrangeLater: "待确认",
    priceOnRequest: "价格面议",
    totalAmount: "总金额",
    paidAmount: "已支付金额",
    departure: "出发日期",
    participants: "人数",
    overviewTitle: "行程总览",
    overviewBody: "预订、路线和联系信息集中查看。",
    travelerName: "旅客姓名",
    email: "邮箱",
    phone: "电话",
    status: "状态",
    note: "您的备注",
    adminNote: "客服备注",
    allBookings: "全部预订",
    openTour: "查看线路",
    createPayment: "创建支付",
    itineraryTitle: "行程安排",
    itineraryLoading: "行程加载中",
    noPublicTour: "该线路的公开行程暂时不可用。",
    travelersTitle: "旅客名单",
    travelersBody: "用于行程执行和安全安排的附加信息。",
    paymentsTitle: "关联支付",
    paymentsBody: "与该预订编号关联的所有支付记录。",
    noPayments: "目前还没有支付记录。",
    amount: "金额",
    paidAt: "支付日期",
    providerRef: "渠道参考号",
    pending: "处理中",
    markPaid: "标记成功",
    markFailed: "标记失败",
    markCancelled: "取消",
  },
} as const;

type MessageTone = "success" | "error";

export default function BookingDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

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
          headers: authHeaders(token),
        }),
        browserApiFetch<Payment[]>("/me/payments", {
          headers: authHeaders(token),
        }),
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
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.notFound);
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
        body: JSON.stringify({ bookingReference: booking.bookingReference, method: "QPay (MN)" }),
      });
      setMessageTone("success");
      setMessage(copy.paymentCreated(response.payment.paymentReference));
      await loadData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.paymentFailed);
    }
  };

  const simulate = async (paymentReference: string, outcome: "success" | "failed" | "cancelled") => {
    if (!token) return;
    try {
      await browserApiFetch<Payment>(`/payments/${paymentReference}/simulate`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ outcome }),
      });
      setMessageTone("success");
      setMessage(copy.paymentUpdated);
      await loadData();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.paymentUpdateFailed);
    }
  };

  if (loading) {
    return <div className="panel loadingPanel">{copy.loading}</div>;
  }

  if (!booking) {
    return (
      <section className="stackLg">
        <div className="sectionHeading compact"><h1>{copy.notFound}</h1></div>
        {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
        <Link className="btn secondary" href="/account/bookings">{copy.backToBookings}</Link>
      </section>
    );
  }

  return (
    <section className="stackLg bookingDetailPage">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{booking.tourTitle}</h1>
          <p className="meta">{booking.bookingReference} • {formatDate(booking.createdAt, locale)}</p>
        </div>
        <div className="stackXs alignEnd">
          <span className={`statusPill status-${booking.bookingStatus}`}>{formatBookingStatus(booking.bookingStatus, locale)}</span>
          <span className={`statusPill status-${booking.paymentStatus}`}>{formatPaymentStatus(booking.paymentStatus, locale)}</span>
        </div>
      </div>

      {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}

      <div className="bookingDetailSummary">
        <article className="summaryTile">
          <strong>{formatDate(booking.preferredDepartureDate, locale) || copy.arrangeLater}</strong>
          <span>{copy.departure}</span>
        </article>
        <article className="summaryTile">
          <strong>{booking.participantCount}</strong>
          <span>{copy.participants}</span>
        </article>
        <article className="summaryTile">
          <strong>{booking.amount > 0 ? formatCurrency(booking.amount, booking.currency, locale) : copy.priceOnRequest}</strong>
          <span>{copy.totalAmount}</span>
        </article>
        <article className="summaryTile">
          <strong>{paymentSummary > 0 ? formatCurrency(paymentSummary, booking.currency, locale) : "0"}</strong>
          <span>{copy.paidAmount}</span>
        </article>
      </div>

      <div className="grid c2 bookingDetailGrid">
        <article className="panel stackMd">
          <div className="sectionHeading compact">
            <div>
              <h2>{copy.overviewTitle}</h2>
              <p className="meta">{copy.overviewBody}</p>
            </div>
          </div>

          <div className="detailMetaGrid">
            <div>
              <strong>{copy.travelerName}</strong>
              <p>{booking.travelerName}</p>
            </div>
            <div>
              <strong>{copy.email}</strong>
              <p>{booking.email}</p>
            </div>
            <div>
              <strong>{copy.phone}</strong>
              <p>{booking.phone}</p>
            </div>
            <div>
              <strong>{copy.status}</strong>
              <p>{formatBookingStatus(booking.bookingStatus, locale)}</p>
            </div>
          </div>

          {booking.note ? (
            <article className="card slimCard">
              <div className="content stackSm">
                <strong>{copy.note}</strong>
                <p>{booking.note}</p>
              </div>
            </article>
          ) : null}

          {booking.adminNote ? (
            <article className="card slimCard softAccentCard">
              <div className="content stackSm">
                <strong>{copy.adminNote}</strong>
                <p>{booking.adminNote}</p>
              </div>
            </article>
          ) : null}

          <div className="rowActions wrapActions">
            <Link className="btn secondary" href="/account/bookings">{copy.allBookings}</Link>
            <Link className="btn secondary" href={`/tours/${booking.tourSlug}`}>{copy.openTour}</Link>
            {booking.amount > 0 && booking.paymentStatus !== "paid" ? (
              <button className="btn primary" type="button" onClick={() => void createPayment()}>
                {copy.createPayment}
              </button>
            ) : null}
          </div>
        </article>

        <article className="panel stackMd">
          <div className="sectionHeading compact">
            <div>
              <h2>{copy.itineraryTitle}</h2>
              <p className="meta">{tour ? describeDuration(tour.durationDays, tour.durationNights, locale) : copy.itineraryLoading}</p>
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
            <p className="meta">{copy.noPublicTour}</p>
          )}
        </article>
      </div>

      <article className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>{copy.travelersTitle}</h2>
            <p className="meta">{copy.travelersBody}</p>
          </div>
        </div>
        <TravelerDetailsTable travelers={booking.travelerDetails} locale={locale} />
      </article>

      <article className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>{copy.paymentsTitle}</h2>
            <p className="meta">{copy.paymentsBody}</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="meta">{copy.noPayments}</p>
        ) : (
          <div className="stackSm">
            {payments.map((payment) => (
              <article key={payment.paymentReference} className="card slimCard paymentRecordCard">
                <div className="content stackSm">
                  <div className="rowActions spread wrapActions">
                    <div>
                      <strong>{payment.paymentReference}</strong>
                      <p className="meta">{payment.method} • {formatDate(payment.createdAt, locale)}</p>
                    </div>
                    <span className={`statusPill status-${payment.status}`}>{formatPaymentStatus(payment.status, locale)}</span>
                  </div>
                  <div className="detailMetaGrid compactMetaGrid">
                    <div>
                      <strong>{copy.amount}</strong>
                      <p>{formatCurrency(payment.amount, payment.currency, locale)}</p>
                    </div>
                    <div>
                      <strong>{copy.paidAt}</strong>
                      <p>{formatDate(payment.paidAt, locale) || copy.pending}</p>
                    </div>
                    <div>
                      <strong>{copy.providerRef}</strong>
                      <p>{payment.providerReference || "-"}</p>
                    </div>
                  </div>
                  {payment.status === "pending" ? (
                    <div className="rowActions wrapActions">
                      <button className="btn primary" type="button" onClick={() => void simulate(payment.paymentReference, "success")}>{copy.markPaid}</button>
                      <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "failed")}>{copy.markFailed}</button>
                      <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "cancelled")}>{copy.markCancelled}</button>
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
