"use client";

import { useChromeMessages, useLocale } from "@/components/locale/LocaleProvider";
import { localeFlags, localeLabels, supportedLocales } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const messages = useChromeMessages();

  return (
    <div className="languageSwitcher" aria-label={messages.utility.language} role="group">
      <div className="languageSwitcherButtons">
        {supportedLocales.map((code) => (
          <button
            key={code}
            type="button"
            className={`languageSwitcherButton${locale === code ? " active" : ""}`}
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            aria-label={localeLabels[code]}
            title={localeLabels[code]}
            data-locale={code}
          >
            <span className="languageSwitcherFlagEmoji" aria-hidden="true">
              {localeFlags[code]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
