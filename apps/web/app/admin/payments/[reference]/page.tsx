"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/lib/types";

export default function AdminPaymentDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadPayment = async () => {
    if (!token || !params.reference) return;
    const next = await browserApiFetch<Payment>(`/admin/payments/${params.reference}`, {
      headers: authHeaders(token)
    });
    setPayment(next);
  };

  useEffect(() => {
    void loadPayment();
  }, [params.reference, token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !params.reference) return;
    const formData = new FormData(event.currentTarget);
    try {
      await browserApiFetch(`/admin/payments/${params.reference}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          status: formData.get("status"),
          providerReference: formData.get("providerReference"),
          failureReason: formData.get("failureReason"),
          refundedAmount: Number(formData.get("refundedAmount") || 0)
        })
      });
      setMessage("Payment шинэчлэгдлээ.");
      await loadPayment();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Payment шинэчлэхэд алдаа гарлаа.");
    }
  };

  if (!payment) {
    return <div className="panel loadingPanel">Ачааллаж байна...</div>;
  }

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{payment.paymentReference}</h1></div>
      <section className="panel stackMd">
        <p><strong>Booking:</strong> {payment.bookingReference}</p>
        <p><strong>User:</strong> {payment.userName}</p>
        <p><strong>Tour:</strong> {payment.tourTitle}</p>
        <p><strong>Amount:</strong> {formatCurrency(payment.amount, payment.currency)}</p>
        <p><strong>Method:</strong> {payment.method}</p>
        <p><strong>Created:</strong> {formatDate(payment.createdAt)}</p>
      </section>
      <section className="panel stackMd">
        <h2>Payment status</h2>
        <form className="stackMd" onSubmit={onSubmit}>
          <select name="status" defaultValue={payment.status}>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
            <option value="partially_refunded">partially_refunded</option>
          </select>
          <input name="providerReference" defaultValue={payment.providerReference || ""} placeholder="Gateway reference" />
          <input name="refundedAmount" type="number" min="0" step="0.01" defaultValue={payment.refundedAmount} placeholder="Refunded amount" />
          <textarea name="failureReason" defaultValue={payment.failureReason || ""} placeholder="Failure reason / finance note" />
          <button className="btn primary" type="submit">Шинэчлэх</button>
        </form>
        {message ? <p className="inlineMessage success">{message}</p> : null}
      </section>
    </div>
  );
}