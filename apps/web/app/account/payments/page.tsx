"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Payment } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Миний хэсэг",
    title: "Төлбөр / Баримт",
    updated: "Төлбөрийн төлөв шинэчлэгдлээ.",
    updateFailed: "Төлбөр шинэчлэхэд алдаа гарлаа.",
    empty: "Одоогоор төлбөрийн бичлэг алга.",
    booking: "Захиалга",
    amount: "Дүн",
    method: "Арга",
    paidAt: "Төлсөн огноо",
    pending: "Хүлээгдэж буй",
    markPaid: "Амжилттай болгох",
    markFailed: "Амжилтгүй",
    markCancelled: "Цуцлах",
  },
  en: {
    eyebrow: "My account",
    title: "Payments / Receipts",
    updated: "Payment status updated.",
    updateFailed: "Failed to update payment.",
    empty: "No payment records yet.",
    booking: "Booking",
    amount: "Amount",
    method: "Method",
    paidAt: "Paid at",
    pending: "Pending",
    markPaid: "Mark successful",
    markFailed: "Mark failed",
    markCancelled: "Cancel",
  },
  ru: {
    eyebrow: "Мой кабинет",
    title: "Платежи / Квитанции",
    updated: "Статус платежа обновлён.",
    updateFailed: "Не удалось обновить платёж.",
    empty: "Платежей пока нет.",
    booking: "Бронирование",
    amount: "Сумма",
    method: "Способ",
    paidAt: "Дата оплаты",
    pending: "Ожидается",
    markPaid: "Отметить успешным",
    markFailed: "Отметить неуспешным",
    markCancelled: "Отменить",
  },
  zh: {
    eyebrow: "我的账户",
    title: "支付 / 凭证",
    updated: "支付状态已更新。",
    updateFailed: "更新支付失败。",
    empty: "目前还没有支付记录。",
    booking: "预订",
    amount: "金额",
    method: "支付方式",
    paidAt: "支付日期",
    pending: "处理中",
    markPaid: "标记成功",
    markFailed: "标记失败",
    markCancelled: "取消",
  },
} as const;

type MessageTone = "success" | "error";

export default function PaymentsPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadPayments = async () => {
    if (!token) return;
    const next = await browserApiFetch<Payment[]>("/me/payments", {
      headers: authHeaders(token),
    });
    setPayments(next);
  };

  useEffect(() => {
    void loadPayments();
  }, [token]);

  const simulate = async (paymentReference: string, outcome: "success" | "failed" | "cancelled") => {
    if (!token) return;
    try {
      await browserApiFetch<Payment>(`/payments/${paymentReference}/simulate`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ outcome }),
      });
      await loadPayments();
      setMessageTone("success");
      setMessage(copy.updated);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
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
      {payments.length === 0 ? (
        <article className="panel emptyState">{copy.empty}</article>
      ) : (
        <div className="stackMd">
          {payments.map((payment) => (
            <article key={payment.paymentReference} className="panel stackSm">
              <div className="sectionHeading compact">
                <div>
                  <h2>{payment.paymentReference}</h2>
                  <p className="meta">{copy.booking}: {payment.bookingReference} • {formatDate(payment.createdAt, locale)}</p>
                </div>
                <strong>{formatPaymentStatus(payment.status, locale)}</strong>
              </div>
              <div className="detailMetaGrid">
                <div><strong>{copy.amount}</strong><p>{formatCurrency(payment.amount, payment.currency, locale)}</p></div>
                <div><strong>{copy.method}</strong><p>{payment.method}</p></div>
                <div><strong>{copy.paidAt}</strong><p>{formatDate(payment.paidAt, locale) || copy.pending}</p></div>
              </div>
              {payment.status === "pending" ? (
                <div className="cardActions wrapActions">
                  <button className="btn primary" type="button" onClick={() => void simulate(payment.paymentReference, "success")}>{copy.markPaid}</button>
                  <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "failed")}>{copy.markFailed}</button>
                  <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "cancelled")}>{copy.markCancelled}</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
