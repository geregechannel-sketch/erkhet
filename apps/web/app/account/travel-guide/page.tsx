"use client";

import { useLocale } from "@/components/locale/LocaleProvider";
import { travelAdviceByLocale } from "@/lib/travel-advice";

export default function AccountTravelGuidePage() {
  const { locale } = useLocale();
  const advice = travelAdviceByLocale[locale];

  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <h1>{advice.title}</h1>
      </div>

      <article className="panel stackMd">
        <label className="travelAdviceLabel" htmlFor="account-travel-advice-field">
          {advice.label}
        </label>
        <textarea
          id="account-travel-advice-field"
          className="travelAdviceField"
          readOnly
          value={advice.fieldValue}
        />
      </article>
    </section>
  );
}
