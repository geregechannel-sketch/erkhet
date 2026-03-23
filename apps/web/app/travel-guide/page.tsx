import Link from "next/link";
import { getLocalizedDestinations, getLocalizedFaqs, getLocalizedPolicies } from "@/lib/localized-content";
import { getRequestLocale } from "@/lib/request-locale";
import { siteData } from "@/lib/siteData";

const copyByLocale = {
  mn: {
    eyebrow: "Travel Guide",
    title: "Аяллын гарын авлага",
    body: "Виз, бичиг баримт, төлбөр, маршрут, бүс нутгийн бэлтгэл, FAQ, бодлогын мэдээллээ нэг дор төвлөрүүлсэн зөвлөмжийн хэсэг.",
    plan: "Аялал төлөвлөх",
    booking: "Захиалга / Төлбөр",
    seasonal: "Улирлын төлөвлөлт",
    seasonalLine: "Departure planning, guide, stay, support-тэй уялдана",
    faqEyebrow: "FAQ",
    faqTitle: "Түгээмэл асуултууд",
    policiesEyebrow: "Policies",
    policiesTitle: "Гол бодлогууд",
    regionsEyebrow: "Regions",
    regionsTitle: "Бүсчилсэн бэлтгэл",
    routePlan: "Маршрут төлөвлөх",
    getAdvice: "Зөвлөгөө авах",
    more: "Дэлгэрэнгүй",
    cards: [
      { title: "Виз ба бичиг баримт", body: "Очих улсын шаардлага, паспортын хүчинтэй хугацаа, урилга болон хилээр нэвтрэх нөхцөлийг урьдчилан шалгана.", href: "/travel-guide/tourist-visa" },
      { title: "Төлбөр ба баталгаажуулалт", body: "Захиалга, төлбөр, үйлчилгээний хүсэлтүүд reference дээрээ холбогдож, хэрэглэгчийн хэсгээс хянагдана.", href: "/booking-payment" },
      { title: "Орон нутгийн бэлтгэл", body: "Улирал, хувцаслалт, замын нөхцөл, хот болон орон нутгийн бэлтгэлээ чиглэл бүрээр төлөвлөнө.", href: "/destinations" },
    ],
  },
  en: {
    eyebrow: "Travel Guide",
    title: "Travel Guide",
    body: "Keep visas, documents, payment, routes, regional prep, FAQ, and policy guidance in one place.",
    plan: "Plan a trip",
    booking: "Booking / Payment",
    seasonal: "Seasonal planning",
    seasonalLine: "Connected with departure planning, guide, stay, and support",
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",
    policiesEyebrow: "Policies",
    policiesTitle: "Key policies",
    regionsEyebrow: "Regions",
    regionsTitle: "Region-by-region preparation",
    routePlan: "Plan route",
    getAdvice: "Get advice",
    more: "Learn more",
    cards: [
      { title: "Visas and documents", body: "Check destination requirements, passport validity, invitation letters, and border conditions in advance.", href: "/travel-guide/tourist-visa" },
      { title: "Payment and confirmation", body: "Bookings, payments, and service requests stay linked by shared references and remain visible from the customer account.", href: "/booking-payment" },
      { title: "Regional preparation", body: "Prepare for season, clothing, roads, and local conditions by destination.", href: "/destinations" },
    ],
  },
  ru: {
    eyebrow: "Travel Guide",
    title: "Путеводитель",
    body: "Соберите визы, документы, оплату, маршруты, региональную подготовку, FAQ и политики в одном месте.",
    plan: "Планировать поездку",
    booking: "Бронирование / Оплата",
    seasonal: "Сезонное планирование",
    seasonalLine: "Связано с departure planning, guide, stay и support",
    faqEyebrow: "FAQ",
    faqTitle: "Частые вопросы",
    policiesEyebrow: "Policies",
    policiesTitle: "Ключевые политики",
    regionsEyebrow: "Regions",
    regionsTitle: "Подготовка по регионам",
    routePlan: "Планировать маршрут",
    getAdvice: "Получить совет",
    more: "Подробнее",
    cards: [
      { title: "Визы и документы", body: "Заранее проверьте требования страны, срок действия паспорта, приглашения и условия пересечения границы.", href: "/travel-guide/tourist-visa" },
      { title: "Оплата и подтверждение", body: "Бронирования, платежи и сервисные запросы остаются связанными по reference и видны в кабинете клиента.", href: "/booking-payment" },
      { title: "Подготовка по регионам", body: "Подбирайте сезон, одежду, дорожные условия и местные особенности по каждому направлению.", href: "/destinations" },
    ],
  },
  zh: {
    eyebrow: "Travel Guide",
    title: "旅行指南",
    body: "将签证、证件、支付、路线、地区准备、FAQ 和政策说明集中在一个页面。",
    plan: "规划行程",
    booking: "预订 / 支付",
    seasonal: "季节规划",
    seasonalLine: "与 departure planning、guide、stay 和 support 联动",
    faqEyebrow: "FAQ",
    faqTitle: "常见问题",
    policiesEyebrow: "Policies",
    policiesTitle: "核心政策",
    regionsEyebrow: "Regions",
    regionsTitle: "分区域准备建议",
    routePlan: "规划路线",
    getAdvice: "获取建议",
    more: "了解更多",
    cards: [
      { title: "签证与证件", body: "提前确认目的地要求、护照有效期、邀请函和边境条件。", href: "/travel-guide/tourist-visa" },
      { title: "支付与确认", body: "预订、支付和服务请求通过同一 reference 关联，并可在用户账户中查看。", href: "/booking-payment" },
      { title: "地区准备", body: "按目的地提前准备季节、服装、路况和当地条件。", href: "/destinations" },
    ],
  },
} as const;

