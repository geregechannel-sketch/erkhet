"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Tour } from "@/lib/types";

const emptyForm = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  businessLine: "domestic",
  operationType: "scheduled",
  tourKind: "multi_day",
  durationDays: 1,
  durationNights: 0,
  priceAmount: "",
  currency: "MNT",
  pricingNote: "",
  route: "",
  coverImage: "",
  status: "draft",
  featured: false,
  capacity: 12,
  availabilityCount: 12,
  departureDates: "",
  itinerary: "",
  inclusions: "",
  exclusions: "",
  sortOrder: 100
};

export default function AdminToursPage() {
  const { token } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  const loadTours = async () => {
    if (!token) return;
    const nextTours = await browserApiFetch<Tour[]>("/admin/tours", {
      headers: authHeaders(token)
    });
    setTours(nextTours);
  };

  useEffect(() => {
    void loadTours();
  }, [token]);

  const startEdit = (tour: Tour) => {
    setEditingId(tour.id);
    setForm({
      title: tour.title,
      slug: tour.slug,
      summary: tour.summary,
      description: tour.description,
      businessLine: tour.businessLine,
      operationType: tour.operationType,
      tourKind: tour.tourKind,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      priceAmount: tour.priceAmount?.toString() || "",
      currency: tour.currency || "MNT",
      pricingNote: tour.pricingNote || "",
      route: tour.route,
      coverImage: tour.coverImage,
      status: tour.status,
      featured: tour.featured,
      capacity: tour.capacity,
      availabilityCount: tour.availabilityCount,
      departureDates: tour.departureDates.join("\n"),
      itinerary: tour.itinerary.join("\n"),
      inclusions: tour.inclusions.join("\n"),
      exclusions: tour.exclusions.join("\n"),
      sortOrder: tour.sortOrder
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setMessage(null);
    const payload = {
      title: form.title,
      slug: form.slug,
      summary: form.summary,
      description: form.description,
      businessLine: form.businessLine,
      operationType: form.operationType,
      tourKind: form.tourKind,
      durationDays: Number(form.durationDays),
      durationNights: Number(form.durationNights),
      priceAmount: form.priceAmount ? Number(form.priceAmount) : null,
      currency: form.currency,
      pricingNote: form.pricingNote,
      route: form.route,
      coverImage: form.coverImage,
      status: form.status,
      featured: form.featured,
      capacity: Number(form.capacity),
      availabilityCount: Number(form.availabilityCount),
      departureDates: form.departureDates.split("\n").map((item) => item.trim()).filter(Boolean),
      itinerary: form.itinerary.split("\n").map((item) => item.trim()).filter(Boolean),
      inclusions: form.inclusions.split("\n").map((item) => item.trim()).filter(Boolean),
      exclusions: form.exclusions.split("\n").map((item) => item.trim()).filter(Boolean),
      sortOrder: Number(form.sortOrder)
    };

    try {
      if (editingId) {
        await browserApiFetch(`/admin/tours/${editingId}`, {
          method: "PUT",
          headers: authHeaders(token),
          body: JSON.stringify(payload)
        });
        setMessage("Tour шинэчлэгдлээ.");
      } else {
        await browserApiFetch("/admin/tours", {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify(payload)
        });
        setMessage("Шинэ tour үүслээ.");
      }
      reset();
      await loadTours();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Tour хадгалахад алдаа гарлаа.");
    }
  };

  const removeTour = async (id: number) => {
    if (!token) return;
    try {
      await browserApiFetch(`/admin/tours/${id}`, {
        method: "DELETE",
        headers: authHeaders(token)
      });
      setMessage("Tour устгагдлаа.");
      if (editingId === id) {
        reset();
      }
      await loadTours();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Tour устгахад алдаа гарлаа.");
    }
  };

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>Tours</h1></div>
      {message ? <p className="inlineMessage success">{message}</p> : null}
      <div className="adminTwoCol">
        <section className="panel stackMd">
          <h2>{editingId ? "Tour засах" : "Шинэ tour нэмэх"}</h2>
          <form className="formGrid" onSubmit={onSubmit}>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" required />
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Slug (optional)" />
            <input className="full" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Summary" required />
            <textarea className="full" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" required />
            <select value={form.businessLine} onChange={(event) => setForm({ ...form, businessLine: event.target.value })}>
              <option value="domestic">Domestic</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
            <select value={form.operationType} onChange={(event) => setForm({ ...form, operationType: event.target.value })}>
              <option value="scheduled">Scheduled</option>
              <option value="custom">Custom</option>
            </select>
            <select value={form.tourKind} onChange={(event) => setForm({ ...form, tourKind: event.target.value })}>
              <option value="multi_day">Multi-day</option>
              <option value="day_tour">Day tour</option>
            </select>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <input value={form.route} onChange={(event) => setForm({ ...form, route: event.target.value })} placeholder="Route" />
            <input value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder="Cover image URL" />
            <input type="number" min="1" value={form.durationDays} onChange={(event) => setForm({ ...form, durationDays: Number(event.target.value) })} placeholder="Days" />
            <input type="number" min="0" value={form.durationNights} onChange={(event) => setForm({ ...form, durationNights: Number(event.target.value) })} placeholder="Nights" />
            <input value={form.priceAmount} onChange={(event) => setForm({ ...form, priceAmount: event.target.value })} placeholder="Price amount" />
            <input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} placeholder="Currency" />
            <input className="full" value={form.pricingNote} onChange={(event) => setForm({ ...form, pricingNote: event.target.value })} placeholder="Pricing note" />
            <input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} placeholder="Capacity" />
            <input type="number" min="0" value={form.availabilityCount} onChange={(event) => setForm({ ...form, availabilityCount: Number(event.target.value) })} placeholder="Available" />
            <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} placeholder="Sort order" />
            <label className="checkboxLabel"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured</label>
            <textarea className="full" value={form.departureDates} onChange={(event) => setForm({ ...form, departureDates: event.target.value })} placeholder="Departure dates, one per line" />
            <textarea className="full" value={form.itinerary} onChange={(event) => setForm({ ...form, itinerary: event.target.value })} placeholder="Itinerary, one per line" />
            <textarea value={form.inclusions} onChange={(event) => setForm({ ...form, inclusions: event.target.value })} placeholder="Inclusions, one per line" />
            <textarea value={form.exclusions} onChange={(event) => setForm({ ...form, exclusions: event.target.value })} placeholder="Exclusions, one per line" />
            <div className="cardActions full">
              <button className="btn primary" type="submit">{editingId ? "Шинэчлэх" : "Үүсгэх"}</button>
              {editingId ? <button className="btn secondary" type="button" onClick={reset}>Цэвэрлэх</button> : null}
            </div>
          </form>
        </section>

        <section className="panel stackMd">
          <h2>Tour inventory</h2>
          <div className="stackSm">
            {tours.map((tour) => (
              <article key={tour.id} className="listRow">
                <div>
                  <strong>{tour.title}</strong>
                  <p className="meta">{tour.status} • {formatCurrency(tour.priceAmount, tour.currency || "MNT") || tour.pricingNote}</p>
                </div>
                <div className="rowActions">
                  <button className="btn secondary" type="button" onClick={() => startEdit(tour)}>Edit</button>
                  <button className="btn secondary" type="button" onClick={() => void removeTour(tour.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}