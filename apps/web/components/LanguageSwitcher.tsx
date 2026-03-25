"use client";

import { localeFlags, localeLabels, supportedLocales, type Locale } from "@/lib/i18n";
import { useChromeMessages, useLocale } from "@/components/locale/LocaleProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const messages = useChromeMessages();

  return (
    <div className="languageSwitcher" aria-label={messages.utility.language}>
      <span className="languageSwitcherLabel">{messages.utility.language}</span>
      <div className="languageSwitcherButtons">
        {supportedLocales.map((code) => (
          <button
            key={code}
            type="button"
            className={`languageSwitcherButton${locale === code ? " active" : ""}`}
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            title={localeLabels[code]}
          >
            <span className="languageSwitcherFlag" aria-hidden="true">{localeFlags[code]}</span>
            <span className="languageSwitcherCode">{localeLabels[code]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
