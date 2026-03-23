import { TourCard } from "@/components/tours/TourCard";
import { safeServerApiFetch } from "@/lib/api";
import { getRequestLocale } from "@/lib/request-locale";
import type { Tour } from "@/lib/types";

export const dynamic = "force-dynamic";

function buildQuery(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const businessLine = typeof searchParams.businessLine === "string" ? searchParams.businessLine : "";
  const operationType = typeof searchParams.operationType === "string" ? searchParams.operationType : "";
  const tourKind = typeof searchParams.tourKind === "string" ? searchParams.tourKind : "";
  if (search) params.set("search", search);
  if (businessLine) params.set("businessLine", businessLine);
  if (operationType) params.set("operationType", operationType);
  if (tourKind) params.set("tourKind", tourKind);
  const query = params.toString();
  return query ? `/tours?${query}` : "/tours";
}

const copyByLocale = {
  mn: {
    title: "Аяллууд",
    body: "Төлөвлөсөн маршрут, өдрийн аялал, захиалгат форматуудыг нэг каталогоос шүүн үзээрэй.",
    search: "Аялал хайх",
    allBusiness: "Бүх чиглэл",
    domestic: "Дотоод",
    inbound: "Монголд аялуулах",
    outbound: "Гадаад аялал",
    allFormat: "Бүх формат",
    scheduled: "Хуваарьт",
    custom: "Захиалгат",
    allKinds: "Бүх төрлөөр",
    multiDay: "Олон өдрийн",
    dayTour: "Өдрийн аялал",
    filter: "Шүүх",
    empty: "Таны хайлттай тохирох аялал одоогоор олдсонгүй.",
  },
  en: {
    title: "Tours",
    body: "Browse scheduled routes, day tours, and custom formats from one catalog.",
    search: "Search tours",
    allBusiness: "All directions",
    domestic: "Domestic",
    inbound: "Inbound",
    outbound: "Outbound",
    allFormat: "All formats",
    scheduled: "Scheduled",
    custom: "Custom",
    allKinds: "All types",
    multiDay: "Multi-day",
    dayTour: "Day tour",
    filter: "Filter",
    empty: "No tours match your search yet.",
  },
  ru: {
    title: "Туры",
    body: "Смотрите маршруты, однодневные туры и индивидуальные форматы в одном каталоге.",
    search: "Поиск туров",
    allBusiness: "Все направления",
    domestic: "Внутренние",
    inbound: "Въездные",
    outbound: "Выездные",
    allFormat: "Все форматы",
    scheduled: "По расписанию",
    custom: "Индивидуальные",
    allKinds: "Все типы",
    multiDay: "Многодневные",
    dayTour: "Однодневные",
    filter: "Фильтр",
    empty: "Туры по вашему запросу пока не найдены.",
  },
  zh: {
    title: "旅游线路",
    body: "在一个目录中查看计划线路、一日游和定制形式。",
    search: "搜索线路",
    allBusiness: "全部方向",
    domestic: "国内",
    inbound: "入境",
    outbound: "出境",
    allFormat: "全部形式",
    scheduled: "计划团",
    custom: "定制团",
    allKinds: "全部类型",
    multiDay: "多日游",
    dayTour: "一日游",
    filter: "筛选",
    empty: "暂时没有符合条件的线路。",
  },
} as const;

export default async function ToursPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const params = await searchParams;
  const tours = await safeServerApiFetch<Tour[]>(buildQuery(params), []);

  return (
    <main>
      <section className="pageHero">
        <div className="container stackMd">
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <form className="filterBar" method="get">
            <input name="search" placeholder={copy.search} defaultValue={typeof params.search === "string" ? params.search : ""} />
            <select name="businessLine" defaultValue={typeof params.businessLine === "string" ? params.businessLine : ""}>
              <option value="">{copy.allBusiness}</option>
              <option value="domestic">{copy.domestic}</option>
              <option value="inbound">{copy.inbound}</option>
              <option value="outbound">{copy.outbound}</option>
            </select>
            <select name="operationType" defaultValue={typeof params.operationType === "string" ? params.operationType : ""}>
              <option value="">{copy.allFormat}</option>
              <option value="scheduled">{copy.scheduled}</option>
              <option value="custom">{copy.custom}</option>
            </select>
            <select name="tourKind" defaultValue={typeof params.tourKind === "string" ? params.tourKind : ""}>
              <option value="">{copy.allKinds}</option>
              <option value="multi_day">{copy.multiDay}</option>
              <option value="day_tour">{copy.dayTour}</option>
            </select>
            <button className="btn primary" type="submit">{copy.filter}</button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          {tours.length === 0 ? (
            <article className="panel emptyState">{copy.empty}</article>
          ) : (
            <div className="grid c3">
              {tours.map((tour) => (
                <TourCard key={tour.slug} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
