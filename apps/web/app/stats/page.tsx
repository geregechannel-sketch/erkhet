"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import type { AdminSummary } from "@/lib/types";

const emptySummary: AdminSummary = {
  totalUsers: 0,
  publishedTours: 0,
  pendingBookings: 0,
  pendingPayments: 0,
  unreconciled: 0,
  openSupportRequests: 0
};

export default function StatsPage() {
  const { user, token, loading } = useAuth();
  const [summary, setSummary] = useState<AdminSummary>(emptySummary);

  useEffect(() => {
    if (!token || !user || user.role === "customer") return;
    void browserApiFetch<AdminSummary>("/admin/summary", {
      headers: authHeaders(token)
    }).then(setSummary);
  }, [token, user]);

  if (loading) {
    return <main className="section"><div className="container panel loadingPanel">Ачааллаж байна...</div></main>;
  }

  if (!user || user.role === "customer") {
    return (
      <main>
        <section className="pageHero statsHero">
          <div className="container stackMd">
            <p className="eyebrow">Admin Only</p>
            <h1>Статистик нь зөвхөн админд харагдана</h1>
            <p>Энэ хэсэгт нэвтрэхийн тулд админ эрхтэй хэрэглэгчээр нэвтрэх шаардлагатай.</p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/auth/login?redirect=/stats">Нэвтрэх</Link>
              <Link className="btn secondary" href="/">Нүүр рүү буцах</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const items = [
    ["Нийт хэрэглэгч", summary.totalUsers],
    ["Нээлттэй аялал", summary.publishedTours],
    ["Хүлээгдэж буй захиалга", summary.pendingBookings],
    ["Хүлээгдэж буй төлбөр", summary.pendingPayments],
    ["Тулгалт шаардлагатай", summary.unreconciled],
    ["Нээлттэй support", summary.openSupportRequests]
  ] as const;

  const quickLinks = [
    { href: "/admin/bookings", label: "Захиалгууд" },
    { href: "/admin/payments", label: "Төлбөрүүд" },
    { href: "/admin/reconciliation", label: "Тулгалт" },
    { href: "/admin/support", label: "Дэмжлэг" }
  ];

  return (
    <main>
      <section className="pageHero statsHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">Executive Overview</p>
            <h1>Статистик</h1>
            <p>Аялал, хэрэглэгч, захиалга, төлбөр, support урсгалын товч үзүүлэлтүүдийг эндээс харна.</p>
          </div>
          <article className="guideSpotlight card">
            <div className="content stackSm">
              <p className="eyebrow">Quick focus</p>
              <h3>Өнөөдрийн анхаарах цэг</h3>
              <ul className="guideActionList">
                <li>Хүлээгдэж буй захиалга: {summary.pendingBookings}</li>
                <li>Хүлээгдэж буй төлбөр: {summary.pendingPayments}</li>
                <li>Тулгалт шаардлагатай мөр: {summary.unreconciled}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="grid c3 adminStats">
            {items.map(([label, value]) => (
              <article key={label} className="panel statCard statCardLarge">
                <strong>{value}</strong>
                <span>{label}</span>
              </article>
            ))}
          </div>

          <div className="statsQuickLinks">
            {quickLinks.map((item) => (
              <Link key={item.href} className="miniActionLink" href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="rowActions wrapActions">
            <Link className="btn primary" href="/admin">Админ самбар руу орох</Link>
          </div>
        </div>
      </section>
    </main>
  );
}