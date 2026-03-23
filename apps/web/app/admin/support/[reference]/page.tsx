"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { SupportRequest } from "@/lib/types";

export default function AdminSupportDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadRequest = async () => {
    if (!token || !params.reference) return;
    const next = await browserApiFetch<SupportRequest>(`/admin/support-requests/${params.reference}`, {
      headers: authHeaders(token)
    });
    setRequest(next);
  };

  useEffect(() => {
    void loadRequest();
  }, [params.reference, token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !params.reference) return;
    const formData = new FormData(event.currentTarget);
    try {
      await browserApiFetch(`/admin/support-requests/${params.reference}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          status: formData.get("status"),
          adminNote: formData.get("adminNote")
        })
      });
      setMessage("Support request шинэчлэгдлээ.");
      await loadRequest();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Support request шинэчлэхэд алдаа гарлаа.");
    }
  };

  if (!request) {
    return <div className="panel loadingPanel">Ачааллаж байна...</div>;
  }

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{request.subject}</h1></div>
      <section className="panel stackMd">
        <p><strong>Reference:</strong> {request.supportReference}</p>
        <p><strong>Customer:</strong> {request.customerName} • {request.customerEmail} • {request.customerPhone}</p>
        <p><strong>Type:</strong> {request.type}</p>
        <p><strong>Status:</strong> {request.status}</p>
        {request.bookingReference ? <p><strong>Booking:</strong> {request.bookingReference}</p> : null}
        {request.tourTitle ? <p><strong>Tour:</strong> {request.tourTitle}</p> : null}
        <p><strong>Message:</strong> {request.message}</p>
      </section>
      <section className="panel stackMd">
        <h2>Update workflow</h2>
        <form className="stackMd" onSubmit={onSubmit}>
          <select name="status" defaultValue={request.status}>
            <option value="new">new</option>
            <option value="in_review">in_review</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
          <textarea name="adminNote" defaultValue={request.adminNote || ""} placeholder="Internal note" />
          <button className="btn primary" type="submit">Шинэчлэх</button>
        </form>
        {message ? <p className="inlineMessage success">{message}</p> : null}
      </section>
      <section className="panel stackMd">
        <h2>Timeline</h2>
        {request.events?.map((event) => (
          <article key={event.id} className="timelineItem">
            <strong>{event.eventType}</strong>
            <p>{event.message}</p>
            <span className="meta">{event.actorLabel} • {formatDate(event.createdAt)}</span>
          </article>
        ))}
      </section>
    </div>
  );
}