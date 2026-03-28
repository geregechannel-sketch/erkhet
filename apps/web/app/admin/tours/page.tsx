"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatBusinessLine, formatCurrency, formatOperationType, formatTourKind, formatTourStatus } from "@/lib/format";
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
  sortOrder: 100,
};

const copyByLocale = {
  mn: {
    title: "Аяллууд",
    editTitle: "Аялал засах",
    createTitle: "Шинэ аялал нэмэх",
    titleField: "Гарчиг",
    slugField: "Slug (сонголтоор)",
    summaryField: "Товч тайлбар",
    descriptionField: "Дэлгэрэнгүй тайлбар",
    routeField: "Маршрут",
    coverImageField: "Cover image URL",
    daysField: "Өдөр",
    nightsField: "Шөнө",
    priceField: "Үнэ",
    currencyField: "Валют",
    pricingNoteField: "Үнийн тэмдэглэл",
    capacityField: "Багтаамж",
    availabilityField: "Боломжит тоо",
    sortOrderField: "Дараалал",
    featuredField: "Онцлох",
    departureDatesField: "Гарах огноонууд, мөр бүрт нэг",
    itineraryField: "Итinerary, мөр бүрт нэг",
    inclusionsField: "Багтсан зүйлс, мөр бүрт нэг",
    exclusionsField: "Багтаагүй зүйлс, мөр бүрт нэг",
    saveNew: "Үүсгэх",
    saveEdit: "Шинэчлэх",
    reset: "Цэвэрлэх",
    inventory: "Аяллын жагсаалт",
    edit: "Засах",
    remove: "Устгах",
    updated: "Аялал шинэчлэгдлээ.",
    created: "Шинэ аялал үүслээ.",
    saveFailed: "Аялал хадгалахад алдаа гарлаа.",
    deleted: "Аялал устгагдлаа.",
    deleteFailed: "Аялал устгахад алдаа гарлаа.",
  },
  en: {
    title: "Tours",
    editTitle: "Edit tour",
    createTitle: "Create a new tour",
    titleField: "Title",
    slugField: "Slug (optional)",
    summaryField: "Summary",
    descriptionField: "Description",
    routeField: "Route",
    coverImageField: "Cover image URL",
    daysField: "Days",
    nightsField: "Nights",
    priceField: "Price amount",
    currencyField: "Currency",
    pricingNoteField: "Pricing note",
    capacityField: "Capacity",
    availabilityField: "Available slots",
    sortOrderField: "Sort order",
    featuredField: "Featured",
    departureDatesField: "Departure dates, one per line",
    itineraryField: "Itinerary, one per line",
    inclusionsField: "Inclusions, one per line",
    exclusionsField: "Exclusions, one per line",
    saveNew: "Create",
    saveEdit: "Update",
    reset: "Reset",
    inventory: "Tour inventory",
    edit: "Edit",
    remove: "Delete",
    updated: "Tour updated.",
    created: "New tour created.",
    saveFailed: "Failed to save tour.",
    deleted: "Tour deleted.",
    deleteFailed: "Failed to delete tour.",
  },
  ru: {
    title: "Туры",
    editTitle: "Редактировать тур",
    createTitle: "Создать новый тур",
    titleField: "Название",
    slugField: "Slug (необязательно)",
    summaryField: "Краткое описание",
    descriptionField: "Полное описание",
    routeField: "Маршрут",
    coverImageField: "URL обложки",
    daysField: "Дни",
    nightsField: "Ночи",
    priceField: "Цена",
    currencyField: "Валюта",
    pricingNoteField: "Примечание по цене",
    capacityField: "Вместимость",
    availabilityField: "Доступно мест",
    sortOrderField: "Порядок сортировки",
    featuredField: "Рекомендуемый",
    departureDatesField: "Даты выезда, по одной в строке",
    itineraryField: "Маршрут, по одному пункту в строке",
    inclusionsField: "Включено, по одному пункту в строке",
    exclusionsField: "Не включено, по одному пункту в строке",
    saveNew: "Создать",
    saveEdit: "Обновить",
    reset: "Сбросить",
    inventory: "Список туров",
    edit: "Редактировать",
    remove: "Удалить",
    updated: "Тур обновлён.",
    created: "Новый тур создан.",
    saveFailed: "Не удалось сохранить тур.",
    deleted: "Тур удалён.",
    deleteFailed: "Не удалось удалить тур.",
  },
  zh: {
    title: "线路管理",
    editTitle: "编辑线路",
    createTitle: "新增线路",
    titleField: "标题",
    slugField: "Slug（可选）",
    summaryField: "摘要",
    descriptionField: "详细描述",
    routeField: "路线",
    coverImageField: "封面图片 URL",
    daysField: "天数",
    nightsField: "晚数",
    priceField: "价格",
    currencyField: "货币",
    pricingNoteField: "价格说明",
    capacityField: "容量",
    availabilityField: "可售数量",
    sortOrderField: "排序",
    featuredField: "推荐",
    departureDatesField: "出发日期，每行一个",
    itineraryField: "行程，每行一项",
    inclusionsField: "包含内容，每行一项",
    exclusionsField: "不包含内容，每行一项",
    saveNew: "创建",
    saveEdit: "更新",
    reset: "重置",
    inventory: "线路列表",
    edit: "编辑",
    remove: "删除",
    updated: "线路已更新。",
    created: "新线路已创建。",
    saveFailed: "保存线路失败。",
    deleted: "线路已删除。",
    deleteFailed: "删除线路失败。",
  },
} as const;

