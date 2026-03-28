import Link from "next/link";
import { TourCard } from "@/components/tours/TourCard";
import { safeServerApiFetch } from "@/lib/api";
import {
  getLocalizedBusinessDirections,
  getLocalizedDestinations,
  getLocalizedServices,
  getLocalizedValues,
} from "@/lib/localized-content";
import { getRequestLocale } from "@/lib/request-locale";
import { repairText } from "@/lib/text";
import { localizeTour } from "@/lib/tour-localization";
import type { Tour } from "@/lib/types";

export const dynamic = "force-dynamic";

const copyByLocale = {
  mn: {
    shortcuts: [
      {
        title: "Аяллын зөвлөгөө",
        body: "Аялалд гарахын өмнө хэрэгтэй зөвлөмж, анхаарах зүйлс, авч явах зүйлсээ нэг дороос хараарай.",
        href: "/travel-guide",
      },
      {
        title: "Захиалга / Төлбөр",
        body: "Хийсэн захиалга, төлбөрийн мэдээллээ өөрийн хэсгээс нэг дороос хараарай.",
        href: "/booking-payment",
      },
      {
        title: "10 алхамт төлөвлөлт",
        body: "Зорилго, чиглэл, төсөв, нэмэлт хэрэгцээгээ алхам алхмаар илгээх төлөвлөлтийн урсгал.",
        href: "/enquire/step/1",
      },
    ],
    heroEyebrow: "2025 оноос",
    heroTitle: "Дотоод, гадаад аяллаа нэг дороос төлөвлөж, захиалж, хянаарай",
    heroBody:
      "Эрхэт Солар Турс ХХК нь аяллын мэдээлэл, захиалга, төлбөр, нэмэлт үйлчилгээний хүсэлтийг нэг урсгалд нэгтгэсэн аяллын платформ юм.",
    heroPrimaryCta: "Аяллууд үзэх",
    heroSecondaryCta: "Аялал төлөвлөх",
    spotlightAlt: "Онцлох аяллын зураг",
    spotlightEyebrow: "Онцлох маршрут",
    spotlightBody:
      "Олон өдрийн аялал, өдрийн маршрут, захиалгат хүсэлт болон нэмэлт үйлчилгээний урсгалаа нэг цонхоор эхлүүлэх боломжтой.",
    snapshotPills: ["Аялал", "Захиалга", "Төлбөр", "Дэмжлэг"],
    shortcutsEyebrow: "Шуурхай хэсгүүд",
    shortcutsTitle: "Аяллаа эхлүүлэх үндсэн цэгүүд",
    servicesLink: "Үйлчилгээ үзэх",
    openLink: "Нээх",
    destinationsEyebrow: "Чиглэлүүд",
    destinationsTitle: "Онцлох бүсүүд",
    destinationsLink: "Бүх чиглэлийг үзэх",
    featuredEyebrow: "Онцлох аяллууд",
    featuredTitle: "Одоогоор эрэлттэй маршрут",
    featuredLink: "Аяллын каталог",
    supportEyebrow: "Нэмэлт үйлчилгээ",
    supportTitle: "Аяллын урсгалтай уялдах туслах үйлчилгээ",
    supportLink: "Бүх үйлчилгээг үзэх",
    trustEyebrow: "Итгэлцэл",
    trustTitle: "Яагаад бидэнтэй аяллаа төлөвлөх вэ",
    aboutLink: "Бидний тухай",
  },
  en: {
    shortcuts: [
      {
        title: "Travel Guide",
        body: "See visas, preparation tips, destination guidance, policies, and FAQ in one place.",
        href: "/travel-guide",
      },
      {
        title: "Booking / Payment",
        body: "Track bookings, payment records, and statuses from your account.",
        href: "/booking-payment",
      },
      {
        title: "10-Step Planning",
        body: "A structured enquiry flow for goals, route, budget, and supporting services.",
        href: "/enquire/step/1",
      },
    ],
    heroEyebrow: "Since 2025",
    heroTitle: "Plan, book, and manage your Mongolia and international trips from one system",
    heroBody:
      "Erkhet Solar Tours LLC brings travel information, bookings, payments, service requests, and customer management into one connected platform.",
    heroPrimaryCta: "Browse tours",
    heroSecondaryCta: "Plan a trip",
    spotlightAlt: "Featured route",
    spotlightEyebrow: "Featured route",
    spotlightBody: "Start multi-day tours, day trips, custom requests, and supporting services from one place.",
    snapshotPills: ["Tours", "Bookings", "Payments", "Support"],
    shortcutsEyebrow: "Quick start",
    shortcutsTitle: "Core entry points for your journey",
    servicesLink: "View services",
    openLink: "Open",
    destinationsEyebrow: "Destinations",
    destinationsTitle: "Featured regions",
    destinationsLink: "View all destinations",
    featuredEyebrow: "Featured tours",
    featuredTitle: "Popular itineraries right now",
    featuredLink: "Tour catalog",
    supportEyebrow: "Additional services",
    supportTitle: "Support services connected to your travel flow",
    supportLink: "See all services",
    trustEyebrow: "Why us",
    trustTitle: "Why plan your trip with us",
    aboutLink: "About us",
  },
  ru: {
    shortcuts: [
      {
        title: "Путеводитель",
        body: "Визы, подготовка, советы по направлению, правила и FAQ в одном месте.",
        href: "/travel-guide",
      },
      {
        title: "Бронирование / Оплата",
        body: "Отслеживайте бронирования, платежи и статусы из личного кабинета.",
        href: "/booking-payment",
      },
      {
        title: "Планирование в 10 шагов",
        body: "Пошаговый сценарий для маршрута, бюджета и дополнительных услуг.",
        href: "/enquire/step/1",
      },
    ],
    heroEyebrow: "С 2025 года",
    heroTitle: "Планируйте, бронируйте и отслеживайте поездки из одной системы",
    heroBody:
      "Erkhet Solar Tours LLC объединяет туристическую информацию, бронирования, платежи, сервисные запросы и управление клиентами в одной платформе.",
    heroPrimaryCta: "Смотреть туры",
    heroSecondaryCta: "Планировать поездку",
    spotlightAlt: "Изображение маршрута",
    spotlightEyebrow: "Маршрут недели",
    spotlightBody: "Многодневные туры, однодневные маршруты и сервисные запросы запускаются из одного окна.",
    snapshotPills: ["Туры", "Бронирования", "Платежи", "Поддержка"],
    shortcutsEyebrow: "Быстрый старт",
    shortcutsTitle: "Главные входы в систему путешествия",
    servicesLink: "Смотреть услуги",
    openLink: "Открыть",
    destinationsEyebrow: "Направления",
    destinationsTitle: "Популярные регионы",
    destinationsLink: "Все направления",
    featuredEyebrow: "Популярные туры",
    featuredTitle: "Актуальные маршруты",
    featuredLink: "Каталог туров",
    supportEyebrow: "Дополнительные услуги",
    supportTitle: "Сервисы, встроенные в поток поездки",
    supportLink: "Все услуги",
    trustEyebrow: "Доверие",
    trustTitle: "Почему стоит планировать поездку с нами",
    aboutLink: "О нас",
  },
  zh: {
    shortcuts: [
      {
        title: "旅行指南",
        body: "签证、行前准备、目的地建议、政策与 FAQ 一站查看。",
        href: "/travel-guide",
      },
      {
        title: "预订 / 支付",
        body: "在账户中跟踪预订、支付记录和状态。",
        href: "/booking-payment",
      },
      {
        title: "10 步规划",
        body: "按步骤提交路线、预算与附加服务需求。",
        href: "/enquire/step/1",
      },
    ],
    heroEyebrow: "自 2025 年起",
    heroTitle: "在一个系统中规划、预订并管理蒙古及国际行程",
    heroBody: "Erkhet Solar Tours LLC 将旅游信息、预订、支付、服务请求和客户管理整合到一个平台中。",
    heroPrimaryCta: "查看线路",
    heroSecondaryCta: "规划行程",
    spotlightAlt: "推荐线路图片",
    spotlightEyebrow: "推荐线路",
    spotlightBody: "多日游、一日游、定制需求和配套服务都可以从一个入口开始。",
    snapshotPills: ["线路", "预订", "支付", "支持"],
    shortcutsEyebrow: "快速入口",
    shortcutsTitle: "开始旅程的核心入口",
    servicesLink: "查看服务",
    openLink: "打开",
    destinationsEyebrow: "目的地",
    destinationsTitle: "推荐地区",
    destinationsLink: "查看全部目的地",
    featuredEyebrow: "推荐线路",
    featuredTitle: "当前热门行程",
    featuredLink: "线路目录",
    supportEyebrow: "附加服务",
    supportTitle: "与旅程流程联动的支持服务",
    supportLink: "查看全部服务",
    trustEyebrow: "信任",
    trustTitle: "为什么与我们规划行程",
    aboutLink: "关于我们",
  },
} as const;

