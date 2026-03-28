"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { TravelerDetailsEditor } from "@/components/forms/TravelerDetailsEditor";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Booking, Tour, TravelerDetail } from "@/lib/types";

const copyByLocale = {
  mn: {
    priceOnRequest: "Үнэ хүсэлтээр",
    created: (reference: string) => `Захиалга ${reference} дугаартайгаар амжилттай үүслээ.`,
    createFailed: "Захиалга үүсгэхэд алдаа гарлаа.",
    gateTitle: "Онлайн захиалга",
    gateBody:
      "Захиалга, төлбөр, хадгалсан аялал болон дэмжлэгийн түүхээ нэг дороос удирдахын тулд эхлээд нэвтэрнэ үү.",
    login: "Нэвтрэх",
    register: "Бүртгүүлэх",
    formTitle: "Онлайн захиалга",
    basePrice: (price: string) => `Энэ аяллын суурь үнэ: ${price}`,
    travelerName: "Аялагчийн нэр",
    email: "И-мэйл",
    phone: "Утас / WhatsApp",
    departureDate: "Явах огноо",
    participantCount: "Хүний тоо",
    note: "Тусгай хүсэлт, нэмэлт тайлбар",
    submitting: "Илгээж байна...",
    submit: "Захиалга үүсгэх",
  },
  en: {
    priceOnRequest: "Price on request",
    created: (reference: string) => `Booking ${reference} was created successfully.`,
    createFailed: "Creating the booking failed.",
    gateTitle: "Online booking",
    gateBody: "Please sign in first to manage bookings, payments, saved tours, and support history in one place.",
    login: "Sign in",
    register: "Register",
    formTitle: "Online booking",
    basePrice: (price: string) => `Base price for this tour: ${price}`,
    travelerName: "Traveler name",
    email: "Email",
    phone: "Phone / WhatsApp",
    departureDate: "Departure date",
    participantCount: "Participants",
    note: "Special requests or extra notes",
    submitting: "Submitting...",
    submit: "Create booking",
  },
  ru: {
    priceOnRequest: "Цена по запросу",
    created: (reference: string) => `Бронирование ${reference} успешно создано.`,
    createFailed: "Не удалось создать бронирование.",
    gateTitle: "Онлайн-бронирование",
    gateBody:
      "Сначала войдите, чтобы управлять бронированиями, оплатами, сохраненными турами и историей обращений в одном месте.",
    login: "Войти",
    register: "Регистрация",
    formTitle: "Онлайн-бронирование",
    basePrice: (price: string) => `Базовая цена этого тура: ${price}`,
    travelerName: "Имя путешественника",
    email: "Email",
    phone: "Телефон / WhatsApp",
    departureDate: "Дата выезда",
    participantCount: "Количество человек",
    note: "Особые пожелания и комментарии",
    submitting: "Отправка...",
    submit: "Создать бронирование",
  },
  zh: {
    priceOnRequest: "价格面议",
    created: (reference: string) => `预订 ${reference} 已创建成功。`,
    createFailed: "创建预订失败。",
    gateTitle: "在线预订",
    gateBody: "请先登录，以便在一个页面中管理预订、支付、收藏线路和支持记录。",
    login: "登录",
    register: "注册",
    formTitle: "在线预订",
    basePrice: (price: string) => `该线路基础价格：${price}`,
    travelerName: "旅客姓名",
    email: "邮箱",
    phone: "电话 / WhatsApp",
    departureDate: "出发日期",
    participantCount: "人数",
    note: "特殊需求或补充说明",
    submitting: "正在提交...",
    submit: "创建预订",
  },
} as const;

export function BookingPanel({ tour }: { tour: Tour }) {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const { user, token } = useAuth();
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [travelerDetails, setTravelerDetails] = useState<TravelerDetail[]>([]);

  const price = tour.priceAmount
    ? formatCurrency(tour.priceAmount, tour.currency || "MNT", locale)
    : tour.pricingNote || copy.priceOnRequest;

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
          note: formData.get("note"),
        }),
      });
      setState("success");
      setMessage(copy.created(booking.bookingReference));
      form.reset();
      setTravelerDetails([]);
      router.push(`/account/bookings/${booking.bookingReference}`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof ApiError ? error.message : copy.createFailed);
    } finally {
      setState("idle");
    }
  };

  if (!user) {
    return (
      <article className="card bookingGate">
        <div className="content stackMd">
          <h3>{copy.gateTitle}</h3>
          <p>{copy.gateBody}</p>
          <div className="cardActions">
            <Link className="btn primary" href={`/auth/login?redirect=/tours/${tour.slug}`}>
              {copy.login}
            </Link>
            <Link className="btn secondary" href={`/auth/register?redirect=/tours/${tour.slug}`}>
              {copy.register}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card bookingCard">
      <div className="content stackMd">
        <div>
          <h3>{copy.formTitle}</h3>
          <p className="meta">{copy.basePrice(price)}</p>
        </div>

        <form className="formGrid bookingForm" onSubmit={onSubmit}>
          <input name="travelerName" placeholder={copy.travelerName} defaultValue={user.fullName} required />
          <input name="email" type="email" placeholder={copy.email} defaultValue={user.email} required />
          <input name="phone" placeholder={copy.phone} defaultValue={user.phone} required />
          <input name="preferredDepartureDate" type="date" aria-label={copy.departureDate} required />
          <input
            name="participantCount"
            type="number"
            min="1"
            defaultValue={1}
            aria-label={copy.participantCount}
            placeholder={copy.participantCount}
            required
          />

          <div className="full">
            <TravelerDetailsEditor value={travelerDetails} onChange={setTravelerDetails} />
          </div>

          <textarea className="full" name="note" placeholder={copy.note} />
          <button className="btn primary full" type="submit" disabled={state === "submitting"}>
            {state === "submitting" ? copy.submitting : copy.submit}
          </button>
        </form>

        {message ? <p className={`inlineMessage ${state === "error" ? "error" : "success"}`}>{message}</p> : null}
      </div>
    </article>
  );
}
