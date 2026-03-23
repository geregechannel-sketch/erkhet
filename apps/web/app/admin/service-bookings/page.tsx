"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { ServiceBooking } from "@/lib/types";

const serviceOptions = [
  { value: "", label: "Бүх үйлчилгээ" },
  { value: "hotel", label: "Зочид буудал" },
  { value: "restaurant", label: "Ресторан" },
  { value: "flight", label: "Онгоцны суудал" },
  { value: "taxi", label: "Такси" },
  { value: "esim", label: "e-SIM" },
  { value: "insurance", label: "Даатгал" }
];

const statusOptions = ["new", "in_review", "quoted", "confirmed", "cancelled", "completed"] as const;

function statusLabel(status: ServiceBooking["status"]) {
  switch (status) {
    case "new":
      return "Шинэ";
    case "in_review":
      return "Хянагдаж байна";
    case "quoted":
      return "Үнийн санал";
    case "confirmed":
      return "Баталгаажсан";
    case "cancelled":
      return "Цуцлагдсан";
    case "completed":
      return "Дууссан";
    default:
      return status;
  }
}

export default function AdminServiceBookingsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<ServiceBooking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [savingRef, setSavingRef] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (serviceType) params.set("serviceType", serviceType);
    const response = await browserApiFetch<ServiceBooking[]>(`/admin/service-bookings${params.toString() ? `?${params.toString()}` : ""}`, {
      headers: authHeaders(token)
    });
    setItems(response);
  };

  useEffect(() => {
    void load();
  }, [token]);

  const onFilter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await load();
  };

  const onSave = async (item: ServiceBooking) => {
    if (!token) return;
    const statusValue = (document.getElementById(`status-${item.serviceReference}`) as HTMLSelectElement | null)?.value || item.status;
    const noteValue = (document.getElementById(`note-${item.serviceReference}`) as HTMLTextAreaElement | null)?.value || item.adminNote || "";

    setSavingRef(item.serviceReference);
    setMessage(null);
    try {
      const updated = await browserApiFetch<ServiceBooking>(`/admin/service-bookings/${item.serviceReference}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ status: statusValue, adminNote: noteValue })
      });
      setItems((current) => current.map((entry) => (entry.serviceReference === updated.serviceReference ? updated : entry)));
      setMessage(`${updated.serviceReference} шинэчлэгдлээ.`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Шинэчлэхэд алдаа гарлаа.");
    } finally {
      setSavingRef(null);
    }
  };

  return (
    <div className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Үйлчилгээний хүсэлтүүд</h1>
        </div>
      </div>

      <section className="panel stackMd">
        <form className="rowActions" onSubmit={onFilter}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ref, хэрэглэгч, чиглэлээр хайх"
          />
          <select value={serviceType} onChange={(event) => setServiceType(event.target.value)}>
            {serviceOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Бүх төлөв</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusLabel(option)}
              </option>
            ))}
          </select>
          <button className="btn secondary" type="submit">
            Шүүх
          </button>
        </form>
        {message ? <p className="inlineMessage success">{message}</p> : null}
      </section>

      <section className="stackMd">
        {items.length === 0 ? (
          <div className="panel">
            <p className="meta">Одоогоор үйлчилгээний хүсэлт алга.</p>
          </div>
        ) : null}
        {items.map((item) => (
          <article key={item.serviceReference} className="panel stackMd serviceAdminCard">
            <div className="rowActions spread">
              <div>
                <strong>{item.serviceLabel}</strong>
                <p className="meta">
                  {item.serviceReference} • {item.userName} • {item.contactEmail}
                </p>
              </div>
              <div className="stackXs alignEnd">
                <strong>{statusLabel(item.status)}</strong>
                <span className="meta">{formatDate(item.createdAt)}</span>
              </div>
            </div>

            <div className="serviceAdminSummary">
              <p>
                <strong>Чиглэл:</strong> {item.destination}
              </p>
              <p>
                <strong>Огноо:</strong> {item.travelDate}
                {item.endDate ? ` - ${item.endDate}` : ""}
              </p>
              <p>
                <strong>Тоо хэмжээ:</strong> {item.quantity}
              </p>
              <p>
                <strong>Холбоо барих:</strong> {item.contactName} / {item.contactPhone}
              </p>
            </div>

            <div className="serviceAdminDetails">
              {Object.entries(item.details || {}).map(([key, value]) => (
                <span key={key} className="serviceDetailChip">
                  {key}: {String(value)}
                </span>
              ))}
            </div>

            <div className="serviceAdminActions">
              <select id={`status-${item.serviceReference}`} defaultValue={item.status}>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusLabel(option)}
                  </option>
                ))}
              </select>
              <textarea id={`note-${item.serviceReference}`} defaultValue={item.adminNote || ""} rows={3} placeholder="Дотоод тэмдэглэл" />
              <button className="btn primary" type="button" disabled={savingRef === item.serviceReference} onClick={() => void onSave(item)}>
                {savingRef === item.serviceReference ? "Хадгалж байна..." : "Шинэчлэх"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}



