import Link from "next/link";
import { SaveTourButton } from "@/components/tours/SaveTourButton";
import { describeDuration, formatCurrency } from "@/lib/format";
import { repairText } from "@/lib/text";
import { getPublicBusinessLine } from "@/lib/tour-audience";
import type { Tour } from "@/lib/types";

function businessLabel(value: Tour["businessLine"]) {
  switch (value) {
    case "inbound":
      return "Монголд аялуулах";
    case "outbound":
      return "Гадаад аялал";
    default:
      return "Дотоод аялал";
  }
}

export function TourCard({ tour }: { tour: Tour }) {
  const title = repairText(tour.title);
  const route = repairText(tour.route);
  const summary = repairText(tour.summary);
  const pricingNote = repairText(tour.pricingNote || "");
  const price = tour.priceAmount
    ? formatCurrency(tour.priceAmount, tour.currency || "MNT")
    : pricingNote || "Үнэ хүсэлтээр";
  const publicBusinessLine = getPublicBusinessLine(tour);

  return (
    <article className="card tourCard">
      <img className="cover" src={tour.coverImage} alt={title} />
      <div className="content stackMd">
        <div className="eyebrowRow">
          <span className="badge">
            {describeDuration(tour.durationDays, tour.durationNights)}
          </span>
          <span className="meta">{businessLabel(publicBusinessLine)}</span>
        </div>
        <h3>{title}</h3>
        <p className="meta">{route}</p>
        <p>{summary}</p>
        <p className="price">{price}</p>
        <div className="cardActions">
          <Link className="btn primary" href={`/tours/${tour.slug}`}>
            Дэлгэрэнгүй
          </Link>
          <SaveTourButton slug={tour.slug} />
        </div>
      </div>
    </article>
  );
}
