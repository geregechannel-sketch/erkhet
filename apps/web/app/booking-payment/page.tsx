"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatBookingStatus, formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Booking, Payment } from "@/lib/types";

function formatAmount(value: number, currency: string, priceOnRequest: string) {
  return value > 0 ? formatCurrency(value, currency) : priceOnRequest;
}

const copyByLocale = {
  mn: {
    eyebrow: "Booking & Payment",
    title: "Захиалга / Төлбөр",
    guestBody: "Хийсэн захиалга, төлбөрийн мэдээллээ нэг дороос харахын тулд нэвтэрнэ үү.",
    userBody: "Захиалга, төлбөрийн мэдээллээ энэ хэсгээс хараарай.",
    login: "Нэвтрэх",
    register: "Бүртгүүлэх",
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
    paymentRecords: "Төлбөрийн бичлэг",
    paid: "Төлөгдсөн",
    pending: "Хүлээгдэж буй",
    emptyTitle: "Одоогоор захиалгын бичлэг алга.",
    browseTours: "Аяллууд үзэх",
    planTrip: "Аялал төлөвлөх",
    departure: "Гарах өдөр",
    participants: "Хүний тоо",
    amount: "Дүн",
    open: "Нээх",
    createPayment: "Төлбөр үүсгэх",
    linkedPayments: "Холбогдсон төлбөрүүд",
    noPayment: "Төлбөрийн бичлэг үүсээгүй байна.",
    markPaid: "Амжилттай болгох",
    markFailed: "Амжилтгүй",
    markCancelled: "Цуцлах",
    requestCreated: "Төлбөрийн хүсэлт үүслээ.",
    paymentUpdated: "Төлбөрийн төлөв шинэчлэгдлээ.",
    createFailed: "Төлбөрийн хүсэлт үүсгэхэд алдаа гарлаа.",
    updateFailed: "Төлбөр шинэчлэхэд алдаа гарлаа.",
    priceOnRequest: "Үнэ хүсэлтээр",
  },
  en: {
    eyebrow: "Booking & Payment",
    title: "Booking / Payment",
    guestBody: "Sign in to review your bookings, payment requests, and confirmation status from one screen.",
    userBody: "Track bookings, payments, statuses, and payment references from one screen.",
    login: "Sign in",
    register: "Register",
    processTitle: "What happens after booking",
    processItems: ["A booking record is created", "A payment request is linked", "The confirmed state updates in your account"],
    liveStatus: "Live status",
    accountLinked: "Booking, payment, and support flows are currently linked to your account.",
    myBookings: "My bookings",
    myPayments: "Payments",
    totalBookings: "Total bookings",
    paymentRecords: "Payment records",
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
    noPayment: "No payment record yet.",
    markPaid: "Mark successful",
    markFailed: "Mark failed",
    markCancelled: "Cancel",
    requestCreated: "Payment request created.",
    paymentUpdated: "Payment status updated.",
    createFailed: "Failed to create payment request.",
    updateFailed: "Failed to update payment.",
    priceOnRequest: "Price on request",
  },
  ru: {
    eyebrow: "Booking & Payment",
    title: "Бронирование / Оплата",
    guestBody: "Войдите, чтобы видеть бронирования, платежные запросы и статус подтверждения на одном экране.",
    userBody: "Отслеживайте бронирования, платежи, статусы и payment reference на одном экране.",
    login: "Войти",
    register: "Регистрация",
    processTitle: "Что происходит после бронирования",
    processItems: ["Создается booking record", "Связывается платежный запрос", "Подтвержденный статус обновляется в кабинете"],
    liveStatus: "Live status",
    accountLinked: "Booking, payment и support процессы уже связаны с вашим аккаунтом.",
    myBookings: "Мои бронирования",
    myPayments: "Платежи",
    totalBookings: "Всего бронирований",
    paymentRecords: "Платежные записи",
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
    noPayment: "Платежная запись еще не создана.",
    markPaid: "Успешно",
    markFailed: "Неуспешно",
    markCancelled: "Отменить",
    requestCreated: "Платежный запрос создан.",
    paymentUpdated: "Статус платежа обновлен.",
    createFailed: "Не удалось создать платежный запрос.",
    updateFailed: "Не удалось обновить платеж.",
    priceOnRequest: "Цена по запросу",
  },
  zh: {
    eyebrow: "Booking & Payment",
    title: "预订 / 支付",
    guestBody: "登录后即可在一个页面查看预订、支付请求和确认状态。",
    userBody: "在一个页面跟踪预订、支付、状态和 payment reference。",
    login: "登录",
    register: "注册",
    processTitle: "预订后的流程",
    processItems: ["创建 booking record", "关联支付请求", "确认状态同步到您的账户"],
    liveStatus: "Live status",
    accountLinked: "Booking、payment 和 support 流程已与您的账户关联。",
    myBookings: "我的预订",
    myPayments: "支付",
    totalBookings: "预订总数",
    paymentRecords: "支付记录",
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
    noPayment: "还没有支付记录。",
    markPaid: "标记成功",
    markFailed: "标记失败",
    markCancelled: "取消",
    requestCreated: "支付请求已创建。",
    paymentUpdated: "支付状态已更新。",
    createFailed: "创建支付请求失败。",
    updateFailed: "更新支付失败。",
    priceOnRequest: "价格面议",
  },
} as const;

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
                <p className="eyebrow">Мэдээлэл</p>
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
                    <p className="meta">{booking.bookingReference} • {formatDate(booking.createdAt)}</p>
                  </div>
                  <div className="stackXs alignEnd">
                    <strong>{formatBookingStatus(booking.bookingStatus)}</strong>
                    <span className="meta">{formatPaymentStatus(booking.paymentStatus)}</span>
                  </div>
                </div>

                <div className="detailMetaGrid">
                  <div><strong>{copy.departure}</strong><p>{formatDate(booking.preferredDepartureDate) || copy.pending}</p></div>
                  <div><strong>{copy.participants}</strong><p>{booking.participantCount}</p></div>
                  <div><strong>{copy.amount}</strong><p>{formatAmount(booking.amount, booking.currency, copy.priceOnRequest)}</p></div>
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
                          <span className={`statusPill status-${payment.status}`}>{formatPaymentStatus(payment.status)}</span>
                        </div>
                        <p className="meta">{payment.method} • {formatAmount(payment.amount, payment.currency, copy.priceOnRequest)}</p>
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
