"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { formatUserRole } from "@/lib/format";

const shellCopyByLocale = {
  mn: {
    label: "Админ удирдлага",
    title: "Erkhet Admin",
    loading: "Админ хэсгийг ачааллаж байна...",
    summary: "Аялал, хэрэглэгч, захиалга, төлбөр, тулгалт, дэмжлэгийн урсгалуудыг энэ дотоод цэснээс удирдана.",
    stats: "Статистик",
    requests: "Шинэ хүсэлтүүд",
    publicSite: "Нийтийн сайт",
    logout: "Гарах",
    nav: {
      dashboard: "Хяналтын самбар",
      tours: "Аяллууд",
      users: "Хэрэглэгчид",
      bookings: "Захиалгууд",
      payments: "Төлбөрүүд",
      reconciliation: "Тулгалт",
      support: "Дэмжлэг",
      services: "Үйлчилгээний хүсэлтүүд",
    },
  },
  en: {
    label: "Admin workspace",
    title: "Erkhet Admin",
    loading: "Loading the admin workspace...",
    summary: "Manage tours, users, bookings, payments, reconciliation, and support flows from this internal menu.",
    stats: "Statistics",
    requests: "New requests",
    publicSite: "Public site",
    logout: "Logout",
    nav: {
      dashboard: "Dashboard",
      tours: "Tours",
      users: "Users",
      bookings: "Bookings",
      payments: "Payments",
      reconciliation: "Reconciliation",
      support: "Support",
      services: "Service requests",
    },
  },
  ru: {
    label: "Админ-панель",
    title: "Erkhet Admin",
    loading: "Загружаем админ-раздел...",
    summary: "Управляйте турами, пользователями, бронированиями, платежами, сверкой и поддержкой из этого внутреннего меню.",
    stats: "Статистика",
    requests: "Новые обращения",
    publicSite: "Публичный сайт",
    logout: "Выйти",
    nav: {
      dashboard: "Панель",
      tours: "Туры",
      users: "Пользователи",
      bookings: "Бронирования",
      payments: "Платежи",
      reconciliation: "Сверка",
      support: "Поддержка",
      services: "Сервисные заявки",
    },
  },
  zh: {
    label: "管理后台",
    title: "Erkhet Admin",
    loading: "正在加载管理后台...",
    summary: "通过这个内部菜单统一管理线路、用户、预订、支付、对账和支持流程。",
    stats: "统计",
    requests: "新请求",
    publicSite: "公开网站",
    logout: "退出",
    nav: {
      dashboard: "总览",
      tours: "线路",
      users: "用户",
      bookings: "预订",
      payments: "支付",
      reconciliation: "对账",
      support: "支持",
      services: "服务请求",
    },
  },
} as const;

function canAccessAdmin(role?: string) {
  return role && role !== "customer";
}

function isCurrent(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { locale } = useLocale();
  const copy = shellCopyByLocale[locale];
  const adminNav = useMemo(
    () => [
      { href: "/admin", label: copy.nav.dashboard },
      { href: "/admin/tours", label: copy.nav.tours },
      { href: "/admin/users", label: copy.nav.users },
      { href: "/admin/bookings", label: copy.nav.bookings },
      { href: "/admin/payments", label: copy.nav.payments },
      { href: "/admin/reconciliation", label: copy.nav.reconciliation },
      { href: "/admin/support", label: copy.nav.support },
      { href: "/admin/service-bookings", label: copy.nav.services },
    ],
    [copy]
  );

  useEffect(() => {
    if (!loading && !canAccessAdmin(user?.role)) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user?.role]);

  if (loading || !canAccessAdmin(user?.role)) {
    return <div className="adminLoading">{copy.loading}</div>;
  }

  return (
    <div className="adminShell">
      <aside className="adminSidebar roleShellCard adminRoleCard">
        <div className="adminBrand roleSidebarHeader">
          <p className="meta roleSidebarLabel">{copy.label}</p>
          <h2>{copy.title}</h2>
          <p className="meta">{formatUserRole(user?.role, locale)}</p>
        </div>

        <nav className="adminNav roleSidebarNav">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className={isCurrent(pathname, item.href) ? "current" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="roleSidebarSummary adminSidebarSummary">
          <p>{copy.summary}</p>
          <div className="miniButtonGroup">
            <Link href="/stats" className="miniActionLink">{copy.stats}</Link>
            <Link href="/admin/support" className="miniActionLink">{copy.requests}</Link>
          </div>
        </div>

        <div className="adminSidebarFooter roleSidebarFoot">
          <Link href="/">{copy.publicSite}</Link>
          <button className="linkButton roleLogoutButton" type="button" onClick={() => void logout().then(() => router.push("/"))}>
            {copy.logout}
          </button>
        </div>
      </aside>
      <section className="adminContent">{children}</section>
    </div>
  );
}
