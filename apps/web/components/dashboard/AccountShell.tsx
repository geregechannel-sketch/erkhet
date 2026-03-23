"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const accountNav = [
  { href: "/account", label: "Миний мэдээлэл" },
  { href: "/account/saved", label: "Хадгалсан аяллууд" },
  { href: "/account/bookings", label: "Миний захиалгууд" },
  { href: "/account/payments", label: "Төлбөр / Баримт" },
  { href: "/account/support", label: "Дэмжлэг / Хүсэлт" },
];

function isCurrent(pathname: string, href: string) {
  return href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function getAccountMenuLabel(email: string) {
  if (email === "user2") return "Бүртгэлтэй хэрэглэгчийн цэс";
  return "Хэрэглэгчийн цэс";
}

function getAccountSummary(email: string) {
  if (email === "user2") {
    return "Энэ demo хэрэглэгч дээр хадгалсан аялал, захиалга, төлбөр, дэмжлэгийн түүх seed өгөгдөлтэйгээр харагдана.";
  }
  return "Хадгалсан аялал, захиалга, төлбөр, дэмжлэгийн түүхээ энэ цэснээс нэгтгэж удирдана.";
}

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading || !user) {
    return (
      <main className="dashboardPage">
        <div className="container panel loadingPanel">Ачааллаж байна...</div>
      </main>
    );
  }

  return (
    <main className="dashboardPage">
      <div className="container dashboardLayout">
        <aside className="sidePanel roleShellCard">
          <div className="sidePanelHeader roleSidebarHeader">
            <p className="meta roleSidebarLabel">{getAccountMenuLabel(user.email)}</p>
            <h2>{user.fullName}</h2>
            <p className="meta">{user.email}</p>
          </div>

          <nav className="sideNav roleSidebarNav">
            {accountNav.map((item) => (
              <Link key={item.href} href={item.href} className={isCurrent(pathname, item.href) ? "current" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="roleSidebarSummary">
            <p>{getAccountSummary(user.email)}</p>
            <div className="miniButtonGroup">
              <Link href="/booking-payment" className="miniActionLink">Захиалга / Төлбөр</Link>
              <Link href="/travel-guide" className="miniActionLink">Аяллын гарын авлага</Link>
            </div>
          </div>

          <div className="roleSidebarFoot">
            <Link href="/">Нийтийн сайт</Link>
            <button className="linkButton roleLogoutButton" type="button" onClick={() => void logout().then(() => router.push("/"))}>
              Гарах
            </button>
          </div>
        </aside>
        <section className="dashboardContent">{children}</section>
      </div>
    </main>
  );
}