export default async function TravelGuidePage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const destinations = await getLocalizedDestinations(locale);
  const spotlight = destinations[1];
  const faqs = getLocalizedFaqs(locale);
  const policies = getLocalizedPolicies(locale);

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
              <Link className="btn secondary" href="/booking-payment">{copy.booking}</Link>
            </div>
          </div>

          <article className="guideSpotlight card">
            <img className="cover" src={spotlight.image} alt={spotlight.title} />
            <div className="content stackSm">
              <p className="eyebrow">{copy.seasonal}</p>
              <h3>{spotlight.title}</h3>
              <p>{spotlight.summary}</p>
              <ul className="guideActionList">
                <li>Season: {spotlight.season}</li>
                <li>Style: {spotlight.style}</li>
                <li>{copy.seasonalLine}</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container grid c3">
          {copy.cards.map((card, index) => (
            <article key={card.title} className="card guideTopicCard">
              <img className="cover" src={[destinations[0]?.image, siteData.services[0]?.image, destinations[2]?.image][index]} alt={card.title} />
              <div className="content stackSm">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <Link className="btn secondary" href={card.href}>{copy.more}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.faqEyebrow}</p>
              <h2>{copy.faqTitle}</h2>
            </div>
          </div>
          <div className="stackMd">
            {faqs.map((item) => (
              <article key={item.question} className="panel stackSm faqPanel">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.policiesEyebrow}</p>
              <h2>{copy.policiesTitle}</h2>
            </div>
          </div>
          <div className="grid c3">
            {policies.map((policy) => (
              <article key={policy.title} className="card policyCard">
                <div className="content stackSm">
                  <h3>{policy.title}</h3>
                  <p>{policy.body}</p>
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
              <p className="eyebrow">{copy.regionsEyebrow}</p>
              <h2>{copy.regionsTitle}</h2>
            </div>
          </div>
          <div className="grid c3">
            {destinations.slice(0, 3).map((region) => (
              <article key={region.id} className="card destinationPrepCard">
                <img className="cover" src={region.image} alt={region.title} />
                <div className="content stackSm">
                  <h3>{region.title}</h3>
                  <p>{region.summary}</p>
                  <p className="meta">{region.season}</p>
                  <p className="meta">{region.places[0]?.name || ""}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="rowActions wrapActions">
            <Link className="btn primary" href="/enquire/step/1">{copy.routePlan}</Link>
            <Link className="btn secondary" href="/contact">{copy.getAdvice}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}






