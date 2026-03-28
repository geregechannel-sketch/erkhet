"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import type { AdminSummary } from "@/lib/types";

const emptySummary: AdminSummary = {
  totalUsers: 0,
  publishedTours: 0,
  pendingBookings: 0,
  pendingPayments: 0,
  unreconciled: 0,
  openSupportRequests: 0,
};

const copyByLocale = {
  mn: {
    loading: "Ачааллаж байна...",
    adminOnlyEyebrow: "Зөвхөн админ",
    adminOnlyTitle: "Статистик нь зөвхөн админд харагдана",
    adminOnlyBody: "Энэ хэсэгт нэвтрэхийн тулд админ эрхтэй хэрэглэгчээр нэвтрэх шаардлагатай.",
    login: "Нэвтрэх",
    backHome: "Нүүр рүү буцах",
    eyebrow: "Гүйцэтгэлийн тойм",
    title: "Статистик",
    body: "Аялал, хэрэглэгч, захиалга, төлбөр, support урсгалын товч үзүүлэлтүүдийг эндээс харна.",
    focusEyebrow: "Анхаарах цэг",
    focusTitle: "Өнөөдрийн анхаарах цэг",
    pendingBookings: "Хүлээгдэж буй захиалга",
    pendingPayments: "Хүлээгдэж буй төлбөр",
    unreconciled: "Тулгалт шаардлагатай мөр",
    totalUsers: "Нийт хэрэглэгч",
    publishedTours: "Нээлттэй аялал",
    openSupport: "Нээлттэй support",
    bookings: "Захиалгууд",
    payments: "Төлбөрүүд",
    reconciliation: "Тулгалт",
    support: "Дэмжлэг",
    openAdmin: "Админ самбар руу орох",
  },
  en: {
    loading: "Loading...",
    adminOnlyEyebrow: "Admin only",
    adminOnlyTitle: "Statistics are visible to admins only",
    adminOnlyBody: "You need to sign in with an admin account to access this section.",
    login: "Sign in",
    backHome: "Back home",
    eyebrow: "Executive overview",
    title: "Statistics",
    body: "Review quick indicators for tours, users, bookings, payments, and support flows from here.",
    focusEyebrow: "Quick focus",
    focusTitle: "Items needing attention today",
    pendingBookings: "Pending bookings",
    pendingPayments: "Pending payments",
    unreconciled: "Rows needing reconciliation",
    totalUsers: "Total users",
    publishedTours: "Published tours",
    openSupport: "Open support",
    bookings: "Bookings",
    payments: "Payments",
    reconciliation: "Reconciliation",
    support: "Support",
    openAdmin: "Open admin dashboard",
  },
  ru: {
    loading: "Загрузка...",
    adminOnlyEyebrow: "Только для админов",
    adminOnlyTitle: "Статистика доступна только администраторам",
    adminOnlyBody: "Для доступа к этому разделу нужно войти под админской учётной записью.",
    login: "Войти",
    backHome: "На главную",
    eyebrow: "Краткий обзор",
    title: "Статистика",
    body: "Здесь собраны основные показатели по турам, пользователям, бронированиям, платежам и поддержке.",
    focusEyebrow: "Фокус дня",
    focusTitle: "Что важно сегодня",
    pendingBookings: "Ожидающие бронирования",
    pendingPayments: "Ожидающие платежи",
    unreconciled: "Позиции для сверки",
    totalUsers: "Всего пользователей",
    publishedTours: "Опубликованные туры",
    openSupport: "Открытая поддержка",
    bookings: "Бронирования",
    payments: "Платежи",
    reconciliation: "Сверка",
    support: "Поддержка",
    openAdmin: "Открыть админ-панель",
  },
  zh: {
    loading: "加载中...",
    adminOnlyEyebrow: "仅限管理员",
    adminOnlyTitle: "统计页仅管理员可见",
    adminOnlyBody: "您需要使用管理员账户登录后才能访问此页面。",
    login: "登录",
    backHome: "返回首页",
    eyebrow: "经营概览",
    title: "统计",
    body: "在这里查看线路、用户、预订、支付和支持流程的关键指标。",
    focusEyebrow: "重点关注",
    focusTitle: "今日需要关注的事项",
    pendingBookings: "待处理预订",
    pendingPayments: "待处理支付",
    unreconciled: "待对账记录",
    totalUsers: "总用户数",
    publishedTours: "已发布线路",
    openSupport: "未关闭支持单",
    bookings: "预订",
    payments: "支付",
    reconciliation: "对账",
    support: "支持",
    openAdmin: "进入管理后台",
  },
} as const;

export default function StatsPage() {
  const { user, token, loading } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [summary, setSummary] = useState<AdminSummary>(emptySummary);

  useEffect(() => {
    if (!token || !user || user.role === "customer") return;
    void browserApiFetch<AdminSummary>("/admin/summary", {
      headers: authHeaders(token),
    }).then(setSummary);
  }, [token, user]);

  const items = useMemo(
    () => [
      [copy.totalUsers, summary.totalUsers],
      [copy.publishedTours, summary.publishedTours],
      [copy.pendingBookings, summary.pendingBookings],
      [copy.pendingPayments, summary.pendingPayments],
      [copy.unreconciled, summary.unreconciled],
      [copy.openSupport, summary.openSupportRequests],
    ] as const,
    [copy, summary]
  );

  const quickLinks = useMemo(
    () => [
      { href: "/admin/bookings", label: copy.bookings },
      { href: "/admin/payments", label: copy.payments },
      { href: "/admin/reconciliation", label: copy.reconciliation },
      { href: "/admin/support", label: copy.support },
    ],
    [copy]
  );

  if (loading) {
    return <main className="section"><div className="container panel loadingPanel">{copy.loading}</div></main>;
  }

  if (!user || user.role === "customer") {
    return (
      <main>
        <section className="pageHero statsHero">
          <div className="container stackMd">
            <p className="eyebrow">{copy.adminOnlyEyebrow}</p>
            <h1>{copy.adminOnlyTitle}</h1>
            <p>{copy.adminOnlyBody}</p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/auth/login?redirect=/stats">{copy.login}</Link>
              <Link className="btn secondary" href="/">{copy.backHome}</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="pageHero statsHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
          </div>
          <article className="guideSpotlight card">
            <div className="content stackSm">
              <p className="eyebrow">{copy.focusEyebrow}</p>
              <h3>{copy.focusTitle}</h3>
              <ul className="guideActionList">
                <li>{copy.pendingBookings}: {summary.pendingBookings}</li>
                <li>{copy.pendingPayments}: {summary.pendingPayments}</li>
                <li>{copy.unreconciled}: {summary.unreconciled}</li>
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
            <Link className="btn primary" href="/admin">{copy.openAdmin}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
