import Link from "next/link";
import {
  getLocalizedBusinessDirections,
  getLocalizedTravelStyles,
  getLocalizedValues,
} from "@/lib/localized-content";
import { getRequestLocale } from "@/lib/request-locale";
import { siteData } from "@/lib/siteData";

const copyByLocale = {
  mn: {
    eyebrow: "Бидний тухай",
    title: "Бидний тухай",
    body: `${siteData.company.nameMn} нь гадаад, дотоод, outbound аяллыг төлөвлөхөөс эхлээд захиалга, төлбөр, дэмжлэгийн урсгал хүртэл нэг системээр удирдах зорилготой ажиллаж байна.`,
    tours: "Аяллууд үзэх",
    contact: "Холбоо барих",
    snapshotEyebrow: "Компанийн товчхон",
    founded: "Үүсгэн байгуулагдсан он",
    phone: "Утас",
    email: "И-мэйл",
    directionTitle: "Үйл ажиллагааны чиглэл",
    styleTitle: "Ажиллах формат",
    valuesTitle: "Үнэт зүйлс",
    howEyebrow: "Хэрхэн ажилладаг вэ",
    howTitle: "Нэгдсэн системийн зарчим",
    cards: [
      "Public сайт, account, admin бүгд нэг source of truth ашиглана.",
      "Захиалга, төлбөр, support хүсэлтүүд reference-ээрээ холбогдоно.",
      "Хэрэглэгчийн үйлдэл бүр account болон admin урсгал дээр харагдана.",
    ],
  },
  en: {
    eyebrow: "About Us",
    title: "About Us",
    body: `${siteData.company.nameMn} operates as one connected system for inbound, outbound, and domestic travel, from planning to booking, payment, and support.`,
    tours: "Browse tours",
    contact: "Contact us",
    snapshotEyebrow: "Company snapshot",
    founded: "Founded",
    phone: "Phone",
    email: "Email",
    directionTitle: "Business directions",
    styleTitle: "Travel formats",
    valuesTitle: "Core values",
    howEyebrow: "How we work",
    howTitle: "One connected platform",
    cards: [
      "The public site, customer account, and admin panel share the same source of truth.",
      "Bookings, payments, and support requests are linked by shared references.",
      "Every customer action appears in both account and admin workflows.",
    ],
  },
  ru: {
    eyebrow: "О нас",
    title: "О нас",
    body: `${siteData.company.nameMn} работает как единая система для въездного, выездного и внутреннего туризма — от планирования до бронирования, оплаты и поддержки.`,
    tours: "Смотреть туры",
    contact: "Связаться",
    snapshotEyebrow: "Кратко о компании",
    founded: "Год основания",
    phone: "Телефон",
    email: "Email",
    directionTitle: "Направления работы",
    styleTitle: "Форматы путешествий",
    valuesTitle: "Ценности",
    howEyebrow: "Как мы работаем",
    howTitle: "Единая платформа",
    cards: [
      "Публичный сайт, кабинет клиента и админ-панель используют один источник данных.",
      "Бронирования, платежи и support-запросы связаны едиными reference.",
      "Каждое действие клиента видно и в кабинете, и в админ-процессе.",
    ],
  },
  zh: {
    eyebrow: "关于我们",
    title: "关于我们",
    body: `${siteData.company.nameMn} 通过一个统一系统管理入境、出境和国内旅游，从规划到预订、支付与支持。`,
    tours: "查看线路",
    contact: "联系我们",
    snapshotEyebrow: "公司概览",
    founded: "成立时间",
    phone: "电话",
    email: "邮箱",
    directionTitle: "业务方向",
    styleTitle: "旅行形式",
    valuesTitle: "核心价值",
    howEyebrow: "我们的工作方式",
    howTitle: "一体化平台",
    cards: [
      "公开网站、用户账户和管理后台使用同一套数据来源。",
      "预订、支付和支持请求通过统一 reference 关联。",
      "每个客户动作都会同步到用户端和管理端。",
    ],
  },
} as const;

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const businessDirections = getLocalizedBusinessDirections(locale);
  const travelStyles = getLocalizedTravelStyles(locale);
  const values = getLocalizedValues(locale);

  return (
    <main>
      <section className="pageHero travelGuideHero">
        <div className="container travelGuideHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/tours">{copy.tours}</Link>
              <Link className="btn secondary" href="/contact">{copy.contact}</Link>
            </div>
          </div>

          <article className="guideSpotlight card">
            <img className="cover" src={siteData.destinations[0]?.image} alt={siteData.company.nameMn} />
            <div className="content stackSm">
              <p className="eyebrow">{copy.snapshotEyebrow}</p>
              <h3>{siteData.company.nameMn}</h3>
              <ul className="guideActionList">
                <li>{copy.founded}: {siteData.company.founded}</li>
                <li>{copy.phone}: {siteData.company.phone}</li>
                <li>{copy.email}: {siteData.company.email}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container grid c3">
          <article className="card policyCard">
            <div className="content stackSm">
              <h3>{copy.directionTitle}</h3>
              <ul className="list compact">
                {businessDirections.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </article>
          <article className="card policyCard">
            <div className="content stackSm">
              <h3>{copy.styleTitle}</h3>
              <ul className="list compact">
                {travelStyles.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </article>
          <article className="card policyCard">
            <div className="content stackSm">
              <h3>{copy.valuesTitle}</h3>
              <ul className="list compact">
                {values.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section alt">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.howEyebrow}</p>
              <h2>{copy.howTitle}</h2>
            </div>
          </div>
          <div className="grid c3">
            {copy.cards.map((item) => (
              <article key={item} className="card trustCard"><div className="content">{item}</div></article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
