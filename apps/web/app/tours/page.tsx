import { OutboundDestinationCard } from "@/components/tours/OutboundDestinationCard";
import { TourCard } from "@/components/tours/TourCard";
import { safeServerApiFetch } from "@/lib/api";
import { outboundDestinations } from "@/lib/outbound-destinations";
import { getRequestLocale } from "@/lib/request-locale";
import { getPublicBusinessLine, isForeignOnlyTour } from "@/lib/tour-audience";
import type { Tour } from "@/lib/types";

export const dynamic = "force-dynamic";

function buildQuery(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const operationType =
    typeof searchParams.operationType === "string" ? searchParams.operationType : "";
  const tourKind = typeof searchParams.tourKind === "string" ? searchParams.tourKind : "";

  if (search) params.set("search", search);
  if (operationType) params.set("operationType", operationType);
  if (tourKind) params.set("tourKind", tourKind);

  const query = params.toString();
  return query ? `/tours?${query}` : "/tours";
}

const copyByLocale = {
  mn: {
    title: "Аяллууд",
    body: "Маршрут, хэлбэр, чиглэл болон захиалгат аяллын мэдээллээ эндээс шүүж үзээрэй.",
    search: "Аялал хайх",
    allBusiness: "Бүх чиглэл",
    domestic: "Дотоод аялал",
    inbound: "Монголд аялуулах",
    outbound: "Гадаад аялал",
    allFormat: "Бүх хэлбэр",
    scheduled: "Хуваарьт",
    custom: "Захиалгат",
    allKinds: "Бүх төрөл",
    multiDay: "Олон өдрийн",
    dayTour: "Өдрийн аялал",
    filter: "Шүүх",
    empty: "Таны хайлттай тохирох аялал одоогоор олдсонгүй.",
    outboundTitle: "Онцлох гадаад аяллын чиглэлүүд",
    outboundBody: "Москва, Бээжин, Дубай зэрэг чиглэлийг нэг төрлийн ойлгомжтой card хэлбэрээр хараарай.",
  },
  en: {
    title: "Tours",
    body: "Browse itineraries, formats, categories, and custom tour options from one page.",
    search: "Search tours",
    allBusiness: "All categories",
    domestic: "Domestic tours",
    inbound: "Tours in Mongolia",
    outbound: "International trips",
    allFormat: "All formats",
    scheduled: "Scheduled",
    custom: "Custom",
    allKinds: "All types",
    multiDay: "Multi-day",
    dayTour: "Day tour",
    filter: "Filter",
    empty: "No tours match your search yet.",
    outboundTitle: "Featured international destinations",
    outboundBody: "Explore Moscow, Beijing, and Dubai in the same clear card format.",
  },
  ru: {
    title: "Туры",
    body: "Здесь можно отфильтровать маршруты, форматы, направления и индивидуальные туры.",
    search: "Поиск туров",
    allBusiness: "Все направления",
    domestic: "Внутренние туры",
    inbound: "Туры по Монголии",
    outbound: "Зарубежные поездки",
    allFormat: "Все форматы",
    scheduled: "По расписанию",
    custom: "Индивидуальные",
    allKinds: "Все типы",
    multiDay: "Многодневные",
    dayTour: "Однодневные",
    filter: "Фильтр",
    empty: "По вашему запросу туры пока не найдены.",
    outboundTitle: "Популярные зарубежные направления",
    outboundBody: "Москва, Пекин и Дубай показаны в едином понятном карточном формате.",
  },
  zh: {
    title: "旅游线路",
    body: "在这里按路线形式、方向和定制需求筛选适合您的行程。",
    search: "搜索线路",
    allBusiness: "全部方向",
    domestic: "国内游",
    inbound: "蒙古境内游",
    outbound: "出境游",
    allFormat: "全部形式",
    scheduled: "计划团",
    custom: "定制团",
    allKinds: "全部类型",
    multiDay: "多日游",
    dayTour: "一日游",
    filter: "筛选",
    empty: "暂时没有符合条件的线路。",
    outboundTitle: "热门出境方向",
    outboundBody: "莫斯科、北京和迪拜以统一清晰的卡片形式展示。",
  },
} as const;

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const params = await searchParams;
  const tours = await safeServerApiFetch<Tour[]>(buildQuery(params), []);
  const selectedBusinessLine =
    typeof params.businessLine === "string" ? params.businessLine : "";
  const selectedSearch = typeof params.search === "string" ? params.search.trim().toLowerCase() : "";
  const showOutboundHighlights = selectedBusinessLine === "outbound";

  const visibleTours = tours.filter((tour) => {
    const publicBusinessLine = getPublicBusinessLine(tour);

    if (!selectedBusinessLine) return !isForeignOnlyTour(tour);
    if (selectedBusinessLine === "domestic") return publicBusinessLine === "domestic";
    if (selectedBusinessLine === "outbound") return publicBusinessLine === "outbound";
    if (selectedBusinessLine === "inbound") return publicBusinessLine === "inbound";
    return !isForeignOnlyTour(tour);
  });

  const highlightedOutboundDestinations = outboundDestinations.map((destination) => ({
    ...destination,
    current:
      selectedSearch.length > 0 &&
      [destination.title.mn, destination.title.en, destination.title.ru, destination.title.zh]
        .some((value) => value.toLowerCase().includes(selectedSearch)),
  }));

  return (
    <main>
      <section className="pageHero">
        <div className="container stackMd">
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <form className="filterBar" method="get">
            <input
              name="search"
              placeholder={copy.search}
              defaultValue={typeof params.search === "string" ? params.search : ""}
            />
            <select
              name="businessLine"
              defaultValue={typeof params.businessLine === "string" ? params.businessLine : ""}
            >
              <option value="">{copy.allBusiness}</option>
              <option value="domestic">{copy.domestic}</option>
              <option value="inbound">{copy.inbound}</option>
              <option value="outbound">{copy.outbound}</option>
            </select>
            <select
              name="operationType"
              defaultValue={typeof params.operationType === "string" ? params.operationType : ""}
            >
              <option value="">{copy.allFormat}</option>
              <option value="scheduled">{copy.scheduled}</option>
              <option value="custom">{copy.custom}</option>
            </select>
            <select
              name="tourKind"
              defaultValue={typeof params.tourKind === "string" ? params.tourKind : ""}
            >
              <option value="">{copy.allKinds}</option>
              <option value="multi_day">{copy.multiDay}</option>
              <option value="day_tour">{copy.dayTour}</option>
            </select>
            <button className="btn primary" type="submit">
              {copy.filter}
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          {showOutboundHighlights ? (
            <article className="panel stackMd outboundHighlightsPanel">
              <div className="sectionHeading stackXs">
                <h2>{copy.outboundTitle}</h2>
                <p>{copy.outboundBody}</p>
              </div>
              <div className="grid c3">
                {highlightedOutboundDestinations.map((destination) => (
                  <OutboundDestinationCard
                    key={destination.slug}
                    destination={destination}
                    locale={locale}
                    current={destination.current}
                  />
                ))}
              </div>
            </article>
          ) : null}

          {visibleTours.length === 0 && !showOutboundHighlights ? (
            <article className="panel emptyState">{copy.empty}</article>
          ) : (
            <div className="grid c3">
              {visibleTours.map((tour) => (
                <TourCard key={tour.slug} tour={tour} locale={locale} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