export default async function HomePage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const tours = await safeServerApiFetch<Tour[]>("/tours", []);
  const featured = tours.filter((tour) => tour.featured).slice(0, 3);
  const localizedFeatured = featured.map((tour) => localizeTour(tour, locale));
  const leadFeatured = localizedFeatured[0];
  const destinations = await getLocalizedDestinations(locale);
  const services = getLocalizedServices(locale);
  const values = getLocalizedValues(locale);
  const businessDirections = getLocalizedBusinessDirections(locale);
  const gobiDestination = destinations.find((item) => item.id === "gobi");
  const useChineseGobiSpotlight = locale === "zh" && Boolean(gobiDestination);
  const spotlightImage = leadFeatured?.coverImage || destinations[1]?.image;
  const spotlightTitle = useChineseGobiSpotlight
    ? `${gobiDestination?.title || "戈壁地区"} / 面向中国游客的精选线路 /`
    : repairText(leadFeatured?.title || gobiDestination?.title || destinations[1]?.title || "");
  const spotlightEyebrow = useChineseGobiSpotlight
    ? gobiDestination?.style || copy.spotlightEyebrow
    : copy.spotlightEyebrow;
  const spotlightBody = useChineseGobiSpotlight
    ? gobiDestination?.summary || copy.spotlightBody
    : leadFeatured?.summary || copy.spotlightBody;
  const spotlightPills = useChineseGobiSpotlight
    ? [gobiDestination?.style || "戈壁线路", gobiDestination?.season || "4 月至 10 月", "沙丘", "峡谷"]
    : copy.snapshotPills;

  return (
    <main>
      <section className="hero restoredHero">
        <div className="container heroGrid">
          <div className="stackLg heroCopy">
            <p className="heroEyebrow">{copy.heroEyebrow}</p>
            <h1 className="heroTitle">{copy.heroTitle}</h1>
            <p className="heroBody">{copy.heroBody}</p>
            <div className="btns heroActions">
              <Link className="btn primary" href="/tours">
                {copy.heroPrimaryCta}
              </Link>
              <Link className="btn secondary" href="/enquire/step/1">
                {copy.heroSecondaryCta}
              </Link>
            </div>
            <div className="heroFeaturePills">
              {businessDirections.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <article className="heroSnapshot card">
            {useChineseGobiSpotlight ? (
              <video
                className="heroSnapshotImage heroSnapshotVideo"
                controls
                loop
                playsInline
                preload="metadata"
                poster="/videos/china-gobi1-poster.jpg"
              >
                <source src="/videos/china-gobi1.mp4" type="video/mp4" />
              </video>
            ) : (
              <img className="heroSnapshotImage" src={spotlightImage} alt={copy.spotlightAlt} />
            )}
            <div className="content stackMd heroSnapshotBody">
              <div>
                <p className="eyebrow">{spotlightEyebrow}</p>
                <h3>{spotlightTitle}</h3>
              </div>
              <p>{spotlightBody}</p>
              <div className="heroSnapshotMeta">
                {spotlightPills.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.shortcutsEyebrow}</p>
              <h2>{copy.shortcutsTitle}</h2>
            </div>
            <Link href="/services">{copy.servicesLink}</Link>
          </div>
          <div className="homeShortcutGrid">
            {copy.shortcuts.map((item) => (
              <article key={item.title} className="card shortcutCard">
                <div className="content stackSm">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <Link className="btn secondary" href={item.href}>
                    {copy.openLink}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.destinationsEyebrow}</p>
              <h2>{copy.destinationsTitle}</h2>
            </div>
            <Link href="/destinations">{copy.destinationsLink}</Link>
          </div>
          <div className="grid c3 destinationSpotlightGrid">
            {destinations.slice(0, 3).map((region) => (
              <article key={region.id} className="card destinationSpotlightCard">
                <img className="cover" src={region.image} alt={region.title} />
                <div className="content stackSm">
                  <div>
                    <p className="eyebrow">{region.season}</p>
                    <h3>{region.title}</h3>
                  </div>
                  <p>{region.summary}</p>
                  <p className="meta">{region.style}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.featuredEyebrow}</p>
              <h2>{copy.featuredTitle}</h2>
            </div>
            <Link href="/tours">{copy.featuredLink}</Link>
          </div>
          <div className="grid c3">
            {localizedFeatured.map((tour) => (
              <TourCard key={tour.slug} tour={tour} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.supportEyebrow}</p>
              <h2>{copy.supportTitle}</h2>
            </div>
            <Link href="/services">{copy.supportLink}</Link>
          </div>
          <div className="grid c3">
            {services.slice(0, 3).map((service) => (
              <article key={service.id} className="card servicePreviewCard">
                <img className="cover" src={service.image} alt={service.title} />
                <div className="content stackSm">
                  <h3>{service.title}</h3>
                  <p className="meta">{service.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.trustEyebrow}</p>
              <h2>{copy.trustTitle}</h2>
            </div>
            <Link href="/about">{copy.aboutLink}</Link>
          </div>
          <div className="grid c5">
            {values.map((value) => (
              <article key={value} className="card trustCard">
                <div className="content">{value}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
