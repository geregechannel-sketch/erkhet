"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import type { AdminSummary } from "@/lib/types";

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<AdminSummary>("/admin/summary", {
      headers: authHeaders(token)
    }).then(setSummary);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">Admin overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>
      <div className="grid c3 adminStats">
        <article className="statCard"><strong>{summary?.totalUsers ?? 0}</strong><span>Users</span></article>
        <article className="statCard"><strong>{summary?.publishedTours ?? 0}</strong><span>Published tours</span></article>
        <article className="statCard"><strong>{summary?.pendingBookings ?? 0}</strong><span>Pending bookings</span></article>
        <article className="statCard"><strong>{summary?.pendingPayments ?? 0}</strong><span>Pending payments</span></article>
        <article className="statCard"><strong>{summary?.unreconciled ?? 0}</strong><span>Unreconciled</span></article>
        <article className="statCard"><strong>{summary?.openSupportRequests ?? 0}</strong><span>Open support</span></article>
      </div>
    </div>
  );
}