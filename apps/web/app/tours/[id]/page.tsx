import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/tours/BookingPanel";
import { SaveTourButton } from "@/components/tours/SaveTourButton";
import { safeServerApiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { defaultLocale, type Locale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { getPublicBusinessLine } from "@/lib/tour-audience";
import { localizeTour } from "@/lib/tour-localization";
import { displayItineraryValue, getStructuredItinerary } from "@/lib/tour-itinerary";
import type { Tour } from "@/lib/types";

export const dynamic = "force-dynamic";

const copyByLocale = {
  mn: {
    route: "Чиглэл",
    category: "Ангилал",
    format: "Төрөл",
    seats: "Сул суудал",
    itinerary: "Хөтөлбөр",
    day: "Өдөр",
    time: "Цаг",
    duration: "Үргэлжлэх хугацаа",
    program: "Хөтөлбөр",
    included: "Үүнд багтсан",
    excluded: "Үүнд багтаагүй",
    priceOnRequest: "Үнэ хүсэлтээр",
    unknown: "Тодорхойгүй",
    businessLine: {
      inbound: "Монголд аялуулах",
      outbound: "Гадаад аялал",
      domestic: "Дотоод аялал",
    },
    operationType: {
      scheduled: "Хуваарьт",
      custom: "Захиалгат",
    },
    dayLabel: (days: number, nights: number) => (nights > 0 ? `${days} өдөр / ${nights} шөнө` : `${days} өдөр`),
  },
  en: {
    route: "Route",
    category: "Category",
    format: "Format",
    seats: "Available seats",
    itinerary: "Itinerary",
    day: "Day",
    time: "Time",
    duration: "Duration",
    program: "Program",
    included: "Included",
    excluded: "Not included",
    priceOnRequest: "Price on request",
    unknown: "Not specified",
    businessLine: {
      inbound: "Mongolia tours for foreign visitors",
      outbound: "International tours",
      domestic: "Domestic tours",
    },
    operationType: {
      scheduled: "Scheduled",
      custom: "Custom",
    },
    dayLabel: (days: number, nights: number) => (nights > 0 ? `${days} days / ${nights} nights` : `${days} days`),
  },
  ru: {
    route: "Маршрут",
    category: "Категория",
    format: "Формат",
    seats: "Свободные места",
    itinerary: "Программа",
    day: "День",
    time: "Время",
    duration: "Длительность",
    program: "Описание",
    included: "Включено",
    excluded: "Не включено",
    priceOnRequest: "Цена по запросу",
    unknown: "Не указано",
    businessLine: {
      inbound: "Туры по Монголии для иностранных гостей",
      outbound: "Зарубежные туры",
      domestic: "Внутренние туры",
    },
    operationType: {
      scheduled: "По расписанию",
      custom: "Индивидуально",
    },
    dayLabel: (days: number, nights: number) => (nights > 0 ? `${days} дней / ${nights} ночей` : `${days} дней`),
  },
  zh: {
    route: "线路",
    category: "分类",
    format: "形式",
    seats: "剩余名额",
    itinerary: "行程安排",
    day: "天数",
    time: "时间",
    duration: "时长",
    program: "安排",
    included: "包含内容",
    excluded: "不包含内容",
    priceOnRequest: "价格面议",
    unknown: "未说明",
    businessLine: {
      inbound: "面向外国游客的蒙古旅游",
      outbound: "出境游",
      domestic: "蒙古国内游",
    },
    operationType: {
      scheduled: "固定团",
      custom: "定制团",
    },
    dayLabel: (days: number, nights: number) => (nights > 0 ? `${days}天 / ${nights}晚` : `${days}天`),
  },
} as const;

function resolveCopy(locale: string) {
  return copyByLocale[(locale as Locale) in copyByLocale ? (locale as Locale) : defaultLocale];
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getRequestLocale();
  const copy = resolveCopy(locale);
  const tour = await safeServerApiFetch<Tour | null>(`/tours/${id}`, null);

  if (!tour) {
    notFound();
  }

  const localizedTour = localizeTour(tour, locale);
  const itineraryDays = getStructuredItinerary(localizedTour, locale);
  const publicBusinessLine = getPublicBusinessLine(tour);
  const price = localizedTour.priceAmount
    ? formatCurrency(localizedTour.priceAmount, localizedTour.currency || "MNT", locale)
    : localizedTour.pricingNote || copy.priceOnRequest;

  return (
    <main>
      <section className="pageHero">
        <div className="container detailHero">
          <div className="stackMd">
            <span className="badge">{copy.dayLabel(localizedTour.durationDays, localizedTour.durationNights)}</span>
            <h1>{localizedTour.title}</h1>
            <p>{localizedTour.description}</p>
            <div className="heroActions">
              <SaveTourButton slug={localizedTour.slug} />
              <span className="priceTag">{price}</span>
            </div>
          </div>
          <img className="detailCover" src={localizedTour.coverImage} alt={localizedTour.title} />
        </div>
      </section>

      <section className="section">
        <div className="container detailLayout">
          <article className="card">
            <div className="content stackLg">
              <div className="detailMetaGrid">
                <div>
                  <strong>{copy.route}</strong>
                  <p>{localizedTour.route || copy.unknown}</p>
                </div>
                <div>
                  <strong>{copy.category}</strong>
                  <p>{copy.businessLine[publicBusinessLine]}</p>
                </div>
                <div>
                  <strong>{copy.format}</strong>
                  <p>{copy.operationType[localizedTour.operationType]}</p>
                </div>
                <div>
                  <strong>{copy.seats}</strong>
                  <p>
                    {localizedTour.availabilityCount} / {localizedTour.capacity}
                  </p>
                </div>
              </div>

              <div className="stackMd">
                <h3>{copy.itinerary}</h3>
                <div className="itineraryDays">
                  {itineraryDays.map((day) => (
                    <article key={`${day.day}-${day.title}`} className="card itineraryDayCard slimCard">
                      <div className="content stackMd">
                        <div className="itineraryDayHeader">
                          <p className="itineraryDayEyebrow">{copy.day}</p>
                          <div className="itineraryDayHeading">
                            <span className="itineraryDayLabel">{displayItineraryValue(day.day)}</span>
                            <h4 className="itineraryDayTitle">{displayItineraryValue(day.title)}</h4>
                          </div>
                        </div>

                        <div className="itineraryTableWrap">
                          <table className="itineraryTable">
                            <thead>
                              <tr>
                                <th scope="col">{copy.time}</th>
                                <th scope="col">{copy.duration}</th>
                                <th scope="col">{copy.program}</th>
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
                                    <span>{copy.time}</span>
                                    <strong>{displayItineraryValue(item.time)}</strong>
                                  </div>
                                  <div className="itineraryMetaBlock">
                                    <span>{copy.duration}</span>
                                    <strong>{displayItineraryValue(item.duration)}</strong>
                                  </div>
                                </div>
                                <div className="itineraryMetaBlock itineraryProgramBlock">
                                  <span>{copy.program}</span>
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
                    <h4>{copy.included}</h4>
                    <ul className="list compact">
                      {localizedTour.inclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
                <article className="card slimCard">
                  <div className="content stackSm">
                    <h4>{copy.excluded}</h4>
                    <ul className="list compact">
                      {localizedTour.exclusions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            </div>
          </article>

          <BookingPanel tour={localizedTour} />
        </div>
      </section>
    </main>
  );
}
