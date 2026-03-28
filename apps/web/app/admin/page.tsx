"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import type { AdminSummary } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Админ тойм",
    title: "Хяналтын самбар",
    stats: {
      totalUsers: "Хэрэглэгчид",
      publishedTours: "Нийтэлсэн аялал",
      pendingBookings: "Хүлээгдэж буй захиалга",
      pendingPayments: "Хүлээгдэж буй төлбөр",
      unreconciled: "Тулгалт шаардлагатай",
      openSupportRequests: "Нээлттэй дэмжлэг",
    },
  },
  en: {
    eyebrow: "Admin overview",
    title: "Dashboard",
    stats: {
      totalUsers: "Users",
      publishedTours: "Published tours",
      pendingBookings: "Pending bookings",
      pendingPayments: "Pending payments",
      unreconciled: "Needs review",
      openSupportRequests: "Open support",
    },
  },
  ru: {
    eyebrow: "Обзор админки",
    title: "Панель управления",
    stats: {
      totalUsers: "Пользователи",
      publishedTours: "Опубликованные туры",
      pendingBookings: "Ожидающие бронирования",
      pendingPayments: "Ожидающие платежи",
      unreconciled: "Требуют сверки",
      openSupportRequests: "Открытая поддержка",
    },
  },
  zh: {
    eyebrow: "管理总览",
    title: "控制面板",
    stats: {
      totalUsers: "用户数",
      publishedTours: "已发布线路",
      pendingBookings: "待处理预订",
      pendingPayments: "待处理支付",
      unreconciled: "待对账",
      openSupportRequests: "未关闭支持单",
    },
  },
} as const;

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [summary, setSummary] = useState<AdminSummary | null>(null);

  useEffect(() => {
    if (!token) return;
    void browserApiFetch<AdminSummary>("/admin/summary", {
      headers: authHeaders(token),
    }).then(setSummary);
  }, [token]);

  return (
    <div className="stackLg">
      <div className="sectionHeading compact">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
      </div>
      <div className="grid c3 adminStats">
        <article className="statCard"><strong>{summary?.totalUsers ?? 0}</strong><span>{copy.stats.totalUsers}</span></article>
        <article className="statCard"><strong>{summary?.publishedTours ?? 0}</strong><span>{copy.stats.publishedTours}</span></article>
        <article className="statCard"><strong>{summary?.pendingBookings ?? 0}</strong><span>{copy.stats.pendingBookings}</span></article>
        <article className="statCard"><strong>{summary?.pendingPayments ?? 0}</strong><span>{copy.stats.pendingPayments}</span></article>
        <article className="statCard"><strong>{summary?.unreconciled ?? 0}</strong><span>{copy.stats.unreconciled}</span></article>
        <article className="statCard"><strong>{summary?.openSupportRequests ?? 0}</strong><span>{copy.stats.openSupportRequests}</span></article>
      </div>
    </div>
  );
}
