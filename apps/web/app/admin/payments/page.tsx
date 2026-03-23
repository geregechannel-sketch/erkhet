"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Payment } from "@/lib/types";

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<Payment[]>("/admin/payments", {
      headers: authHeaders(token)
    }).then(setPayments);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>Payments</h1></div>
      <section className="panel stackMd">
        {payments.map((payment) => (
          <article key={payment.paymentReference} className="listRow alignStart">
            <div>
              <Link href={`/admin/payments/${payment.paymentReference}`}><strong>{payment.paymentReference}</strong></Link>
              <p className="meta">{payment.bookingReference} • {payment.userName} • {payment.tourTitle}</p>
            </div>
            <div className="stackXs alignEnd">
              <strong>{payment.status}</strong>
              <span className="meta">{formatCurrency(payment.amount, payment.currency)} • {formatDate(payment.createdAt)}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}