import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { OutboundDestination } from "@/lib/outbound-destinations";

const copyByLocale: Record<
  Locale,
  {
    businessLabel: string;
    cta: string;
  }
> = {
  mn: {
    businessLabel: "Монголчуудад гадаад аялал",
    cta: "Чиглэл үзэх",
  },
  en: {
    businessLabel: "International trips",
    cta: "View trip",
  },
  ru: {
    businessLabel: "Зарубежные поездки",
    cta: "Открыть",
  },
  zh: {
    businessLabel: "出境旅行",
    cta: "查看线路",
  },
};

export function OutboundDestinationCard({
  destination,
  locale,
  current = false,
}: {
  destination: OutboundDestination;
  locale: Locale;
  current?: boolean;
}) {
  const copy = copyByLocale[locale];

  return (
    <article className={`card tourCard outboundDestinationCard${current ? " current" : ""}`}>
      <img className="cover" src={destination.image} alt={destination.title[locale]} />
      <div className="content stackMd">
        <div className="eyebrowRow">
          <span className="badge">{destination.country[locale]}</span>
          <span className="meta">{copy.businessLabel}</span>
        </div>
        <h3>{destination.title[locale]}</h3>
        <p className="meta">{destination.route[locale]}</p>
        <p>{destination.summary[locale]}</p>
        <div className="cardActions">
          <Link className="btn primary" href={destination.href}>
            {copy.cta}
          </Link>
        </div>
      </div>
    </article>
  );
}
