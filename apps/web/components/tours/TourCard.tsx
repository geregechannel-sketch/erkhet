import Link from "next/link";
import { SaveTourButton } from "@/components/tours/SaveTourButton";
import { describeDuration, formatCurrency } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { getPublicBusinessLine } from "@/lib/tour-audience";
import { localizeTour } from "@/lib/tour-localization";
import type { Tour } from "@/lib/types";

const copyByLocale = {
  mn: {
    details: "Дэлгэрэнгүй",
    priceOnRequest: "Үнэ хүсэлтээр",
    businessLine: {
      inbound: "Монголд аялуулах",
      outbound: "Гадаад аялал",
      domestic: "Дотоод аялал",
    },
  },
  en: {
    details: "View details",
    priceOnRequest: "Price on request",
    businessLine: {
      inbound: "Mongolia inbound",
      outbound: "International trips",
      domestic: "Domestic tours",
    },
  },
  ru: {
    details: "Подробнее",
    priceOnRequest: "Цена по запросу",
    businessLine: {
      inbound: "Туры по Монголии",
      outbound: "Зарубежные поездки",
      domestic: "Внутренние туры",
    },
  },
  zh: {
    details: "查看详情",
    priceOnRequest: "价格面议",
    businessLine: {
      inbound: "蒙古入境游",
      outbound: "出境游",
      domestic: "国内游",
    },
  },
} as const;

export function TourCard({ tour, locale = "mn" }: { tour: Tour; locale?: Locale }) {
  const copy = copyByLocale[locale];
  const localizedTour = localizeTour(tour, locale);
  const price = localizedTour.priceAmount
    ? formatCurrency(localizedTour.priceAmount, localizedTour.currency || "MNT", locale)
    : localizedTour.pricingNote || copy.priceOnRequest;
  const publicBusinessLine = getPublicBusinessLine(tour);

  return (
    <article className="card tourCard">
      <img className="cover" src={localizedTour.coverImage} alt={localizedTour.title} />
      <div className="content stackMd">
        <div className="eyebrowRow">
          <span className="badge">
            {describeDuration(localizedTour.durationDays, localizedTour.durationNights, locale)}
          </span>
          <span className="meta">{copy.businessLine[publicBusinessLine]}</span>
        </div>
        <h3>{localizedTour.title}</h3>
        <p className="meta">{localizedTour.route}</p>
        <p>{localizedTour.summary}</p>
        <p className="price">{price}</p>
        <div className="cardActions">
          <Link className="btn primary" href={`/tours/${localizedTour.slug}`}>
            {copy.details}
          </Link>
          <SaveTourButton slug={localizedTour.slug} />
        </div>
      </div>
    </article>
  );
}
