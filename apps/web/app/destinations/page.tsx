import Link from "next/link";
import { getLocalizedDestinations } from "@/lib/localized-content";
import { getRequestLocale } from "@/lib/request-locale";

export default async function DestinationsPage() {
  const locale = await getRequestLocale();
  const destinations = await getLocalizedDestinations(locale);
  const totalPlaces = destinations.reduce((count, region) => count + region.places.length, 0);

  const copyByLocale = {
    mn: {
      eyebrow: "Чиглэлүүд",
      title: "Чиглэлүүд",
      body: "Монгол орны аяллын бүс бүрийг зураг, тайлбар, гол онцлог, аялалд тохирох хэв маягтайгаар танилцуулж байна.",
      regionCount: "Бүсчилсэн маршрут",
      highlightCount: "Онцлох цэг",
      seasonal: "Улирлын санал",
      planEyebrow: "Хамт төлөвлөе",
      planTitle: "Эдгээр чиглэлүүдээс өөрийн маршрут сонгоод захиалга эхлүүлээрэй",
      planBody: "Хэрэв та бүсүүдийг хослуулах, хувийн маршрут гаргах, эсвэл ирэх буцах өдрүүдтэй уялдуулахыг хүсвэл захиалгат санал авч болно.",
      browseTours: "Аяллууд үзэх",
      customQuote: "Захиалгат санал авах",
      bestSeason: "Илүү тохиромжтой улирал",
      spots: "онцлох цэг",
      source: "Эх сурвалж",
    },
    en: {
      eyebrow: "Destinations",
      title: "Destinations",
      body: "Explore Mongolia's travel regions with visuals, short context, highlights, and suitable travel styles.",
      regionCount: "Regional routes",
      highlightCount: "Highlights",
      seasonal: "Seasonal guidance",
      planEyebrow: "Plan With Us",
      planTitle: "Choose your route from these regions and start your request",
      planBody: "If you want to combine regions, build a private itinerary, or align your trip with arrival and departure days, request a custom proposal.",
      browseTours: "Browse tours",
      customQuote: "Request a custom quote",
      bestSeason: "Best season",
      spots: "highlights",
      source: "Source",
    },
    ru: {
      eyebrow: "Направления",
      title: "Направления",
      body: "Изучайте туристические регионы Монголии с визуальными карточками, кратким описанием, ключевыми точками и подходящим стилем путешествия.",
      regionCount: "Региональные маршруты",
      highlightCount: "Ключевые точки",
      seasonal: "Сезонные рекомендации",
      planEyebrow: "Планируйте с нами",
      planTitle: "Выберите маршрут по этим регионам и начните заявку",
      planBody: "Если вы хотите совместить несколько регионов, собрать индивидуальный маршрут или привязать поездку к датам прилета и вылета, запросите персональное предложение.",
      browseTours: "Смотреть туры",
      customQuote: "Запросить индивидуальное предложение",
      bestSeason: "Лучший сезон",
      spots: "ключевых точек",
      source: "Источник",
    },
    zh: {
      eyebrow: "目的地",
      title: "目的地",
      body: "通过视觉卡片、简短说明、亮点和适合的旅行风格来了解蒙古各大旅游区域。",
      regionCount: "区域线路",
      highlightCount: "亮点数量",
      seasonal: "季节建议",
      planEyebrow: "与我们一起规划",
      planTitle: "从这些地区中选择路线并开始您的行程请求",
      planBody: "如果您希望组合多个地区、定制专属行程，或配合抵达与离境日期，请提交定制方案请求。",
      browseTours: "查看线路",
      customQuote: "获取定制方案",
      bestSeason: "最佳季节",
      spots: "个亮点",
      source: "来源",
    },
  } as const;

  const copy = copyByLocale[locale];

  return (
    <main>
      <section className="pageHero destinationHero">
        <div className="container stackMd">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="destinationStatGrid">
            <article className="statCard">
              <strong>{destinations.length}</strong>
              <span>{copy.regionCount}</span>
            </article>
            <article className="statCard">
              <strong>{totalPlaces}</strong>
              <span>{copy.highlightCount}</span>
            </article>
            <article className="statCard">
              <strong>4</strong>
              <span>{copy.seasonal}</span>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container destinationRegionList">
          {destinations.map((region) => (
            <article key={region.id} className="destinationRegionCard">
              <div className="destinationRegionHeroCard">
                <img src={region.image} alt={region.title} className="destinationRegionImage" />
                <div className="destinationRegionOverlay stackMd">
                  <div className="stackSm">
                    <p className="eyebrow">{region.style}</p>
                    <h2>{region.title}</h2>
                    <p>{region.summary}</p>
                  </div>
                  <div className="destinationRegionMeta">
                    <span>
                      {copy.bestSeason}: {region.season}
                    </span>
                    <span>
                      {region.places.length} {copy.spots}
                    </span>
                  </div>
                </div>
              </div>

              <div className="destinationPlacesGrid">
                {region.places.map((place) => (
                  <article key={`${region.id}-${place.key}`} className="destinationPlaceCard">
                    <img src={place.image} alt={place.name} className="destinationPlaceImage" />
                    <div className="content stackSm">
                      <h3>{place.name}</h3>
                      <p className="meta">{place.description}</p>
                      <div className="destinationChipRow">
                        {place.highlights.map((item) => (
                          <span key={item} className="destinationChip">
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="destinationSourceRow">
                        <span className="destinationSourceLabel">{copy.source}</span>
                        <a className="destinationSourceLink" href={place.sourceUrl} target="_blank" rel="noreferrer">
                          {place.sourceLabel}
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="container destinationCtaPanel">
          <div className="stackSm">
            <p className="eyebrow">{copy.planEyebrow}</p>
            <h2>{copy.planTitle}</h2>
            <p>{copy.planBody}</p>
          </div>
          <div className="rowActions">
            <Link className="btn primary" href="/tours">
              {copy.browseTours}
            </Link>
            <Link className="btn secondary" href="/contact">
              {copy.customQuote}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
