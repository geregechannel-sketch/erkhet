"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate, formatServiceBookingStatus, formatServiceType } from "@/lib/format";
import type { ServiceBooking } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Үйл ажиллагаа",
    title: "Үйлчилгээний хүсэлтүүд",
    allServices: "Бүх үйлчилгээ",
    allStatuses: "Бүх төлөв",
    filter: "Шүүх",
    search: "Ref, хэрэглэгч, чиглэлээр хайх",
    empty: "Одоогоор үйлчилгээний хүсэлт алга.",
    updated: (reference: string) => `${reference} шинэчлэгдлээ.`,
    updateFailed: "Шинэчлэхэд алдаа гарлаа.",
    destination: "Чиглэл",
    dates: "Огноо",
    quantity: "Тоо хэмжээ",
    contact: "Холбоо барих",
    internalNote: "Дотоод тэмдэглэл",
    saving: "Хадгалж байна...",
    save: "Шинэчлэх",
  },
  en: {
    eyebrow: "Operations",
    title: "Service requests",
    allServices: "All services",
    allStatuses: "All statuses",
    filter: "Filter",
    search: "Search by ref, user, or destination",
    empty: "No service requests yet.",
    updated: (reference: string) => `${reference} was updated.`,
    updateFailed: "Failed to update service request.",
    destination: "Destination",
    dates: "Dates",
    quantity: "Quantity",
    contact: "Contact",
    internalNote: "Internal note",
    saving: "Saving...",
    save: "Update",
  },
  ru: {
    eyebrow: "Операции",
    title: "Сервисные заявки",
    allServices: "Все услуги",
    allStatuses: "Все статусы",
    filter: "Фильтр",
    search: "Поиск по номеру, пользователю или направлению",
    empty: "Пока нет сервисных заявок.",
    updated: (reference: string) => `${reference} обновлён.`,
    updateFailed: "Не удалось обновить сервисную заявку.",
    destination: "Направление",
    dates: "Даты",
    quantity: "Количество",
    contact: "Контакт",
    internalNote: "Внутреннее примечание",
    saving: "Сохраняем...",
    save: "Обновить",
  },
  zh: {
    eyebrow: "运营",
    title: "服务请求",
    allServices: "全部服务",
    allStatuses: "全部状态",
    filter: "筛选",
    search: "按编号、用户或目的地搜索",
    empty: "目前还没有服务请求。",
    updated: (reference: string) => `${reference} 已更新。`,
    updateFailed: "更新服务请求失败。",
    destination: "目的地",
    dates: "日期",
    quantity: "数量",
    contact: "联系方式",
    internalNote: "内部备注",
    saving: "保存中...",
    save: "更新",
  },
} as const;

const statusOptions = ["new", "in_review", "quoted", "confirmed", "cancelled", "completed"] as const;
const serviceTypes = ["", "esim", "insurance"] as const;

type MessageTone = "success" | "error";

export default function AdminServiceBookingsPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [items, setItems] = useState<ServiceBooking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");
  const [savingRef, setSavingRef] = useState<string | null>(null);

  const serviceOptions = useMemo(
    () => [{ value: "", label: copy.allServices }, ...serviceTypes.filter(Boolean).map((value) => ({ value, label: formatServiceType(value, locale) }))],
    [copy.allServices, locale]
  );

  const load = async () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (serviceType) params.set("serviceType", serviceType);
    const response = await browserApiFetch<ServiceBooking[]>(`/admin/service-bookings${params.toString() ? `?${params.toString()}` : ""}`, {
      headers: authHeaders(token),
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
        body: JSON.stringify({ status: statusValue, adminNote: noteValue }),
      });
      setItems((current) => current.map((entry) => (entry.serviceReference === updated.serviceReference ? updated : entry)));
      setMessageTone("success");
      setMessage(copy.updated(updated.serviceReference));
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
    } finally {
      setSavingRef(null);
    }
  };

  return (
    <div className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
      </div>

      <section className="panel stackMd">
        <form className="rowActions" onSubmit={onFilter}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.search}
          />
          <select value={serviceType} onChange={(event) => setServiceType(event.target.value)}>
            {serviceOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">{copy.allStatuses}</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {formatServiceBookingStatus(option, locale)}
              </option>
            ))}
          </select>
          <button className="btn secondary" type="submit">
            {copy.filter}
          </button>
        </form>
        {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
      </section>

      <section className="stackMd">
        {items.length === 0 ? (
          <div className="panel">
            <p className="meta">{copy.empty}</p>
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
                <strong>{formatServiceBookingStatus(item.status, locale)}</strong>
                <span className="meta">{formatDate(item.createdAt, locale)}</span>
              </div>
            </div>

            <div className="serviceAdminSummary">
              <p>
                <strong>{copy.destination}:</strong> {item.destination}
              </p>
              <p>
                <strong>{copy.dates}:</strong> {item.travelDate}
                {item.endDate ? ` - ${item.endDate}` : ""}
              </p>
              <p>
                <strong>{copy.quantity}:</strong> {item.quantity}
              </p>
              <p>
                <strong>{copy.contact}:</strong> {item.contactName} / {item.contactPhone}
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
                    {formatServiceBookingStatus(option, locale)}
                  </option>
                ))}
              </select>
              <textarea id={`note-${item.serviceReference}`} defaultValue={item.adminNote || ""} rows={3} placeholder={copy.internalNote} />
              <button className="btn primary" type="button" disabled={savingRef === item.serviceReference} onClick={() => void onSave(item)}>
                {savingRef === item.serviceReference ? copy.saving : copy.save}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
