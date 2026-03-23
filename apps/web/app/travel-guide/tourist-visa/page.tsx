import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";

const copyByLocale: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    intro: string;
    note: string;
    quickEyebrow: string;
    sections: {
      id: string;
      title: string;
      summary: string;
      details: string[];
    }[];
    helpEyebrow: string;
    helpTitle: string;
    helpBody: string;
    officialLabel: string;
    contactButton: string;
    backButton: string;
  }
> = {
  mn: {
    eyebrow: "Tourist Visa",
    title: "Жуулчны визийн ерөнхий зөвлөмж",
    intro:
      "Визийн бодит нөхцөл улс бүрээр өөр байдаг тул энэ хэсэг нь аялал төлөвлөлтөд хэрэгтэй үндсэн шалгах зүйлсийг нэг дор эмхэлж өгнө.",
    note:
      "Паспорт, урилга, нислэг, буудал, даатгал, мэдүүлэх хугацаа зэрэг шаардлагыг тухайн улсын Элчин сайдын яам, консулын газар, албан ёсны визийн сайтаас давхар шалгана уу.",
    quickEyebrow: "Визийн шалгах жагсаалт",
    sections: [
      {
        id: "passport",
        title: "Паспорт",
        summary: "Буцах өдрөөс хойш дор хаяж 6 сарын хүчинтэй эсэхээ эхэлж шалгана.",
        details: [
          "Паспортын хүчинтэй хугацаа болон хоосон хуудасны шаардлага улсаас шалтгаалан өөр байдаг.",
          "Хугацаа дөхсөн бол виз мэдүүлэхээс өмнө шинэчилбэл эрсдэл багасна.",
        ],
      },
      {
        id: "application",
        title: "Маягт ба зураг",
        summary: "Визийн маягт, зураг, хуулбаруудыг ижил форматтай бэлдэнэ.",
        details: [
          "Зургийн хэмжээ, арын өнгө, файл эсвэл цаасан хувилбарын шаардлага өөр өөр байж болно.",
          "Паспортын хуулбар, иргэний үнэмлэх, өмнөх визийн хуулбар зэргийг нэг дор бүрдүүлнэ.",
        ],
      },
      {
        id: "proof",
        title: "Урилга ба баталгаа",
        summary: "Очих газрын баталгаа, itinerary, hotel booking, нислэгийн reservation-аа уялдуулна.",
        details: [
          "Захиалгат аялал бол манай багаас itinerary болон support letter-аа урьдчилж авна.",
          "Хил дээр асууж магадгүй тул itinerary, booking reference-үүдээ хэвлэж эсвэл PDF-ээр хадгална.",
        ],
      },
      {
        id: "timeline",
        title: "Мэдүүлэх хугацаа",
        summary: "Аяллын өдрөөс хангалттай өмнө мэдүүлэх нь хамгийн чухал.",
        details: [
          "Peak season, баярын үе, олон улсын үзэсгэлэн, амралтын өдрүүдэд визийн хугацаа уртсаж болдог.",
          "Бид аяллын огноотой уялдуулж ямар бичиг баримтыг хэдийд бэлдэх дарааллыг гаргаж өгнө.",
        ],
      },
      {
        id: "finance",
        title: "Санхүү ба даатгал",
        summary: "Банкны тодорхойлолт, ажлын тодорхойлолт, travel insurance шаардлагатай эсэхээ шалгана.",
        details: [
          "Зарим улс дансны үлдэгдэл, цалингийн орлого, sponsorship letter шаардаж болдог.",
          "Аяллын даатгалын хамрах хүрээ нь эмчилгээ, осол, саатал зэрэг нөхцөлийг багтаасан эсэхийг шалгана.",
        ],
      },
      {
        id: "official",
        title: "Албан ёсны эх сурвалж",
        summary: "Сүүлийн шийдвэрийг тухайн улсын Элчин сайдын яам болон албан ёсны сайтаас авна.",
        details: [
          "Визгүй, e-visa, airport visa, interview requirement зэрэг нөхцөл богино хугацаанд өөрчлөгдөж болно.",
          "Манай баг зөвлөмж өгнө, харин эцсийн шаардлага нь тухайн улсын албан ёсны эх сурвалж байна.",
        ],
      },
    ],
    helpEyebrow: "Албан ёсны эх сурвалж",
    helpTitle: "Визийн зөвлөгөөг аяллын маршрутаа дагаад хамт цэгцлээрэй",
    helpBody:
      "Аяллын төрөл, огноо, захиалгын баталгаатай уялдуулж ямар бичиг баримтыг эхэлж бэлдэхээ манай багтай хамт төлөвлөвөл илүү ойлгомжтой, алдаа багатай болдог.",
    officialLabel: "Элчин сайдын яам, консулын газар, e-visa portal-аа давхар шалгаарай.",
    contactButton: "Зөвлөгөө авах",
    backButton: "Гарын авлага руу буцах",
  },
  en: {
    eyebrow: "Tourist Visa",
    title: "Tourist visa essentials",
    intro:
      "Visa rules vary by destination, so this page gathers the core checks you should organize before you lock your trip dates.",
    note:
      "Always confirm passport validity, invitation requirements, bookings, insurance, and processing timelines with the embassy, consulate, or official visa portal for your destination.",
    quickEyebrow: "Visa checklist",
    sections: [
      {
        id: "passport",
        title: "Passport",
        summary: "Check passport validity first, usually at least 6 months beyond your return date.",
        details: [
          "Blank page requirements and validity rules change by country.",
          "If your passport is close to expiry, renew it before you submit the visa file.",
        ],
      },
      {
        id: "application",
        title: "Form and photo",
        summary: "Prepare the visa form, photo, and copies in the exact format requested.",
        details: [
          "Photo size, background color, and file type may differ by destination.",
          "Keep passport copies, ID copies, and previous visa copies in one place.",
        ],
      },
      {
        id: "proof",
        title: "Proof and bookings",
        summary: "Align invitation letters, itinerary, hotel bookings, and flight reservations.",
        details: [
          "For custom trips, we can prepare itinerary support documents in advance.",
          "Keep itinerary and booking references ready in print or PDF for border checks.",
        ],
      },
      {
        id: "timeline",
        title: "Processing time",
        summary: "Apply early enough before departure, especially in busy seasons.",
        details: [
          "Peak season, holidays, and major events can extend normal processing times.",
          "We help sequence your documents around the actual departure date.",
        ],
      },
      {
        id: "finance",
        title: "Finance and insurance",
        summary: "Check whether bank proof, employer letters, or travel insurance are required.",
        details: [
          "Some destinations ask for statements, salary proof, or sponsorship letters.",
          "Make sure your travel insurance coverage matches the trip and destination rules.",
        ],
      },
      {
        id: "official",
        title: "Official source",
        summary: "Use embassy and official visa portals for the final decision.",
        details: [
          "Visa-free, e-visa, airport visa, or interview rules can change quickly.",
          "Our team guides the planning, but the official source remains the final authority.",
        ],
      },
    ],
    helpEyebrow: "Official source",
    helpTitle: "Match visa prep with your route and booking timeline",
    helpBody:
      "When your visa checklist is aligned with your trip dates, bookings, and itinerary, the process becomes clearer and easier to manage.",
    officialLabel: "Double-check the embassy, consulate, and e-visa portal for your destination.",
    contactButton: "Get advice",
    backButton: "Back to guide",
  },
  ru: {
    eyebrow: "Tourist Visa",
    title: "Основные рекомендации по туристической визе",
    intro:
      "Визовые правила отличаются по странам, поэтому здесь собраны базовые проверки, которые удобно сделать до фиксации дат поездки.",
    note:
      "Срок действия паспорта, приглашения, брони, страховку и сроки рассмотрения обязательно перепроверьте на сайте посольства, консульства или официального визового портала.",
    quickEyebrow: "Визовый чек-лист",
    sections: [
      {
        id: "passport",
        title: "Паспорт",
        summary: "Сначала проверьте срок действия паспорта, обычно минимум 6 месяцев после возвращения.",
        details: [
          "Требования к сроку действия и пустым страницам зависят от страны.",
          "Если срок подходит к концу, лучше обновить паспорт до подачи.",
        ],
      },
      {
        id: "application",
        title: "Анкета и фото",
        summary: "Подготовьте анкету, фото и копии документов в нужном формате.",
        details: [
          "Размер фото, фон и тип файла могут отличаться по направлениям.",
          "Соберите копии паспорта, удостоверения личности и предыдущих виз в одном месте.",
        ],
      },
      {
        id: "proof",
        title: "Подтверждения",
        summary: "Согласуйте приглашение, маршрут, hotel booking и flight reservation.",
        details: [
          "Для индивидуальных поездок мы можем заранее подготовить support-документы по маршруту.",
          "Храните itinerary и booking reference в PDF или распечатанном виде.",
        ],
      },
      {
        id: "timeline",
        title: "Срок подачи",
        summary: "Подавайте документы заранее, особенно в высокий сезон.",
        details: [
          "Во время праздников и выставок сроки рассмотрения часто увеличиваются.",
          "Мы помогаем разложить документы по этапам относительно даты выезда.",
        ],
      },
      {
        id: "finance",
        title: "Финансы и страховка",
        summary: "Уточните, нужны ли банковские выписки, справка с работы и travel insurance.",
        details: [
          "Некоторые страны требуют выписки, подтверждение дохода или sponsorship letter.",
          "Проверьте, покрывает ли страховка медицинские и дорожные риски.",
        ],
      },
      {
        id: "official",
        title: "Официальный источник",
        summary: "Окончательное решение берите только с сайта посольства или визового портала.",
        details: [
          "Правила visa-free, e-visa, airport visa и интервью могут меняться быстро.",
          "Мы помогаем организовать подготовку, но финальные требования задает официальный источник.",
        ],
      },
    ],
    helpEyebrow: "Официальный источник",
    helpTitle: "Свяжите визовую подготовку с маршрутом и сроками бронирования",
    helpBody:
      "Когда чек-лист по визе синхронизирован с датами поездки, бронированием и маршрутом, процесс становится намного понятнее.",
    officialLabel: "Проверьте посольство, консульство и e-visa portal нужной страны.",
    contactButton: "Получить совет",
    backButton: "Назад к путеводителю",
  },
  zh: {
    eyebrow: "Tourist Visa",
    title: "旅游签证重点说明",
    intro:
      "不同国家的签证要求不同，这里整理了出行前最常用、最需要先确认的关键项目。",
    note:
      "护照有效期、邀请函、预订材料、保险和办理时间，请务必以使馆、领馆或官方签证网站公布的信息为准。",
    quickEyebrow: "签证检查清单",
    sections: [
      {
        id: "passport",
        title: "护照",
        summary: "先确认护照有效期，通常要求回程后至少还有 6 个月。",
        details: [
          "空白页数量和有效期要求会因国家而不同。",
          "如果护照快到期，建议在递交签证前先更新。",
        ],
      },
      {
        id: "application",
        title: "表格与照片",
        summary: "按照要求准备签证表格、照片和复印件。",
        details: [
          "照片尺寸、背景颜色和文件格式可能不同。",
          "护照复印件、身份证明和旧签证材料最好统一整理。",
        ],
      },
      {
        id: "proof",
        title: "邀请与预订证明",
        summary: "把邀请函、行程单、酒店预订和机票预订单对应好。",
        details: [
          "定制行程时，我们可以提前准备 itinerary support 文件。",
          "建议将 itinerary 与 booking reference 保留 PDF 或打印件。",
        ],
      },
      {
        id: "timeline",
        title: "办理时间",
        summary: "最好在出发前预留充足时间办理。",
        details: [
          "旺季、节假日和大型活动期间，办理时间往往会延长。",
          "我们会根据出发日期帮助你安排准备顺序。",
        ],
      },
      {
        id: "finance",
        title: "资金与保险",
        summary: "确认是否需要银行流水、工作证明和旅行保险。",
        details: [
          "部分国家会要求资金证明、收入证明或 sponsorship letter。",
          "请确认保险范围是否符合目的地要求。",
        ],
      },
      {
        id: "official",
        title: "官方来源",
        summary: "最终要求必须以使馆或官方签证网站为准。",
        details: [
          "免签、电子签、落地签和面试要求可能会快速变化。",
          "我们可以协助准备，但最终标准仍以官方信息为准。",
        ],
      },
    ],
    helpEyebrow: "官方来源",
    helpTitle: "把签证准备和路线、预订时间一起整理更清晰",
    helpBody:
      "当签证材料和出发日期、酒店、机票、行程表同步准备时，整体流程会更容易理解和执行。",
    officialLabel: "请同时查看目的地使馆、领馆和 e-visa portal。",
    contactButton: "获取建议",
    backButton: "返回指南",
  },
};

