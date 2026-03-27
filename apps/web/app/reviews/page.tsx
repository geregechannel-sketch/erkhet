import Link from "next/link";
import { getRequestLocale } from "@/lib/request-locale";

const copyByLocale = {
  mn: {
    eyebrow: "Санал хүсэлт",
    title: "Сэтгэгдэл ба санал хүсэлт",
    body: "Та бүхний санал хүсэлтийг бид хүлээн авч үйл ажиллагаагаа засан сайжруулахад анхаарах учраас таны санал хүсэлт бидэнд хамгийн үнэтэй.",
    contact: "Холбоо барих",
    send: "Санал хүсэлт илгээх",
    cardEyebrow: "Бид сонсож байна",
    cardTitle: "Таны санал бидэнд чухал",
    cardBody: "Ирүүлсэн санал, хүсэлт бүрийг анхааралтай уншиж, үйлчилгээгээ сайжруулахад ашиглана.",
  },
  en: {
    eyebrow: "Feedback",
    title: "Reviews and feedback",
    body: "We carefully receive your feedback and use it to improve our services. Your opinion matters to us.",
    contact: "Contact us",
    send: "Send feedback",
    cardEyebrow: "We are listening",
    cardTitle: "Your opinion matters",
    cardBody: "Every comment and suggestion is reviewed carefully and used to improve the travel experience.",
  },
  ru: {
    eyebrow: "Обратная связь",
    title: "Отзывы и предложения",
    body: "Мы внимательно принимаем ваши отзывы и используем их для улучшения нашей работы. Ваше мнение очень важно для нас.",
    contact: "Связаться",
    send: "Отправить отзыв",
    cardEyebrow: "Мы слушаем",
    cardTitle: "Ваше мнение важно",
    cardBody: "Каждый отзыв и каждое предложение мы читаем внимательно и используем для улучшения сервиса.",
  },
  zh: {
    eyebrow: "反馈",
    title: "评价与意见",
    body: "我们会认真接收您的意见和建议，并持续改进服务。您的反馈对我们非常重要。",
    contact: "联系我们",
    send: "发送反馈",
    cardEyebrow: "我们在倾听",
    cardTitle: "您的意见很重要",
    cardBody: "我们会认真查看每一条意见和建议，并将其用于改进服务体验。",
  },
} as const;

export default async function ReviewsPage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];

  return (
    <main>
      <section className="pageHero bookingCenterHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/contact">
                {copy.contact}
              </Link>
              <Link className="btn secondary" href="/account/support">
                {copy.send}
              </Link>
            </div>
          </div>

          <article className="card bookingInfoCard">
            <div className="content stackSm">
              <p className="eyebrow">{copy.cardEyebrow}</p>
              <h3>{copy.cardTitle}</h3>
              <p className="meta">{copy.cardBody}</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
