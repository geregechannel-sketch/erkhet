"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate, formatPaymentStatus } from "@/lib/format";
import type { Payment } from "@/lib/types";

const copyByLocale = {
  mn: { title: "Төлбөрүүд" },
  en: { title: "Payments" },
  ru: { title: "Платежи" },
  zh: { title: "支付列表" },
} as const;

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<Payment[]>("/admin/payments", {
      headers: authHeaders(token),
    }).then(setPayments);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{copy.title}</h1></div>
      <section className="panel stackMd">
        {payments.map((payment) => (
          <article key={payment.paymentReference} className="listRow alignStart">
            <div>
              <Link href={`/admin/payments/${payment.paymentReference}`}><strong>{payment.paymentReference}</strong></Link>
              <p className="meta">{payment.bookingReference} • {payment.userName} • {payment.tourTitle}</p>
            </div>
            <div className="stackXs alignEnd">
              <strong>{formatPaymentStatus(payment.status, locale)}</strong>
              <span className="meta">{formatCurrency(payment.amount, payment.currency, locale)} • {formatDate(payment.createdAt, locale)}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
