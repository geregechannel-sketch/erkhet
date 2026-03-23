import Link from "next/link";
import { getLocalizedValues } from "@/lib/localized-content";
import { getRequestLocale } from "@/lib/request-locale";
import { siteData } from "@/lib/siteData";

const reviewSignalsByLocale = {
  mn: [
    {
      title: "Санал хүсэлт системтэй",
      body: "Хэрэглэгчийн самбар, contact form, support history бүгд нэг урсгалд бүртгэгддэг тул сэтгэгдэл, хүсэлт төвлөрсөн байдлаар хянагдана.",
    },
    {
      title: "Гомдол шийдвэрлэлт хянагддаг",
      body: "Complaint, feedback, support хүсэлтүүд admin түүх дээр статус, тэмдэглэлтэй хадгалагдаж, шийдвэрлэлт нь шат дараатай явагдана.",
    },
    {
      title: "Захиалга ба төлбөр холбогддог",
      body: "Booking reference, payment status, reconciliation урсгал нэг систем дээр тулгуурладаг учраас мэдээлэл тасрахгүй.",
    },
  ],
  en: [
    {
      title: "Feedback stays connected",
      body: "The customer dashboard, contact form, and support history all write into one workflow so feedback stays visible.",
    },
    {
      title: "Complaint handling is tracked",
      body: "Complaints, feedback, and support requests are stored with statuses and admin notes through a managed workflow.",
    },
    {
      title: "Bookings and payments stay linked",
      body: "Shared booking references, payment statuses, and reconciliation keep travel records consistent.",
    },
  ],
  ru: [
    {
      title: "Обратная связь связана с системой",
      body: "Кабинет клиента, contact form и support history работают в одном workflow, поэтому отзывы не теряются.",
    },
    {
      title: "Жалобы контролируются",
      body: "Complaint, feedback и support запросы сохраняются со статусами и admin notes в управляемом процессе.",
    },
    {
      title: "Бронирование и оплата связаны",
      body: "Общие booking reference, payment status и reconciliation сохраняют целостность travel records.",
    },
  ],
  zh: [
    {
      title: "反馈与系统联动",
      body: "用户账户、contact form 与 support history 写入同一 workflow，因此反馈不会丢失。",
    },
    {
      title: "投诉处理可追踪",
      body: "Complaint、feedback 和 support 请求会带着状态与 admin notes 保存在受控流程中。",
    },
    {
      title: "预订与支付持续关联",
      body: "共享的 booking reference、payment status 与 reconciliation 让旅行记录保持一致。",
    },
  ],
} as const;

const copyByLocale = {
  mn: {
    eyebrow: "Trust & Feedback",
    title: "Сэтгэгдэл ба итгэлцэл",
    body: "Хэрэглэгчийн санал хүсэлт, support history, үйлчилгээний шийдвэрлэлт хэрхэн хянагдаж, аяллын чанарт нөлөөлдгийг энэ хэсгээс харах боломжтой.",
    leave: "Санал хүсэлт үлдээх",
    contact: "Холбоо барих",
    promise: "Service promise",
    promiseBody: "Санал хүсэлт, гомдол, дэмжлэгийн урсгал booking болон account мэдээлэлтэй уялдаатай явдаг.",
    promiseItems: [
      "Support request бүр reference дугаартай хадгалагдана",
      "Admin дээр төлөв, тэмдэглэл, шийдвэрлэлт хянагдана",
      "Хэрэглэгч өөрийн түүхээ account хэсгээсээ харна",
    ],
    valuesEyebrow: "Why Guests Return",
    valuesTitle: "Манай үйлчилгээний гол зарчмууд",
  },
  en: {
    eyebrow: "Trust & Feedback",
    title: "Reviews and trust",
    body: "See how customer feedback, support history, and service resolution are tracked and used to improve the journey.",
    leave: "Leave feedback",
    contact: "Contact",
    promise: "Service promise",
    promiseBody: "Feedback, complaints, and support flows stay connected to booking and account records.",
    promiseItems: [
      "Each support request is stored with a reference number",
      "Admin tracks status, notes, and resolution",
      "Customers see their own history from the account area",
    ],
    valuesEyebrow: "Why Guests Return",
    valuesTitle: "Principles behind our service",
  },
  ru: {
    eyebrow: "Trust & Feedback",
    title: "Отзывы и доверие",
    body: "Посмотрите, как отзывы клиентов, support history и решение запросов контролируются и влияют на качество поездки.",
    leave: "Оставить отзыв",
    contact: "Связаться",
    promise: "Service promise",
    promiseBody: "Отзывы, жалобы и support flow связаны с booking и account record.",
    promiseItems: [
      "Каждый support request хранится с reference номером",
      "Admin отслеживает статус, notes и resolution",
      "Клиент видит свою историю в account area",
    ],
    valuesEyebrow: "Why Guests Return",
    valuesTitle: "Ключевые принципы сервиса",
  },
  zh: {
    eyebrow: "Trust & Feedback",
    title: "评价与信任",
    body: "查看客户反馈、support history 和问题处理如何被追踪并用于改善旅程体验。",
    leave: "提交反馈",
    contact: "联系顾问",
    promise: "Service promise",
    promiseBody: "反馈、投诉与 support flow 会持续关联到 booking 与 account record。",
    promiseItems: [
      "每个 support request 都会保存 reference 编号",
      "Admin 持续跟踪状态、notes 与 resolution",
      "客户可在 account area 中查看自己的历史",
    ],
    valuesEyebrow: "Why Guests Return",
    valuesTitle: "服务背后的关键原则",
  },
} as const;

export default async function ReviewsPage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const reviewSignals = reviewSignalsByLocale[locale];
  const values = getLocalizedValues(locale);

  return (
    <main>
      <section className="pageHero bookingCenterHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/account/support">{copy.leave}</Link>
              <Link className="btn secondary" href="/contact">{copy.contact}</Link>
            </div>
          </div>

          <article className="guideSpotlight card">
            <img className="cover" src={siteData.destinations[0]?.image} alt={siteData.company.nameMn} />
            <div className="content stackSm">
              <p className="eyebrow">{copy.promise}</p>
              <h3>{siteData.company.nameMn}</h3>
              <p>{copy.promiseBody}</p>
              <ul className="guideActionList">
                {copy.promiseItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container grid c3">
          {reviewSignals.map((item) => (
            <article key={item.title} className="card policyCard">
              <div className="content stackSm">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section alt">
        <div className="container stackLg">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">{copy.valuesEyebrow}</p>
              <h2>{copy.valuesTitle}</h2>
            </div>
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
