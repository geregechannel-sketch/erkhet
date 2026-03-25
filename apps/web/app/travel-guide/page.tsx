import { getRequestLocale } from "@/lib/request-locale";

const copyByLocale = {
  mn: {
    eyebrow: "Аялалын үеийн зөвлөгөө",
    title: "Аялалын үеийн зөвлөгөө",
    body: "Аяллын үеэр хэрэг болох гол зөвлөгөөг нэг дороос хараарай.",
    fieldLabel: "Аялалын үеийн зөвлөгөө",
    fieldValue:
      "Ерөнхий зөвлөгөө\nАяллын өмнө бичиг баримт, маршрут, холбоо барих мэдээллээ сайтар шалгаарай.\n\nАнхаарах зүйлс\nЦаг агаар, замын нөхцөл, хувцас хэрэглэл, бэлэн мөнгө болон утасны цэнэгээ урьдчилан бэлдээрэй.\n\nАвах зүйлс\nИргэний үнэмлэх эсвэл паспорт, дулаан хувцас, эмийн хэрэгсэл, ус болон хувийн хэрэглээний зүйлсээ авч явахыг зөвлөж байна.",
  },
  en: {
    eyebrow: "Travel Advice",
    title: "Travel Advice",
    body: "See the most useful travel tips in one place.",
    fieldLabel: "Travel Advice",
    fieldValue:
      "General advice\nPlease double-check your documents, route, and contact details before departure.\n\nThings to watch\nPrepare for the weather, road conditions, clothing, cash, and phone charge in advance.\n\nWhat to bring\nWe recommend carrying your passport or ID, warm clothing, medicine, water, and personal essentials.",
  },
  ru: {
    eyebrow: "Советы в поездке",
    title: "Советы в поездке",
    body: "Самые важные советы для поездки собраны в одном месте.",
    fieldLabel: "Советы в поездке",
    fieldValue:
      "Общие советы\nПеред поездкой проверьте документы, маршрут и контакты.\n\nНа что обратить внимание\nЗаранее подготовьте одежду по погоде, наличные деньги и заряд телефона.\n\nЧто взять с собой\nРекомендуем взять паспорт или удостоверение, теплую одежду, лекарства, воду и личные вещи.",
  },
  zh: {
    eyebrow: "出行建议",
    title: "出行建议",
    body: "把旅途中最重要的提醒集中在一个页面查看。",
    fieldLabel: "出行建议",
    fieldValue:
      "一般建议\n出发前请再次确认证件、路线和联系方式。\n\n注意事项\n请提前准备适合天气的衣物、现金和手机电量。\n\n建议携带\n建议携带护照或身份证、保暖衣物、常用药、水和个人用品。",
  },
} as const;

export default async function TravelGuidePage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];

  return (
    <main>
      <section className="pageHero">
        <div className="container stackLg">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
          </div>

          <article className="card travelAdviceCard">
            <div className="content stackMd">
              <label className="travelAdviceLabel" htmlFor="travel-advice-field">
                {copy.fieldLabel}
              </label>
              <textarea
                id="travel-advice-field"
                className="travelAdviceField"
                readOnly
                value={copy.fieldValue}
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
