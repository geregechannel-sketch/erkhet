"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { SupportRequest } from "@/lib/types";

export default function AdminSupportPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<SupportRequest[]>("/admin/support-requests", {
      headers: authHeaders(token)
    }).then(setRequests);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>Support / Complaints</h1></div>
      <section className="panel stackMd">
        {requests.map((request) => (
          <article key={request.supportReference} className="listRow alignStart">
            <div>
              <Link href={`/admin/support/${request.supportReference}`}><strong>{request.subject}</strong></Link>
              <p className="meta">{request.supportReference} • {request.customerName}</p>
            </div>
            <div className="stackXs alignEnd">
              <strong>{request.status}</strong>
              <span className="meta">{request.type} • {formatDate(request.createdAt)}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}