export default async function TouristVisaPage() {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];

  return (
    <main>
      <section className="pageHero travelGuideHero">
        <div className="container stackMd">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
          <p className="meta visaGuideSourceNote">{copy.note}</p>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <article className="panel visaGuideIntroPanel stackMd">
            <div className="stackSm">
              <p className="eyebrow">{copy.quickEyebrow}</p>
              <p className="meta visaGuideSourceNote">{copy.officialLabel}</p>
            </div>
            <div className="visaGuideQuickGrid">
              {copy.sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`} className="visaGuideQuickLink">
                  <span className="visaGuideQuickIndex">{index + 1}</span>
                  <strong>{section.title}</strong>
                  <span>{section.summary}</span>
                </a>
              ))}
            </div>
          </article>

          <div className="visaGuideDetailsGrid">
            {copy.sections.map((section) => (
              <article key={section.id} id={section.id} className="card visaGuideDetailCard">
                <div className="content stackSm">
                  <p className="eyebrow">{copy.quickEyebrow}</p>
                  <h3>{section.title}</h3>
                  <p>{section.summary}</p>
                  <ul className="visaGuideChecklist">
                    {section.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container destinationCtaPanel">
          <div className="stackSm">
            <p className="eyebrow">{copy.helpEyebrow}</p>
            <h2>{copy.helpTitle}</h2>
            <p>{copy.helpBody}</p>
          </div>
          <div className="rowActions">
            <Link className="btn primary" href="/contact">
              {copy.contactButton}
            </Link>
            <Link className="btn secondary" href="/travel-guide">
              {copy.backButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
