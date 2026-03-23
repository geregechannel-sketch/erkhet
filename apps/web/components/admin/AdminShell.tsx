"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const adminNav = [
  { href: "/admin", label: "Хяналтын самбар" },
  { href: "/admin/tours", label: "Аяллууд" },
  { href: "/admin/users", label: "Хэрэглэгчид" },
  { href: "/admin/bookings", label: "Захиалгууд" },
  { href: "/admin/payments", label: "Төлбөрүүд" },
  { href: "/admin/reconciliation", label: "Тулгалт" },
  { href: "/admin/support", label: "Дэмжлэг" },
  { href: "/admin/service-bookings", label: "Үйлчилгээний хүсэлтүүд" }
];

function canAccessAdmin(role?: string) {
  return role && role !== "customer";
}

function isCurrent(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function getAdminLabel(email?: string) {
  if (email === "user3") return "Админ цэс";
  return "Админ удирдлага";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !canAccessAdmin(user?.role)) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user?.role]);

  if (loading || !canAccessAdmin(user?.role)) {
    return <div className="adminLoading">Админ хэсгийг ачааллаж байна...</div>;
  }

  return (
    <div className="adminShell">
      <aside className="adminSidebar roleShellCard adminRoleCard">
        <div className="adminBrand roleSidebarHeader">
          <p className="meta roleSidebarLabel">{getAdminLabel(user?.email)}</p>
          <h2>Erkhet Admin</h2>
          <p className="meta">{user?.role}</p>
        </div>

        <nav className="adminNav roleSidebarNav">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className={isCurrent(pathname, item.href) ? "current" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="roleSidebarSummary adminSidebarSummary">
          <p>Аялал, хэрэглэгч, захиалга, төлбөр, тулгалт, дэмжлэгийн урсгалуудыг энэ дотоод цэснээс удирдана.</p>
          <div className="miniButtonGroup">
            <Link href="/stats" className="miniActionLink">Статистик</Link>
            <Link href="/admin/support" className="miniActionLink">Шинэ хүсэлтүүд</Link>
          </div>
        </div>

        <div className="adminSidebarFooter roleSidebarFoot">
          <Link href="/">Нийтийн сайт</Link>
          <button className="linkButton roleLogoutButton" type="button" onClick={() => void logout().then(() => router.push("/"))}>
            Гарах
          </button>
        </div>
      </aside>
      <section className="adminContent">{children}</section>
    </div>
  );
}