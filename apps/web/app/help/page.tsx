import Link from "next/link";
import { getLocalizedFaqs, getLocalizedPolicies } from "@/lib/localized-content";
import { getRequestLocale } from "@/lib/request-locale";
import { siteData } from "@/lib/siteData";

const copyByLocale = {
  mn: {
    eyebrow: "Тусламжийн төв",
    title: "Тусламж, FAQ, бодлогууд",
    body: "Захиалга, төлбөр, буцаалт, дэмжлэгийн үндсэн мэдээллээ нэг дороос хараарай.",
    askQuestion: "Асуулт илгээх",
    openGuide: "Гарын авлага руу орох",
    paymentEyebrow: "Төлбөр ба бодлого",
    paymentTitle: "Төлбөрийн мэдээлэл",
    paymentBody: "Төлбөрийн мэдээлэл болон нөхцөлийг захиалга баталгаажсаны дараа танд ойлгомжтой танилцуулна.",
    faqEyebrow: "FAQ",
    faqTitle: "Түгээмэл асуултууд",
    policyEyebrow: "Бодлогууд",
    policyTitle: "Үндсэн бодлогууд",
  },
  en: {
    eyebrow: "Help Center",
    title: "Help, FAQ, and policies",
    body: "See booking, payment, refund, and support guidance in one place.",
    askQuestion: "Send a question",
    openGuide: "Open travel guide",
    paymentEyebrow: "Payment & policy",
    paymentTitle: "Payment information",
    paymentBody: "Payment details and terms are shared clearly after your booking is confirmed.",
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",
    policyEyebrow: "Policies",
    policyTitle: "Core policies",
  },
  ru: {
    eyebrow: "Центр помощи",
    title: "Помощь, FAQ и политики",
    body: "Смотрите информацию по бронированию, оплате, возврату и поддержке в одном месте.",
    askQuestion: "Отправить вопрос",
    openGuide: "Открыть путеводитель",
    paymentEyebrow: "Оплата и политика",
    paymentTitle: "Платежная информация",
    paymentBody: "Информация об оплате и условиях будет направлена вам после подтверждения бронирования.",
    faqEyebrow: "FAQ",
    faqTitle: "Частые вопросы",
    policyEyebrow: "Политики",
    policyTitle: "Основные политики",
  },
  zh: {
    eyebrow: "帮助中心",
    title: "帮助、FAQ 与政策",
    body: "在一个页面查看预订、支付、退款和支持说明。",
    askQuestion: "提交问题",
    openGuide: "打开旅行指南",
    paymentEyebrow: "支付与政策",
    paymentTitle: "支付信息",
    paymentBody: "预订确认后，我们会清楚说明支付信息和相关条件。",
    faqEyebrow: "FAQ",
    faqTitle: "常见问题",
    policyEyebrow: "政策",
    policyTitle: "核心政策",
  },
} as const;

export default async function HelpPage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const faqs = getLocalizedFaqs(locale);
  const policies = getLocalizedPolicies(locale);

  return (
    <main>
      <section className="pageHero bookingCenterHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/contact">{copy.askQuestion}</Link>
              <Link className="btn secondary" href="/travel-guide">{copy.openGuide}</Link>
            </div>
          </div>

          <article className="guideSpotlight card">
            <img className="cover" src={siteData.services[2]?.image} alt="Help center" />
            <div className="content stackSm">
              <p className="eyebrow">{copy.paymentEyebrow}</p>
              <h3>{copy.paymentTitle}</h3>
              <p>{copy.paymentBody}</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.faqEyebrow}</p>
              <h2>{copy.faqTitle}</h2>
            </div>
          </div>
          <div className="grid c2">
            {faqs.map((faq) => (
              <article key={faq.question} className="card faqPanel">
                <div className="content stackSm">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
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
              <p className="eyebrow">{copy.policyEyebrow}</p>
              <h2>{copy.policyTitle}</h2>
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
    </main>
  );
}
