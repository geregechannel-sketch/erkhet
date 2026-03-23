"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Payment } from "@/lib/types";

export default function PaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadPayments = async () => {
    if (!token) return;
    const next = await browserApiFetch<Payment[]>("/me/payments", {
      headers: authHeaders(token)
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
        body: JSON.stringify({ outcome })
      });
      await loadPayments();
      setMessage("Төлбөрийн төлөв шинэчлэгдлээ.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Төлбөр шинэчлэхэд алдаа гарлаа.");
    }
  };

  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">My Account</p>
          <h1>Төлбөр / Баримт</h1>
        </div>
      </div>
      {message ? <p className="inlineMessage success">{message}</p> : null}
      {payments.length === 0 ? (
        <article className="panel emptyState">Одоогоор төлбөрийн бичлэг алга.</article>
      ) : (
        <div className="stackMd">
          {payments.map((payment) => (
            <article key={payment.paymentReference} className="panel stackSm">
              <div className="sectionHeading compact">
                <div>
                  <h2>{payment.paymentReference}</h2>
                  <p className="meta">Booking: {payment.bookingReference} • {formatDate(payment.createdAt)}</p>
                </div>
                <strong>{formatPaymentStatus(payment.status)}</strong>
              </div>
              <div className="detailMetaGrid">
                <div><strong>Дүн</strong><p>{formatCurrency(payment.amount, payment.currency)}</p></div>
                <div><strong>Арга</strong><p>{payment.method}</p></div>
                <div><strong>Төлсөн огноо</strong><p>{formatDate(payment.paidAt) || "Хүлээгдэж буй"}</p></div>
              </div>
              {payment.status === "pending" ? (
                <div className="cardActions wrapActions">
                  <button className="btn primary" type="button" onClick={() => void simulate(payment.paymentReference, "success")}>Амжилттай болгох</button>
                  <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "failed")}>Амжилтгүй</button>
                  <button className="btn secondary" type="button" onClick={() => void simulate(payment.paymentReference, "cancelled")}>Цуцлах</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}