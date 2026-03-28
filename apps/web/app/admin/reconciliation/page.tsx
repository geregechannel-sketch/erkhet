"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatPaymentStatus, formatReconciliationState } from "@/lib/format";
import type { Booking, ReconciliationItem } from "@/lib/types";

const copyByLocale = {
  mn: {
    title: "Тулгалт / Санхүү",
    updated: (reference: string) => `${reference} тулгалтын тэмдэглэл шинэчлэгдлээ.`,
    updateFailed: "Review шинэчлэхэд алдаа гарлаа.",
    expected: "Хүлээгдэх дүн",
    paid: "Төлөгдсөн",
    outstanding: "Үлдэгдэл",
    paymentStatus: "Төлбөрийн төлөв",
    review: "Шалгах жагсаалтад нэмэх",
    note: "Санхүүгийн тэмдэглэл",
    save: "Хадгалах",
  },
  en: {
    title: "Reconciliation / Finance",
    updated: (reference: string) => `Reconciliation review for ${reference} was updated.`,
    updateFailed: "Failed to update review.",
    expected: "Expected",
    paid: "Paid",
    outstanding: "Outstanding",
    paymentStatus: "Payment status",
    review: "Mark for review",
    note: "Finance note",
    save: "Save",
  },
  ru: {
    title: "Сверка / Финансы",
    updated: (reference: string) => `Проверка сверки для ${reference} обновлена.`,
    updateFailed: "Не удалось обновить проверку.",
    expected: "Ожидаемая сумма",
    paid: "Оплачено",
    outstanding: "Остаток",
    paymentStatus: "Статус платежа",
    review: "Отметить для проверки",
    note: "Примечание финансового отдела",
    save: "Сохранить",
  },
  zh: {
    title: "对账 / 财务",
    updated: (reference: string) => `${reference} 的对账备注已更新。`,
    updateFailed: "更新审核信息失败。",
    expected: "应收金额",
    paid: "已支付",
    outstanding: "未结金额",
    paymentStatus: "支付状态",
    review: "标记为需复核",
    note: "财务备注",
    save: "保存",
  },
} as const;

type MessageTone = "success" | "error";

export default function AdminReconciliationPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadItems = async () => {
    if (!token) return;
    const nextItems = await browserApiFetch<ReconciliationItem[]>("/admin/reconciliation", {
      headers: authHeaders(token),
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
          reviewNote: formData.get("reviewNote"),
        }),
      });
      setMessageTone("success");
      setMessage(copy.updated(bookingReference));
      await loadItems();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
    }
  };

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{copy.title}</h1></div>
      {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
      <div className="stackMd">
        {items.map((item) => (
          <article key={item.bookingReference} className="panel stackSm">
            <div className="sectionHeading compact">
              <div>
                <h2>{item.bookingReference}</h2>
                <p className="meta">{item.userName} • {item.tourTitle} • {formatDate(item.createdAt, locale)}</p>
              </div>
              <strong>{formatReconciliationState(item.state, locale)}</strong>
            </div>
            <div className="detailMetaGrid">
              <div><strong>{copy.expected}</strong><p>{formatCurrency(item.expectedAmount, item.currency, locale)}</p></div>
              <div><strong>{copy.paid}</strong><p>{formatCurrency(item.paidAmount, item.currency, locale)}</p></div>
              <div><strong>{copy.outstanding}</strong><p>{formatCurrency(item.outstanding, item.currency, locale)}</p></div>
              <div><strong>{copy.paymentStatus}</strong><p>{formatPaymentStatus(item.paymentStatus, locale)}</p></div>
            </div>
            <form className="stackSm" onSubmit={(event) => void updateReview(event, item.bookingReference)}>
              <label className="checkboxLabel"><input name="reviewFlag" type="checkbox" defaultChecked={item.reviewFlag} /> {copy.review}</label>
              <textarea name="reviewNote" defaultValue={item.reviewNote || ""} placeholder={copy.note} />
              <button className="btn secondary" type="submit">{copy.save}</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
