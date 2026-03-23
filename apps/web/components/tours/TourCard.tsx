import Link from "next/link";
import { SaveTourButton } from "@/components/tours/SaveTourButton";
import { describeDuration, formatCurrency } from "@/lib/format";
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
  const price = tour.priceAmount
    ? formatCurrency(tour.priceAmount, tour.currency || "MNT")
    : tour.pricingNote || "Үнэ хүсэлтээр";

  return (
    <article className="card tourCard">
      <img className="cover" src={tour.coverImage} alt={tour.title} />
      <div className="content stackMd">
        <div className="eyebrowRow">
          <span className="badge">{describeDuration(tour.durationDays, tour.durationNights)}</span>
          <span className="meta">{businessLabel(tour.businessLine)}</span>
        </div>
        <h3>{tour.title}</h3>
        <p className="meta">{tour.route}</p>
        <p>{tour.summary}</p>
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
