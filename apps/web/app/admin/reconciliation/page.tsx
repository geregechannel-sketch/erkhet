"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Booking, ReconciliationItem } from "@/lib/types";

export default function AdminReconciliationPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadItems = async () => {
    if (!token) return;
    const nextItems = await browserApiFetch<ReconciliationItem[]>("/admin/reconciliation", {
      headers: authHeaders(token)
    });
    setItems(nextItems);
  };

  useEffect(() => {
    void loadItems();
  }, [token]);

  const updateReview = async (event: FormEvent<HTMLFormElement>, bookingReference: string) => {
    event.preventDefault();
    if (!token) return;
    const formData = new FormData(event.currentTarget);
    try {
      await browserApiFetch<Booking>(`/admin/reconciliation/${bookingReference}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          reviewFlag: formData.get("reviewFlag") === "on",
          reviewNote: formData.get("reviewNote")
        })
      });
      setMessage(`${bookingReference} reconciliation review шинэчлэгдлээ.`);
      await loadItems();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Review шинэчлэхэд алдаа гарлаа.");
    }
  };

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>Reconciliation / Finance</h1></div>
      {message ? <p className="inlineMessage success">{message}</p> : null}
      <div className="stackMd">
        {items.map((item) => (
          <article key={item.bookingReference} className="panel stackSm">
            <div className="sectionHeading compact">
              <div>
                <h2>{item.bookingReference}</h2>
                <p className="meta">{item.userName} • {item.tourTitle} • {formatDate(item.createdAt)}</p>
              </div>
              <strong>{item.state}</strong>
            </div>
            <div className="detailMetaGrid">
              <div><strong>Expected</strong><p>{formatCurrency(item.expectedAmount, item.currency)}</p></div>
              <div><strong>Paid</strong><p>{formatCurrency(item.paidAmount, item.currency)}</p></div>
              <div><strong>Outstanding</strong><p>{formatCurrency(item.outstanding, item.currency)}</p></div>
              <div><strong>Payment status</strong><p>{item.paymentStatus}</p></div>
            </div>
            <form className="stackSm" onSubmit={(event) => void updateReview(event, item.bookingReference)}>
              <label className="checkboxLabel"><input name="reviewFlag" type="checkbox" defaultChecked={item.reviewFlag} /> Mark for review</label>
              <textarea name="reviewNote" defaultValue={item.reviewNote || ""} placeholder="Finance note" />
              <button className="btn secondary" type="submit">Хадгалах</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}