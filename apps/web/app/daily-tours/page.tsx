import Link from "next/link";
import { TourCard } from "@/components/tours/TourCard";
import { safeServerApiFetch } from "@/lib/api";
import { getLocalizedDestinations } from "@/lib/localized-content";
import { getRequestLocale } from "@/lib/request-locale";
import type { Tour } from "@/lib/types";

export const dynamic = "force-dynamic";

const copyByLocale = {
  mn: {
    eyebrow: "Day Tours",
    title: "Өдрийн аяллууд",
    body: "Хот орчим, arrival/departure day, богино хугацааны аялалд тохирсон өдөр аяллын маршрутуудыг эндээс үзнэ үү.",
    plan: "Өдрийн маршрут төлөвлөх",
    allTours: "Бүх аяллыг үзэх",
    cardEyebrow: "Short format",
    bullets: [
      "Arrival / departure өдөртэй уялдуулж төлөвлөнө",
      "Хот орчмын аялал, соёлын зогсоол, мөргөлийн цэгт тохиромжтой",
      "Өдрийн хөтөлбөрийг ирэх, буцах цагтай уялдуулан тохируулна",
    ],
    emptyTitle: "Одоогоор тусдаа өдрийн аяллын багц цөөн байна.",
    emptyBody: "Та захиалгат өдөр маршрутын хүсэлт илгээж, аяллаа өөрийн хугацаанд тохируулж болно.",
    season: "Тохиромжтой улирал",
    contact: "Оператортой холбогдох",
  },
  en: {
    eyebrow: "Day Tours",
    title: "Day Tours",
    body: "Explore day routes suited to short stays, city-based programs, and arrival or departure days.",
    plan: "Plan a day route",
    allTours: "See all tours",
    cardEyebrow: "Short format",
    bullets: [
      "Aligned to arrival and departure days",
      "Good for city-adjacent visits, cultural stops, and spiritual visits",
      "Can be aligned with your arrival and departure timing",
    ],
    emptyTitle: "There are only a few dedicated day-tour packages right now.",
    emptyBody: "You can still submit a custom day-route request and fit it to your timing.",
    season: "Best season",
    contact: "Talk to an operator",
  },
  ru: {
    eyebrow: "Day Tours",
    title: "Однодневные туры",
    body: "Смотрите маршруты для короткого пребывания, city-based программ и arrival/departure day.",
    plan: "Планировать однодневный маршрут",
    allTours: "Все туры",
    cardEyebrow: "Short format",
    bullets: [
      "Привязывается к arrival и departure day",
      "Подходит для поездок вокруг города, культурных остановок и духовных мест",
      "Можно подстроить под время прилета и вылета",
    ],
    emptyTitle: "Сейчас отдельных однодневных пакетов немного.",
    emptyBody: "Вы можете отправить индивидуальный запрос на day route и подстроить его под свои даты.",
    season: "Лучший сезон",
    contact: "Связаться с оператором",
  },
  zh: {
    eyebrow: "Day Tours",
    title: "一日游",
    body: "查看适合短暂停留、城市周边活动以及 arrival/departure day 的一日路线。",
    plan: "规划一日路线",
    allTours: "查看全部线路",
    cardEyebrow: "Short format",
    bullets: [
      "可与 arrival / departure day 对齐",
      "适合城市周边、文化停靠和精神朝圣点",
      "可根据抵达和离开时间灵活安排",
    ],
    emptyTitle: "目前独立的一日游产品还不多。",
    emptyBody: "您仍可提交 custom day route 请求，按自己的时间安排组合。",
    season: "最佳季节",
    contact: "联系顾问",
  },
} as const;

export default async function DailyToursPage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const tours = await safeServerApiFetch<Tour[]>("/tours", []);
  const dailyTours = tours.filter((tour) => tour.tourKind === "day_tour" || tour.durationDays <= 1);
  const destinations = await getLocalizedDestinations(locale);

  return (
    <main>
      <section className="pageHero travelGuideHero">
        <div className="container travelGuideHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/enquire/step/1">{copy.plan}</Link>
              <Link className="btn secondary" href="/tours">{copy.allTours}</Link>
            </div>
          </div>

          <article className="guideSpotlight card">
            <img className="cover" src={destinations[4]?.image} alt={destinations[4]?.title} />
            <div className="content stackSm">
              <p className="eyebrow">{copy.cardEyebrow}</p>
              <h3>{destinations[4]?.title}</h3>
              <p>{destinations[4]?.summary}</p>
              <ul className="guideActionList">
                {copy.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          {dailyTours.length === 0 ? (
            <article className="panel emptyState stackSm">
              <h3>{copy.emptyTitle}</h3>
              <p>{copy.emptyBody}</p>
            </article>
          ) : (
            <div className="grid c3">
              {dailyTours.map((tour) => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
            </div>
          )}

          <div className="grid c3">
            {destinations.slice(0, 3).map((region) => (
              <article key={region.id} className="card destinationPrepCard">
                <img className="cover" src={region.image} alt={region.title} />
                <div className="content stackSm">
                  <h3>{region.title}</h3>
                  <p>{region.summary}</p>
                  <p className="meta">{copy.season}: {region.season}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="rowActions wrapActions">
            <Link className="btn primary" href="/enquire/step/1">{copy.plan}</Link>
            <Link className="btn secondary" href="/contact">{copy.contact}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

