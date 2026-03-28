"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { supportStatusLabels, supportTypeLabels } from "@/lib/support-copy";
import type { SupportRequest } from "@/lib/types";

const copyByLocale = {
  mn: {
    loading: "Ачааллаж байна...",
    reference: "Reference",
    customer: "Хэрэглэгч",
    type: "Төрөл",
    status: "Төлөв",
    booking: "Захиалга",
    tour: "Аялал",
    message: "Тайлбар",
    workflowTitle: "Workflow шинэчлэх",
    adminNote: "Дотоод тэмдэглэл",
    save: "Шинэчлэх",
    timeline: "Timeline",
    updated: "Support request шинэчлэгдлээ.",
    updateFailed: "Support request шинэчлэхэд алдаа гарлаа.",
  },
  en: {
    loading: "Loading...",
    reference: "Reference",
    customer: "Customer",
    type: "Type",
    status: "Status",
    booking: "Booking",
    tour: "Tour",
    message: "Message",
    workflowTitle: "Update workflow",
    adminNote: "Internal note",
    save: "Save",
    timeline: "Timeline",
    updated: "Support request updated.",
    updateFailed: "Failed to update support request.",
  },
  ru: {
    loading: "Загрузка...",
    reference: "Номер",
    customer: "Клиент",
    type: "Тип",
    status: "Статус",
    booking: "Бронирование",
    tour: "Тур",
    message: "Сообщение",
    workflowTitle: "Обновить процесс",
    adminNote: "Внутреннее примечание",
    save: "Сохранить",
    timeline: "История",
    updated: "Обращение обновлено.",
    updateFailed: "Не удалось обновить обращение.",
  },
  zh: {
    loading: "加载中...",
    reference: "编号",
    customer: "客户",
    type: "类型",
    status: "状态",
    booking: "预订",
    tour: "线路",
    message: "说明",
    workflowTitle: "更新流程",
    adminNote: "内部备注",
    save: "保存",
    timeline: "时间线",
    updated: "支持请求已更新。",
    updateFailed: "更新支持请求失败。",
  },
} as const;

type MessageTone = "success" | "error";

export default function AdminSupportDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const typeLabels = useMemo(() => supportTypeLabels[locale], [locale]);
  const statusLabels = useMemo(() => supportStatusLabels[locale], [locale]);
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadRequest = async () => {
    if (!token || !params.reference) return;
    const next = await browserApiFetch<SupportRequest>(`/admin/support-requests/${params.reference}`, {
      headers: authHeaders(token),
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
          adminNote: formData.get("adminNote"),
        }),
      });
      setMessageTone("success");
      setMessage(copy.updated);
      await loadRequest();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
    }
  };

  if (!request) {
    return <div className="panel loadingPanel">{copy.loading}</div>;
  }

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{request.subject}</h1></div>
      <section className="panel stackMd">
        <p><strong>{copy.reference}:</strong> {request.supportReference}</p>
        <p><strong>{copy.customer}:</strong> {request.customerName} • {request.customerEmail} • {request.customerPhone}</p>
        <p><strong>{copy.type}:</strong> {typeLabels[request.type]}</p>
        <p><strong>{copy.status}:</strong> {statusLabels[request.status]}</p>
        {request.bookingReference ? <p><strong>{copy.booking}:</strong> {request.bookingReference}</p> : null}
        {request.tourTitle ? <p><strong>{copy.tour}:</strong> {request.tourTitle}</p> : null}
        <p><strong>{copy.message}:</strong> {request.message}</p>
      </section>
      <section className="panel stackMd">
        <h2>{copy.workflowTitle}</h2>
        <form className="stackMd" onSubmit={onSubmit}>
          <select name="status" defaultValue={request.status}>
            <option value="new">{statusLabels.new}</option>
            <option value="in_review">{statusLabels.in_review}</option>
            <option value="resolved">{statusLabels.resolved}</option>
            <option value="closed">{statusLabels.closed}</option>
          </select>
          <textarea name="adminNote" defaultValue={request.adminNote || ""} placeholder={copy.adminNote} />
          <button className="btn primary" type="submit">{copy.save}</button>
        </form>
        {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
      </section>
      <section className="panel stackMd">
        <h2>{copy.timeline}</h2>
        {request.events?.map((event) => (
          <article key={event.id} className="timelineItem">
            <strong>{event.eventType}</strong>
            <p>{event.message}</p>
            <span className="meta">{event.actorLabel} • {formatDate(event.createdAt, locale)}</span>
          </article>
        ))}
      </section>
    </div>
  );
}
