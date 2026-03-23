"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketTicker } from "@/components/MarketTicker";
import { useChromeMessages } from "@/components/locale/LocaleProvider";
import { siteData } from "@/lib/siteData";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const messages = useChromeMessages();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isAdmin = Boolean(user?.role && user.role !== "customer");

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      <div className="recoveredUtilityBar">
        <div className="container recoveredUtilityInner">
          <div className="recoveredTickerWrap">
            <MarketTicker />
          </div>
          <div className="recoveredUtilityControls">
            <LanguageSwitcher />
            <div className="recoveredUtilityMeta recoveredUtilityContact">
              <a href={`tel:${siteData.company.phone}`}>{siteData.company.phone}</a>
              <a href={`mailto:${siteData.company.email}`}>{siteData.company.email}</a>
            </div>
          </div>
        </div>
      </div>

      <div className="recoveredTopBar">
        <div className="container recoveredTopBarInner">
          <div className="recoveredBrandCluster">
            <Link href="/" className="brand sidebarBrand recoveredBrandLink">
              <img src={siteData.company.logo} alt="Erkhet Solar Tours logo" />
              <span>
                <strong>{siteData.company.nameMn}</strong>
                <small>{messages.brandTagline}</small>
              </span>
            </Link>
          </div>

          <div className="recoveredTopBarCta">
            <Link className="btn primary recoveredHeroCta" href="/enquire/step/1">
              {messages.goMongolia}
            </Link>
          </div>

          <div className="recoveredTopBarActions">
            {user ? <span className="meta welcomeChip">{user.fullName}</span> : null}
            {user ? (
              <Link className="btn secondary" href="/account">
                {messages.utility.myAccount}
              </Link>
            ) : (
              <Link className="btn secondary" href="/auth/login">
                {messages.utility.login}
              </Link>
            )}
            {isAdmin ? (
              <Link className="btn secondary" href="/admin">
                {messages.utility.admin}
              </Link>
            ) : null}
            <button
              className="publicSidebarToggle"
              type="button"
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
              aria-label={messages.utility.menu}
            >
              <span />
              <span />
              <span />
              <strong>{messages.utility.menu}</strong>
            </button>
          </div>
        </div>
      </div>

      <aside className={`publicSidebar recoveredSidebar${open ? " open" : ""}`}>
        <div className="publicSidebarInner">
          <section className="publicSidebarSection">
            <p className="publicSidebarLabel">{messages.utility.menu}</p>
            <nav className="publicSidebarNav">
              {messages.mainNav.map((item) => (
                <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "current" : ""}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </section>

          <section className="publicSidebarMini">
            <p className="publicSidebarLabel">{user ? messages.utility.userSection : messages.utility.guestSection}</p>
            <div className="publicSidebarMeta">
              {user ? (
                <>
                  <strong>{user.fullName}</strong>
                  <span>{user.email}</span>
                </>
              ) : (
                <>
                  <strong>{messages.utility.guestTitle}</strong>
                  <p>{messages.utility.guestPrompt}</p>
                </>
              )}
            </div>
            {user ? (
              <div className="miniButtonGroup">
                <Link href="/account" className="miniActionLink">
                  {messages.utility.myAccount}
                </Link>
                <Link href="/account/bookings" className="miniActionLink">
                  {messages.utility.myBookings}
                </Link>
                <button className="sidebarActionButton sidebarCompactButton" type="button" onClick={handleLogout}>
                  {messages.utility.logout}
                </button>
              </div>
            ) : (
              <div className="publicSidebarHint">
                <span>{messages.utility.guestPrompt}</span>
              </div>
            )}
          </section>

          {isAdmin ? (
            <section className="publicSidebarMini">
              <p className="publicSidebarLabel">{messages.utility.adminSection}</p>
              <div className="miniButtonGroup">
                <Link href="/admin" className="miniActionLink">
                  {messages.utility.adminDashboard}
                </Link>
                <Link href="/stats" className="miniActionLink">
                  {messages.utility.stats}
                </Link>
                <Link href="/admin/support" className="miniActionLink">
                  {messages.utility.requests}
                </Link>
              </div>
            </section>
          ) : null}

          <section className="publicSidebarPromo">
            <p className="eyebrow">{messages.utility.startTrip}</p>
            <h3>{messages.utility.promoTitle}</h3>
            <p className="meta">{messages.utility.promoBody}</p>
            <Link className="btn primary" href="/enquire/step/1">
              {messages.utility.promoButton}
            </Link>
          </section>
        </div>
      </aside>
    </>
  );
}
