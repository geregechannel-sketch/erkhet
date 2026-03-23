import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/tours/BookingPanel";
import { SaveTourButton } from "@/components/tours/SaveTourButton";
import { safeServerApiFetch } from "@/lib/api";
import { describeDuration, formatBusinessLine, formatCurrency, formatOperationType } from "@/lib/format";
import { displayItineraryValue, getStructuredItinerary } from "@/lib/tour-itinerary";
import type { Tour } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await safeServerApiFetch<Tour | null>(`/tours/${id}`, null);

  if (!tour) {
    notFound();
  }

  const itineraryDays = getStructuredItinerary(tour);
  const price = tour.priceAmount
    ? formatCurrency(tour.priceAmount, tour.currency || "MNT")
    : tour.pricingNote || "Үнэ хүсэлтээр";

  return (
    <main>
      <section className="pageHero">
        <div className="container detailHero">
          <div className="stackMd">
            <span className="badge">{describeDuration(tour.durationDays, tour.durationNights)}</span>
            <h1>{tour.title}</h1>
            <p>{tour.description}</p>
            <div className="heroActions">
              <SaveTourButton slug={tour.slug} />
              <span className="priceTag">{price}</span>
            </div>
          </div>
          <img className="detailCover" src={tour.coverImage} alt={tour.title} />
        </div>
      </section>

      <section className="section">
        <div className="container detailLayout">
          <article className="card">
            <div className="content stackLg">
              <div className="detailMetaGrid">
                <div>
                  <strong>Чиглэл</strong>
                  <p>{tour.route}</p>
                </div>
                <div>
                  <strong>Ангилал</strong>
                  <p>{formatBusinessLine(tour.businessLine)}</p>
                </div>
                <div>
                  <strong>Формат</strong>
                  <p>{formatOperationType(tour.operationType)}</p>
                </div>
                <div>
                  <strong>Сул суудал</strong>
                  <p>{tour.availabilityCount} / {tour.capacity}</p>
                </div>
              </div>

              <div className="stackMd">
                <h3>Хөтөлбөр</h3>
                <div className="itineraryDays">
                  {itineraryDays.map((day) => (
                    <article key={`${day.day}-${day.title}`} className="card itineraryDayCard slimCard">
                      <div className="content stackMd">
                        <div className="itineraryDayHeader">
                          <p className="itineraryDayEyebrow">Өдөр</p>
                          <div className="itineraryDayHeading">
                            <span className="itineraryDayLabel">{displayItineraryValue(day.day)}</span>
                            <h4 className="itineraryDayTitle">{displayItineraryValue(day.title)}</h4>
                          </div>
                        </div>

                        <div className="itineraryTableWrap">
                          <table className="itineraryTable">
                            <thead>
                              <tr>
                                <th scope="col">Цаг</th>
                                <th scope="col">Ноогдох хугацаа</th>
                                <th scope="col">Хөтөлбөр</th>
                              </tr>
                            </thead>
                            <tbody>
                              {day.items.map((item, itemIndex) => (
                                <tr key={`${day.day}-${item.time}-${itemIndex}`}>
                                  <td className="itineraryTimeCell">{displayItineraryValue(item.time)}</td>
                                  <td className="itineraryDurationCell">{displayItineraryValue(item.duration)}</td>
                                  <td className="itineraryProgramCell">{displayItineraryValue(item.program)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div className="itineraryMobileList">
                            {day.items.map((item, itemIndex) => (
                              <article key={`${day.day}-mobile-${item.time}-${itemIndex}`} className="itineraryMobileCard">
                                <div className="itineraryMobileMeta">
                                  <div className="itineraryMetaBlock">
                                    <span>Цаг</span>
                                    <strong>{displayItineraryValue(item.time)}</strong>
                                  </div>
                                  <div className="itineraryMetaBlock">
                                    <span>Ноогдох хугацаа</span>
                                    <strong>{displayItineraryValue(item.duration)}</strong>
                                  </div>
                                </div>
                                <div className="itineraryMetaBlock itineraryProgramBlock">
                                  <span>Хөтөлбөр</span>
                                  <p>{displayItineraryValue(item.program)}</p>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid c2">
                <article className="card slimCard">
                  <div className="content stackSm">
                    <h4>Үүнд багтсан</h4>
                    <ul className="list compact">
                      {tour.inclusions.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </article>
                <article className="card slimCard">
                  <div className="content stackSm">
                    <h4>Үүнд багтаагүй</h4>
                    <ul className="list compact">
                      {tour.exclusions.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </article>
              </div>
            </div>
          </article>

          <BookingPanel tour={tour} />
        </div>
      </section>
    </main>
  );
}
