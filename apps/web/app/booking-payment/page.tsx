"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking, Payment } from "@/lib/types";

function formatAmount(value: number, currency: string, priceOnRequest: string, locale: "mn" | "en" | "ru" | "zh") {
  return value > 0 ? formatCurrency(value, currency, locale) : priceOnRequest;
}

const copyByLocale = {
  mn: {
    eyebrow: "Захиалга, төлбөр",
    title: "Захиалга / Төлбөр",
    guestBody: "Хийсэн захиалга, төлбөрийн мэдээллээ нэг дороос харахын тулд нэвтэрнэ үү.",
    userBody: "Захиалга, төлбөрийн мэдээллээ энэ хэсгээс хараарай.",
    login: "Нэвтрэх",
    register: "Бүртгүүлэх",
    infoEyebrow: "Мэдээлэл",
    processTitle: "Төлбөрийн мэдээлэл",
    processItems: [
      "Захиалга баталгаажсаны дараа төлбөрийн мэдээллийг танд хүргэнэ.",
      "Төлбөр хийгдсэний дараа мэдээлэл шинэчлэгдэнэ.",
    ],
    liveStatus: "Таны мэдээлэл",
    accountLinked: "Таны захиалга, төлбөрийн мэдээлэл энэ хэсэгт харагдана.",
    myBookings: "Миний захиалгууд",
    myPayments: "Төлбөрүүд",
    totalBookings: "Нийт захиалга",
    paymentRecords: "Төлбөрийн мэдээлэл",
    paid: "Төлөгдсөн",
    pending: "Хүлээгдэж буй",
    emptyTitle: "Одоогоор захиалга бүртгэгдээгүй байна.",
    browseTours: "Аяллууд үзэх",
    planTrip: "Аялал төлөвлөх",
    departure: "Гарах өдөр",
    participants: "Хүний тоо",
    amount: "Дүн",
    open: "Нээх",
    createPayment: "Төлбөр үүсгэх",
    linkedPayments: "Холбогдсон төлбөрүүд",
    noPayment: "Төлбөрийн мэдээлэл хараахан үүсээгүй байна.",
    markPaid: "Амжилттай болгох",
    markFailed: "Амжилтгүй",
    markCancelled: "Цуцлах",
    requestCreated: "Төлбөрийн хүсэлт үүслээ.",
    paymentUpdated: "Төлбөрийн төлөв шинэчлэгдлээ.",
    createFailed: "Төлбөрийн хүсэлт үүсгэхэд алдаа гарлаа.",
    updateFailed: "Төлбөр шинэчлэхэд алдаа гарлаа.",
    priceOnRequest: "Үнэ хүсэлтээр",
    bookingStatuses: {
      pending: "Хүлээгдэж буй",
      confirmed: "Баталгаажсан",
      cancelled: "Цуцлагдсан",
      completed: "Дууссан",
    },
    paymentStatuses: {
      unpaid: "Төлөөгүй",
      pending: "Хүлээгдэж буй",
      partially_paid: "Хэсэгчлэн төлсөн",
      paid: "Төлөгдсөн",
      failed: "Амжилтгүй",
      cancelled: "Цуцлагдсан",
      refunded: "Буцаасан",
      partially_refunded: "Хэсэгчлэн буцаасан",
    },
  },
  en: {
    eyebrow: "Booking and payment",
    title: "Booking / Payment",
    guestBody: "Sign in to view your bookings and payment information in one place.",
    userBody: "Check your bookings and payment information here.",
    login: "Sign in",
    register: "Register",
    infoEyebrow: "Info",
    processTitle: "Payment information",
    processItems: ["Payment details are shared after your booking is confirmed.", "Your information is updated after the payment is completed."],
    liveStatus: "Your details",
    accountLinked: "Your booking and payment information appears in this section.",
    myBookings: "My bookings",
    myPayments: "Payments",
    totalBookings: "Total bookings",
    paymentRecords: "Payments",
    paid: "Paid",
    pending: "Pending",
    emptyTitle: "No bookings yet.",
    browseTours: "Browse tours",
    planTrip: "Plan a trip",
    departure: "Departure",
    participants: "Participants",
    amount: "Amount",
    open: "Open",
    createPayment: "Create payment",
    linkedPayments: "Linked payments",
    noPayment: "No payment information yet.",
    markPaid: "Mark successful",
    markFailed: "Mark failed",
    markCancelled: "Cancel",
    requestCreated: "Payment request created.",
    paymentUpdated: "Payment status updated.",
    createFailed: "Failed to create payment request.",
    updateFailed: "Failed to update payment.",
    priceOnRequest: "Price on request",
    bookingStatuses: {
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
    },
    paymentStatuses: {
      unpaid: "Unpaid",
      pending: "Pending",
      partially_paid: "Partially paid",
      paid: "Paid",
      failed: "Failed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      partially_refunded: "Partially refunded",
    },
  },
  ru: {
    eyebrow: "Бронирование и оплата",
    title: "Бронирование / Оплата",
    guestBody: "Войдите, чтобы видеть бронирование и оплату в одном месте.",
    userBody: "Смотрите информацию о бронировании и оплате в этом разделе.",
    login: "Войти",
    register: "Регистрация",
    infoEyebrow: "Информация",
    processTitle: "Информация об оплате",
    processItems: ["После подтверждения бронирования мы отправим вам информацию об оплате.", "После оплаты информация в вашем кабинете обновится."],
    liveStatus: "Ваши данные",
    accountLinked: "В этом разделе отображаются ваши бронирования и платежи.",
    myBookings: "Мои бронирования",
    myPayments: "Платежи",
    totalBookings: "Всего бронирований",
    paymentRecords: "Платежи",
    paid: "Оплачено",
    pending: "Ожидание",
    emptyTitle: "Пока нет бронирований.",
    browseTours: "Смотреть туры",
    planTrip: "Планировать поездку",
    departure: "Дата выезда",
    participants: "Количество участников",
    amount: "Сумма",
    open: "Открыть",
    createPayment: "Создать платеж",
    linkedPayments: "Связанные платежи",
    noPayment: "Информация об оплате пока не создана.",
    markPaid: "Успешно",
    markFailed: "Неуспешно",
    markCancelled: "Отменить",
    requestCreated: "Платежный запрос создан.",
    paymentUpdated: "Статус платежа обновлен.",
    createFailed: "Не удалось создать платежный запрос.",
    updateFailed: "Не удалось обновить платеж.",
    priceOnRequest: "Цена по запросу",
    bookingStatuses: {
      pending: "Ожидается",
      confirmed: "Подтверждено",
      cancelled: "Отменено",
      completed: "Завершено",
    },
    paymentStatuses: {
      unpaid: "Не оплачено",
      pending: "Ожидается",
      partially_paid: "Частично оплачено",
      paid: "Оплачено",
      failed: "Неуспешно",
      cancelled: "Отменено",
      refunded: "Возвращено",
      partially_refunded: "Частичный возврат",
    },
  },
  zh: {
    eyebrow: "预订与支付",
    title: "预订 / 支付",
    guestBody: "登录后即可在一个地方查看预订和支付信息。",
    userBody: "您可以在这里查看预订和支付信息。",
    login: "登录",
    register: "注册",
    infoEyebrow: "信息",
    processTitle: "支付信息",
    processItems: ["预订确认后，我们会向您说明支付信息。", "支付完成后，信息会同步更新。"],
    liveStatus: "您的信息",
    accountLinked: "您的预订与支付信息会显示在这里。",
    myBookings: "我的预订",
    myPayments: "支付",
    totalBookings: "预订总数",
    paymentRecords: "支付信息",
    paid: "已支付",
    pending: "待处理",
    emptyTitle: "目前还没有预订记录。",
    browseTours: "查看线路",
    planTrip: "规划行程",
    departure: "出发日期",
    participants: "人数",
    amount: "金额",
    open: "打开",
    createPayment: "创建支付",
    linkedPayments: "关联支付",
    noPayment: "暂时还没有支付信息。",
    markPaid: "标记成功",
    markFailed: "标记失败",
    markCancelled: "取消",
    requestCreated: "支付请求已创建。",
    paymentUpdated: "支付状态已更新。",
    createFailed: "创建支付请求失败。",
    updateFailed: "更新支付失败。",
    priceOnRequest: "价格面议",
    bookingStatuses: {
      pending: "待确认",
      confirmed: "已确认",
      cancelled: "已取消",
      completed: "已完成",
    },
    paymentStatuses: {
      unpaid: "未支付",
      pending: "处理中",
      partially_paid: "部分支付",
      paid: "已支付",
      failed: "失败",
      cancelled: "已取消",
      refunded: "已退款",
      partially_refunded: "部分退款",
    },
  },
} as const;

