"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getSupportAutoReply, getSupportRequestAutoReply, supportStatusLabels, supportTypeLabels } from "@/lib/support-copy";
import type { Booking, SupportRequest } from "@/lib/types";

const copyByLocale = {
  mn: {
    title: "Санал хүсэлт",
    formTitle: "Хүсэлт илгээх",
    intro: "Та бидэнд асуулт, санал, гомдлоо илгээж болно. Автомат хариу шууд бүртгэгдэж, манай баг дараагийн шатанд холбогдоно.",
    bookingPlaceholder: "Холбогдох захиалга сонгоогүй",
    subject: "Гарчиг",
    message: "Тайлбар",
    submit: "Илгээх",
    success: "Таны хүсэлтийг амжилттай хүлээн авлаа.",
    error: "Хүсэлт илгээхэд алдаа гарлаа.",
    autoReplyTitle: "Автомат хариу",
    referenceLabel: "Лавлагааны дугаар",
    empty: "Одоогоор илгээсэн хүсэлт алга.",
    linkedBooking: "Холбогдох захиалга",
    statusLabel: "Төлөв",
  },
  en: {
    title: "Support requests",
    formTitle: "Send a request",
    intro: "Send us your question, feedback, or complaint. An automatic reply is logged right away and our team follows up next.",
    bookingPlaceholder: "No linked booking",
    subject: "Subject",
    message: "Message",
    submit: "Send",
    success: "Your request has been received successfully.",
    error: "Failed to send your request.",
    autoReplyTitle: "Automatic reply",
    referenceLabel: "Reference",
    empty: "No support requests yet.",
    linkedBooking: "Linked booking",
    statusLabel: "Status",
  },
  ru: {
    title: "Обращения",
    formTitle: "Отправить запрос",
    intro: "Вы можете отправить нам вопрос, отзыв или жалобу. Автоответ фиксируется сразу, затем с вами свяжется наша команда.",
    bookingPlaceholder: "Без связанного бронирования",
    subject: "Тема",
    message: "Сообщение",
    submit: "Отправить",
    success: "Ваш запрос успешно получен.",
    error: "Не удалось отправить запрос.",
    autoReplyTitle: "Автоответ",
    referenceLabel: "Номер обращения",
    empty: "Пока нет отправленных запросов.",
    linkedBooking: "Связанное бронирование",
    statusLabel: "Статус",
  },
  zh: {
    title: "支持请求",
    formTitle: "提交请求",
    intro: "您可以向我们发送问题、反馈或投诉。系统会立即记录自动回复，随后由团队继续跟进。",
    bookingPlaceholder: "未选择关联预订",
    subject: "主题",
    message: "说明",
    submit: "发送",
    success: "您的请求已成功提交。",
    error: "发送请求失败。",
    autoReplyTitle: "自动回复",
    referenceLabel: "请求编号",
    empty: "暂时还没有提交记录。",
    linkedBooking: "关联预订",
    statusLabel: "状态",
  },
} as const;

type MessageTone = "success" | "error";

export default function SupportPage() {
  const { user, token } = useAuth();
  const { locale } = useLocale();
  const copy = useMemo(() => copyByLocale[locale], [locale]);
  const typeLabels = useMemo(() => supportTypeLabels[locale], [locale]);
  const statusLabels = useMemo(() => supportStatusLabels[locale], [locale]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");
  const [lastSubmitted, setLastSubmitted] = useState<SupportRequest | null>(null);

  const loadData = async () => {
    if (!token) return;
    const [nextRequests, nextBookings] = await Promise.all([
      browserApiFetch<SupportRequest[]>("/me/support-requests", {
        headers: authHeaders(token),
      }),
      browserApiFetch<Booking[]>("/me/bookings", { headers: authHeaders(token) }),
    ]);
    setRequests(nextRequests);
    setBookings(nextBookings);
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    const formData = new FormData(event.currentTarget);

    try {
      const created = await browserApiFetch<SupportRequest>("/support-requests", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          type: formData.get("type"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          bookingReference: formData.get("bookingReference"),
          customerName: user?.fullName,
          customerEmail: user?.email,
          customerPhone: user?.phone,
          locale,
        }),
      });
      event.currentTarget.reset();
      setLastSubmitted(created);
      await loadData();
      setMessageTone("success");
      setMessage(copy.success);
    } catch (error) {
      setLastSubmitted(null);
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.error);
    }
  };

  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <h1>{copy.title}</h1>
      </div>

      <article className="panel stackMd">
        <h2>{copy.formTitle}</h2>
        <p className="meta">{copy.intro}</p>
        <form className="formGrid" onSubmit={onSubmit}>
          <select name="type" defaultValue="support">
            <option value="support">{typeLabels.support}</option>
            <option value="feedback">{typeLabels.feedback}</option>
            <option value="complaint">{typeLabels.complaint}</option>
          </select>
          <select name="bookingReference" defaultValue="">
            <option value="">{copy.bookingPlaceholder}</option>
            {bookings.map((booking) => (
              <option key={booking.bookingReference} value={booking.bookingReference}>
                {booking.tourTitle}
              </option>
            ))}
          </select>
          <input className="full" name="subject" placeholder={copy.subject} required />
          <textarea className="full" name="message" placeholder={copy.message} required />
          <button className="btn primary full" type="submit">
            {copy.submit}
          </button>
        </form>
      </article>

      {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}

      {lastSubmitted ? (
        <article className="panel stackSm">
          <p className="eyebrow">{copy.autoReplyTitle}</p>
          <p className="meta">
            <strong>{copy.referenceLabel}:</strong> {lastSubmitted.supportReference}
          </p>
          <p>{getSupportRequestAutoReply(locale, lastSubmitted)}</p>
        </article>
      ) : null}

      <div className="stackMd">
        {requests.length === 0 ? (
          <article className="panel emptyState">{copy.empty}</article>
        ) : (
          requests.map((request) => (
            <article key={request.supportReference} className="panel stackSm">
              <div className="sectionHeading compact">
                <div>
                  <h2>{request.subject}</h2>
                  <p className="meta">
                    {typeLabels[request.type]} • {statusLabels[request.status]} • {formatDate(request.createdAt, locale)}
                  </p>
                </div>
              </div>
              <p>{request.message}</p>
              <p className="meta">
                <strong>{copy.referenceLabel}:</strong> {request.supportReference}
              </p>
              {request.bookingReference ? (
                <p className="meta">
                  <strong>{copy.linkedBooking}:</strong> {request.bookingReference}
                </p>
              ) : null}
              <p className="meta">
                <strong>{copy.statusLabel}:</strong> {statusLabels[request.status]}
              </p>
              {(request.events ?? []).filter((event) => event.eventType !== "created").map((event) => (
                <article key={event.id} className="panel stackSm">
                  <div className="rowActions spread">
                    <strong>{event.eventType === "auto_reply" ? copy.autoReplyTitle : event.actorLabel}</strong>
                    <span className="meta">{formatDate(event.createdAt, locale)}</span>
                  </div>
                  <p>{event.eventType === "auto_reply" ? getSupportAutoReply(locale, request.type) : event.message}</p>
                </article>
              ))}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
