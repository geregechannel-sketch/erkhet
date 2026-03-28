"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { supportStatusLabels, supportTypeLabels } from "@/lib/support-copy";
import type { SupportRequest } from "@/lib/types";

const copyByLocale = {
  mn: { title: "Дэмжлэг / Гомдол" },
  en: { title: "Support / Complaints" },
  ru: { title: "Поддержка / Жалобы" },
  zh: { title: "支持 / 投诉" },
} as const;

export default function AdminSupportPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const typeLabels = useMemo(() => supportTypeLabels[locale], [locale]);
  const statusLabels = useMemo(() => supportStatusLabels[locale], [locale]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<SupportRequest[]>("/admin/support-requests", {
      headers: authHeaders(token),
    }).then(setRequests);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{copy.title}</h1></div>
      <section className="panel stackMd">
        {requests.map((request) => (
          <article key={request.supportReference} className="listRow alignStart">
            <div>
              <Link href={`/admin/support/${request.supportReference}`}><strong>{request.subject}</strong></Link>
              <p className="meta">{request.supportReference} • {request.customerName}</p>
            </div>
            <div className="stackXs alignEnd">
              <strong>{statusLabels[request.status]}</strong>
              <span className="meta">{typeLabels[request.type]} • {formatDate(request.createdAt, locale)}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
