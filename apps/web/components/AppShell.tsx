"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (isAccountRoute) {
    return (
      <>
        {children}
        <Footer />
      </>
    );
  }

  return (
    <div className="publicShell">
      <Header />
      <div className="publicContent">
        {children}
        <Footer />
      </div>
    </div>
  );
}
