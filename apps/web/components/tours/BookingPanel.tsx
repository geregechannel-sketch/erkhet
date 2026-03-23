"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { TravelerDetailsEditor } from "@/components/forms/TravelerDetailsEditor";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Booking, Tour, TravelerDetail } from "@/lib/types";

export function BookingPanel({ tour }: { tour: Tour }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [travelerDetails, setTravelerDetails] = useState<TravelerDetail[]>([]);

  const price = tour.priceAmount
    ? formatCurrency(tour.priceAmount, tour.currency || "MNT")
    : tour.pricingNote || "Үнэ хүсэлтээр";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      router.push(`/auth/login?redirect=/tours/${tour.slug}`);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setState("submitting");
    setMessage(null);

    try {
      const booking = await browserApiFetch<Booking>("/bookings", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          tourSlug: tour.slug,
          travelerName: formData.get("travelerName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          preferredDepartureDate: formData.get("preferredDepartureDate"),
          participantCount: Number(formData.get("participantCount") || 1),
          travelerDetails,
          note: formData.get("note")
        })
      });
      setState("success");
      setMessage(`Захиалга ${booking.bookingReference} дугаартайгаар амжилттай үүслээ.`);
      form.reset();
      setTravelerDetails([]);
      router.push(`/account/bookings/${booking.bookingReference}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof ApiError ? error.message : "Захиалга үүсгэхэд алдаа гарлаа.");
    } finally {
      setState("idle");
    }
  };

  if (!user) {
    return (
      <article className="card bookingGate">
        <div className="content stackMd">
          <h3>Онлайн захиалга</h3>
          <p>
            Захиалга, төлбөр, хадгалсан аялал болон дэмжлэгийн түүхээ нэг дор удирдахын тулд эхлээд нэвтэрнэ үү.
          </p>
          <div className="cardActions">
            <Link className="btn primary" href={`/auth/login?redirect=/tours/${tour.slug}`}>Нэвтрэх</Link>
            <Link className="btn secondary" href={`/auth/register?redirect=/tours/${tour.slug}`}>Бүртгүүлэх</Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card bookingCard">
      <div className="content stackMd">
        <div>
          <h3>Онлайн захиалга</h3>
          <p className="meta">Энэ аяллын суурь үнэ: {price}</p>
        </div>

        <form className="formGrid bookingForm" onSubmit={onSubmit}>
          <input name="travelerName" placeholder="Аялагчийн нэр" defaultValue={user.fullName} required />
          <input name="email" type="email" placeholder="И-мэйл" defaultValue={user.email} required />
          <input name="phone" placeholder="Утас / WhatsApp" defaultValue={user.phone} required />
          <input name="preferredDepartureDate" type="date" required />
          <input name="participantCount" type="number" min="1" defaultValue={1} required />

          <div className="full">
            <TravelerDetailsEditor value={travelerDetails} onChange={setTravelerDetails} />
          </div>

          <textarea className="full" name="note" placeholder="Тусгай хүсэлт, нэмэлт тайлбар" />
          <button className="btn primary full" type="submit" disabled={state === "submitting"}>
            {state === "submitting" ? "Илгээж байна..." : "Захиалга үүсгэх"}
          </button>
        </form>

        {message ? <p className={`inlineMessage ${state === "error" ? "error" : "success"}`}>{message}</p> : null}
      </div>
    </article>
  );
}