type MessageTone = "success" | "error";

export default function AdminToursPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [tours, setTours] = useState<Tour[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadTours = async () => {
    if (!token) return;
    const nextTours = await browserApiFetch<Tour[]>("/admin/tours", {
      headers: authHeaders(token),
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
      sortOrder: tour.sortOrder,
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
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (editingId) {
        await browserApiFetch(`/admin/tours/${editingId}`, {
          method: "PUT",
          headers: authHeaders(token),
          body: JSON.stringify(payload),
        });
        setMessageTone("success");
        setMessage(copy.updated);
      } else {
        await browserApiFetch("/admin/tours", {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify(payload),
        });
        setMessageTone("success");
        setMessage(copy.created);
      }
      reset();
      await loadTours();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.saveFailed);
    }
  };

  const removeTour = async (id: number) => {
    if (!token) return;
    try {
      await browserApiFetch(`/admin/tours/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      setMessageTone("success");
      setMessage(copy.deleted);
      if (editingId === id) {
        reset();
      }
      await loadTours();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.deleteFailed);
    }
  };

  const businessLineOptions = useMemo(() => ["domestic", "inbound", "outbound"], []);
  const operationOptions = useMemo(() => ["scheduled", "custom"], []);
  const tourKindOptions = useMemo(() => ["multi_day", "day_tour"], []);
  const statusOptions = useMemo(() => ["draft", "published", "archived"], []);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{copy.title}</h1></div>
      {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
      <div className="adminTwoCol">
        <section className="panel stackMd">
          <h2>{editingId ? copy.editTitle : copy.createTitle}</h2>
          <form className="formGrid" onSubmit={onSubmit}>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={copy.titleField} required />
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder={copy.slugField} />
            <input className="full" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder={copy.summaryField} required />
            <textarea className="full" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={copy.descriptionField} required />
            <select value={form.businessLine} onChange={(event) => setForm({ ...form, businessLine: event.target.value })}>
              {businessLineOptions.map((option) => (
                <option key={option} value={option}>{formatBusinessLine(option, locale)}</option>
              ))}
            </select>
            <select value={form.operationType} onChange={(event) => setForm({ ...form, operationType: event.target.value })}>
              {operationOptions.map((option) => (
                <option key={option} value={option}>{formatOperationType(option, locale)}</option>
              ))}
            </select>
            <select value={form.tourKind} onChange={(event) => setForm({ ...form, tourKind: event.target.value })}>
              {tourKindOptions.map((option) => (
                <option key={option} value={option}>{formatTourKind(option, locale)}</option>
              ))}
            </select>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{formatTourStatus(option, locale)}</option>
              ))}
            </select>
            <input value={form.route} onChange={(event) => setForm({ ...form, route: event.target.value })} placeholder={copy.routeField} />
            <input value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} placeholder={copy.coverImageField} />
            <input type="number" min="1" value={form.durationDays} onChange={(event) => setForm({ ...form, durationDays: Number(event.target.value) })} placeholder={copy.daysField} />
            <input type="number" min="0" value={form.durationNights} onChange={(event) => setForm({ ...form, durationNights: Number(event.target.value) })} placeholder={copy.nightsField} />
            <input value={form.priceAmount} onChange={(event) => setForm({ ...form, priceAmount: event.target.value })} placeholder={copy.priceField} />
            <input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} placeholder={copy.currencyField} />
            <input className="full" value={form.pricingNote} onChange={(event) => setForm({ ...form, pricingNote: event.target.value })} placeholder={copy.pricingNoteField} />
            <input type="number" min="1" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })} placeholder={copy.capacityField} />
            <input type="number" min="0" value={form.availabilityCount} onChange={(event) => setForm({ ...form, availabilityCount: Number(event.target.value) })} placeholder={copy.availabilityField} />
            <input type="number" min="0" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} placeholder={copy.sortOrderField} />
            <label className="checkboxLabel"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> {copy.featuredField}</label>
            <textarea className="full" value={form.departureDates} onChange={(event) => setForm({ ...form, departureDates: event.target.value })} placeholder={copy.departureDatesField} />
            <textarea className="full" value={form.itinerary} onChange={(event) => setForm({ ...form, itinerary: event.target.value })} placeholder={copy.itineraryField} />
            <textarea value={form.inclusions} onChange={(event) => setForm({ ...form, inclusions: event.target.value })} placeholder={copy.inclusionsField} />
            <textarea value={form.exclusions} onChange={(event) => setForm({ ...form, exclusions: event.target.value })} placeholder={copy.exclusionsField} />
            <div className="cardActions full">
              <button className="btn primary" type="submit">{editingId ? copy.saveEdit : copy.saveNew}</button>
              {editingId ? <button className="btn secondary" type="button" onClick={reset}>{copy.reset}</button> : null}
            </div>
          </form>
        </section>

        <section className="panel stackMd">
          <h2>{copy.inventory}</h2>
          <div className="stackSm">
            {tours.map((tour) => (
              <article key={tour.id} className="listRow">
                <div>
                  <strong>{tour.title}</strong>
                  <p className="meta">{formatTourStatus(tour.status, locale)} • {formatCurrency(tour.priceAmount, tour.currency || "MNT", locale) || tour.pricingNote}</p>
                </div>
                <div className="rowActions">
                  <button className="btn secondary" type="button" onClick={() => startEdit(tour)}>{copy.edit}</button>
                  <button className="btn secondary" type="button" onClick={() => void removeTour(tour.id)}>{copy.remove}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
