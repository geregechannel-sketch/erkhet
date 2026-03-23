"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { chromeMessages, defaultLocale, localeCookieName, resolveLocale, type Locale } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(localeCookieName) : null;
    const next = resolveLocale(stored || initialLocale);
    if (next !== locale) {
      setLocaleState(next);
    }
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(localeCookieName, locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => setLocaleState(resolveLocale(next))
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

export function useChromeMessages() {
  const { locale } = useLocale();
  return chromeMessages[locale] ?? chromeMessages[defaultLocale];
}