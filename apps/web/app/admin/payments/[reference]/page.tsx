"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Payment } from "@/lib/types";

const copyByLocale = {
  mn: {
    loading: "Ачааллаж байна...",
    booking: "Захиалга",
    user: "Хэрэглэгч",
    tour: "Аялал",
    amount: "Дүн",
    method: "Арга",
    createdAt: "Үүссэн огноо",
    statusTitle: "Төлбөрийн төлөв",
    providerReference: "Gateway reference",
    refundedAmount: "Буцаасан дүн",
    failureReason: "Алдааны тайлбар / санхүүгийн тэмдэглэл",
    save: "Шинэчлэх",
    updated: "Төлбөр шинэчлэгдлээ.",
    updateFailed: "Төлбөр шинэчлэхэд алдаа гарлаа.",
  },
  en: {
    loading: "Loading...",
    booking: "Booking",
    user: "User",
    tour: "Tour",
    amount: "Amount",
    method: "Method",
    createdAt: "Created",
    statusTitle: "Payment status",
    providerReference: "Gateway reference",
    refundedAmount: "Refunded amount",
    failureReason: "Failure reason / finance note",
    save: "Save",
    updated: "Payment updated.",
    updateFailed: "Failed to update payment.",
  },
  ru: {
    loading: "Загрузка...",
    booking: "Бронирование",
    user: "Пользователь",
    tour: "Тур",
    amount: "Сумма",
    method: "Способ",
    createdAt: "Создано",
    statusTitle: "Статус платежа",
    providerReference: "Ссылка шлюза",
    refundedAmount: "Сумма возврата",
    failureReason: "Причина ошибки / примечание финансового отдела",
    save: "Сохранить",
    updated: "Платёж обновлён.",
    updateFailed: "Не удалось обновить платёж.",
  },
  zh: {
    loading: "加载中...",
    booking: "预订",
    user: "用户",
    tour: "线路",
    amount: "金额",
    method: "支付方式",
    createdAt: "创建时间",
    statusTitle: "支付状态",
    providerReference: "渠道参考号",
    refundedAmount: "退款金额",
    failureReason: "失败原因 / 财务备注",
    save: "保存",
    updated: "支付已更新。",
    updateFailed: "更新支付失败。",
  },
} as const;

type MessageTone = "success" | "error";

export default function AdminPaymentDetailPage() {
  const params = useParams<{ reference: string }>();
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [payment, setPayment] = useState<Payment | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadPayment = async () => {
    if (!token || !params.reference) return;
    const next = await browserApiFetch<Payment>(`/admin/payments/${params.reference}`, {
      headers: authHeaders(token),
    });
    setPayment(next);
  };

  useEffect(() => {
    void loadPayment();
  }, [params.reference, token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !params.reference) return;
    const formData = new FormData(event.currentTarget);
    try {
      await browserApiFetch(`/admin/payments/${params.reference}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          status: formData.get("status"),
          providerReference: formData.get("providerReference"),
          failureReason: formData.get("failureReason"),
          refundedAmount: Number(formData.get("refundedAmount") || 0),
        }),
      });
      setMessageTone("success");
      setMessage(copy.updated);
      await loadPayment();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
    }
  };

  if (!payment) {
    return <div className="panel loadingPanel">{copy.loading}</div>;
  }

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{payment.paymentReference}</h1></div>
      <section className="panel stackMd">
        <p><strong>{copy.booking}:</strong> {payment.bookingReference}</p>
        <p><strong>{copy.user}:</strong> {payment.userName}</p>
        <p><strong>{copy.tour}:</strong> {payment.tourTitle}</p>
        <p><strong>{copy.amount}:</strong> {formatCurrency(payment.amount, payment.currency, locale)}</p>
        <p><strong>{copy.method}:</strong> {payment.method}</p>
        <p><strong>{copy.createdAt}:</strong> {formatDate(payment.createdAt, locale)}</p>
      </section>
      <section className="panel stackMd">
        <h2>{copy.statusTitle}</h2>
        <form className="stackMd" onSubmit={onSubmit}>
          <select name="status" defaultValue={payment.status}>
            <option value="pending">{formatPaymentStatus("pending", locale)}</option>
            <option value="paid">{formatPaymentStatus("paid", locale)}</option>
            <option value="failed">{formatPaymentStatus("failed", locale)}</option>
            <option value="cancelled">{formatPaymentStatus("cancelled", locale)}</option>
            <option value="refunded">{formatPaymentStatus("refunded", locale)}</option>
            <option value="partially_refunded">{formatPaymentStatus("partially_refunded", locale)}</option>
          </select>
          <input name="providerReference" defaultValue={payment.providerReference || ""} placeholder={copy.providerReference} />
          <input name="refundedAmount" type="number" min="0" step="0.01" defaultValue={payment.refundedAmount} placeholder={copy.refundedAmount} />
          <textarea name="failureReason" defaultValue={payment.failureReason || ""} placeholder={copy.failureReason} />
          <button className="btn primary" type="submit">{copy.save}</button>
        </form>
        {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
      </section>
    </div>
  );
}
