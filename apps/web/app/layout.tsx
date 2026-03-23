import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/AppShell";
import { LocaleProvider } from "@/components/locale/LocaleProvider";
import { getRequestLocale } from "@/lib/request-locale";

export const metadata: Metadata = {
  title: "Erkhet Solar Tours LLC",
  description: "Монголын inbound, outbound, domestic аяллын нэгдсэн платформ"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale}>
      <body>
        <LocaleProvider initialLocale={locale}>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}