function formatLocalizedStatus(value: string | undefined, labels: Record<string, string>, fallback: string) {
  if (!value) {
    return fallback;
  }
  return labels[value] || value;
}

export default function BookingPaymentPage() {
  const { user, token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) {
      setBookings([]);
      setPayments([]);
      return;
    }

    const [nextBookings, nextPayments] = await Promise.all([
      browserApiFetch<Booking[]>("/me/bookings", { headers: authHeaders(token) }),
      browserApiFetch<Payment[]>("/me/payments", { headers: authHeaders(token) }),
    ]);

    setBookings(nextBookings);
    setPayments(nextPayments);
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const paymentMap = useMemo(() => {
    const map = new Map<string, Payment[]>();
    payments.forEach((payment) => {
      const key = payment.bookingReference || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(payment);
    });
    return map;
  }, [payments]);

  const summaryItems = useMemo(
    () => [
      { label: copy.totalBookings, value: bookings.length },
      { label: copy.paymentRecords, value: payments.length },
      { label: copy.paid, value: payments.filter((item) => item.status === "paid").length },
      { label: copy.pending, value: bookings.filter((item) => item.paymentStatus === "pending" || item.paymentStatus === "unpaid").length },
    ],
    [bookings, copy.paid, copy.paymentRecords, copy.pending, copy.totalBookings, payments]
  );

  const createPayment = async (bookingReference: string) => {
    if (!token) return;
    try {
      const response = await browserApiFetch<{ payment: Payment }>("/payments", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ bookingReference, method: "QPay (MN)" }),
      });
      setMessage(`${copy.requestCreated} ${response.payment.paymentReference}`);
      await loadData();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : copy.createFailed);
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
      setMessage(copy.paymentUpdated);
      await loadData();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
    }
  };

  if (!user) {
    return (
      <main>
        <section className="pageHero bookingCenterHero">
          <div className="container bookingCenterHeroGrid">
            <div className="stackMd">
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.guestBody}</p>
              <div className="rowActions wrapActions">
                <Link className="btn primary" href="/login">{copy.login}</Link>
                <Link className="btn secondary" href="/register">{copy.register}</Link>
              </div>
            </div>

            <article className="card bookingInfoCard">
              <div className="content stackSm">
                <p className="eyebrow">{copy.infoEyebrow}</p>
                <h3>{copy.processTitle}</h3>
                <div className="paymentTimeline">
                  {copy.processItems.map((item, index) => (
                    <div key={item} className="timelineItem"><strong>{index + 1}.</strong><span>{item}</span></div>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="pageHero bookingCenterHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.userBody}</p>
          </div>
          <article className="card bookingInfoCard">
            <div className="content stackSm">
              <p className="eyebrow">{copy.liveStatus}</p>
              <h3>{user.fullName}</h3>
              <p className="meta">{copy.accountLinked}</p>
              <div className="miniButtonGroup">
                <Link href="/account/bookings" className="miniActionLink">{copy.myBookings}</Link>
                <Link href="/account/payments" className="miniActionLink">{copy.myPayments}</Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="summaryStrip">
            {summaryItems.map((item) => (
              <article key={item.label} className="summaryTile">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>

          {message ? <p className="inlineMessage success">{message}</p> : null}

          {bookings.length === 0 ? (
            <article className="panel emptyState stackSm">
              <h3>{copy.emptyTitle}</h3>
              <div className="rowActions wrapActions">
                <Link className="btn primary" href="/tours">{copy.browseTours}</Link>
                <Link className="btn secondary" href="/enquire/step/1">{copy.planTrip}</Link>
              </div>
            </article>
          ) : null}

          {bookings.map((booking) => {
            const relatedPayments = paymentMap.get(booking.bookingReference) || [];
            return (
              <article key={booking.bookingReference} className="panel stackMd bookingCenterPanel">
                <div className="sectionHeading compact">
                  <div>
                    <h2>{booking.tourTitle}</h2>
                    <p className="meta">{booking.bookingReference} • {formatDate(booking.createdAt, locale)}</p>
                  </div>
                  <div className="stackXs alignEnd">
                    <strong>{formatLocalizedStatus(booking.bookingStatus, copy.bookingStatuses, copy.pending)}</strong>
                    <span className="meta">{formatLocalizedStatus(booking.paymentStatus, copy.paymentStatuses, copy.pending)}</span>
                  </div>
                </div>

                <div className="detailMetaGrid">
                  <div><strong>{copy.departure}</strong><p>{formatDate(booking.preferredDepartureDate, locale) || copy.pending}</p></div>
                  <div><strong>{copy.participants}</strong><p>{booking.participantCount}</p></div>
                  <div><strong>{copy.amount}</strong><p>{formatAmount(booking.amount, booking.currency, copy.priceOnRequest, locale)}</p></div>
                </div>

                <div className="rowActions wrapActions">
                  <Link className="btn secondary" href={`/account/bookings/${booking.bookingReference}`}>{copy.open}</Link>
                  {booking.amount > 0 && booking.paymentStatus !== "paid" ? (
                    <button className="btn primary" type="button" onClick={() => void createPayment(booking.bookingReference)}>
                      {copy.createPayment}
                    </button>
                  ) : null}
                </div>

                <div className="stackSm topSpacingSm">
                  <h3>{copy.linkedPayments}</h3>
                  {relatedPayments.length === 0 ? <p className="meta">{copy.noPayment}</p> : null}
                  {relatedPayments.map((payment) => (
                    <article key={payment.paymentReference} className="card slimCard paymentRecordCard">
                      <div className="content stackSm">
                        <div className="rowActions spread wrapActions">
                          <strong>{payment.paymentReference}</strong>
                          <span className={`statusPill status-${payment.status}`}>{formatLocalizedStatus(payment.status, copy.paymentStatuses, copy.pending)}</span>
                        </div>
                        <p className="meta">{payment.method} • {formatAmount(payment.amount, payment.currency, copy.priceOnRequest, locale)}</p>
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
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
