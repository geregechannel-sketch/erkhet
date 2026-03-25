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
    body: "Манай Эрхэт констракшнь ХХК нь 2018 онд анх үүсгэн байгуулагдсан бөгөөд бид барилгын салбарт 8 жил, хуулийн / өмгөөллийн компани / салбарт тасралтгүй 20 жил үйл ажиллагаа явуулж байгаа хамт олон юм. 2025 онд үйл ажиллагааны чиглэлээ өргөтгөн Эрхэт Солар Тур ХХК-г үүсгэн байгуулж дотоодын болон гадаадын жуулчдад монгол орныхоо онгон дагшин байгаль, ёс заншил, дахин давтагдашгүй нүүдэлчин ахуйг сурталчилан таниулж, тэдний хүсэл сонирхолд нийцсэн үйлчилгээ үзүүлэхийг зорин ажиллаж байна.",
    tours: "Аяллууд үзэх",
    contact: "Холбоо барих",
    snapshotEyebrow: "Компанийн товчхон",
    founded: "Үүсгэн байгуулагдсан он",
    phone: "Утас",
    email: "И-мэйл",
    directionTitle: "Үйл ажиллагааны чиглэл",
    styleTitle: "Аялалын төрөл",
    valuesTitle: "Бидний үнэт зүйлс",
  },
  en: {
    eyebrow: "About Us",
    title: "About Us",
    body: "Our team first established Erkhet Construction LLC in 2018. We bring 8 years of experience in the construction sector and 20 years of continuous practice in the legal and advocacy field. In 2025, we expanded our operations and founded Erkhet Solar Tour LLC to introduce Mongolia's untouched nature, traditions, and unique nomadic way of life to both domestic and international travelers while delivering services shaped around their interests.",
    tours: "Browse tours",
    contact: "Contact us",
    snapshotEyebrow: "Company snapshot",
    founded: "Founded",
    phone: "Phone",
    email: "Email",
    directionTitle: "Business directions",
    styleTitle: "Travel formats",
    valuesTitle: "Core values",
  },
  ru: {
    eyebrow: "О нас",
    title: "О нас",
    body: "Наша команда впервые основала Erkhet Construction LLC в 2018 году. Мы имеем 8 лет опыта в строительной сфере и 20 лет непрерывной работы в области права и адвокатской деятельности. В 2025 году мы расширили направление работы и создали Erkhet Solar Tour LLC, чтобы знакомить местных и иностранных путешественников с первозданной природой Монголии, ее традициями и неповторимым кочевым укладом, предлагая услуги с учетом их интересов.",
    tours: "Смотреть туры",
    contact: "Связаться",
    snapshotEyebrow: "Кратко о компании",
    founded: "Год основания",
    phone: "Телефон",
    email: "Email",
    directionTitle: "Направления работы",
    styleTitle: "Форматы путешествий",
    valuesTitle: "Ценности",
  },
  zh: {
    eyebrow: "关于我们",
    title: "关于我们",
    body: "我们的团队最初于 2018 年成立了 Erkhet Construction LLC，在建筑领域拥有 8 年经验，在法律与辩护服务领域持续工作 20 年。2025 年，我们进一步扩展业务并成立了 Erkhet Solar Tour LLC，面向蒙古国内外游客介绍蒙古原始自然、传统文化和独特的游牧生活方式，并提供符合旅客兴趣与需求的服务。",
    tours: "查看线路",
    contact: "联系我们",
    snapshotEyebrow: "公司概览",
    founded: "成立时间",
    phone: "电话",
    email: "邮箱",
    directionTitle: "业务方向",
    styleTitle: "旅行形式",
    valuesTitle: "核心价值",
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
    </main>
  );
}
