import { siteData } from "@/lib/siteData";
import { repairDeep } from "@/lib/text";
import type { Locale } from "@/lib/i18n";
import { getWikipediaDestinations, type DestinationRegionId } from "@/lib/wikipedia-destinations";

type LocalizedList = Record<Locale, string[]>;
type LocalizedPolicy = { title: string; body: string };
type LocalizedFaq = { question: string; answer: string };
type LocalizedService = {
  id: "esim" | "insurance";
  title: string;
  desc: string;
  image: string;
  highlights: string[];
};
type LocalizedDestinationRegion = {
  id: DestinationRegionId;
  title: string;
  summary: string;
  season: string;
  style: string;
  image: string;
  places: Awaited<ReturnType<typeof getWikipediaDestinations>>[number]["places"];
};

const businessDirectionsByLocale: LocalizedList = {
  mn: [
    "Гадаад жуулчдыг Монголд аялуулах",
    "Монгол жуулчдыг гадаад руу аялуулах",
    "дотоодын жуулчдыг Монгол орноороо аялуулах",
  ],
  en: [
    "Host international travelers in Mongolia",
    "Arrange outbound tours for Mongolian travelers",
    "Guide domestic travelers across Mongolia",
  ],
  ru: [
    "Принимать иностранных туристов в Монголии",
    "Организовывать зарубежные поездки для монгольских туристов",
    "Проводить внутренние туры по Монголии",
  ],
  zh: [
    "接待来蒙古旅游的国际游客",
    "为蒙古游客组织出境旅行",
    "带领本地游客游览蒙古各地",
  ],
};

const travelStylesByLocale: LocalizedList = {
  mn: ["Хуваарьт аялал", "Захиалгат аялал", "Өдрийн аялал"],
  en: ["Scheduled tours", "Custom tours", "Day tours"],
  ru: ["Туры по расписанию", "Индивидуальные туры", "Однодневные туры"],
  zh: ["固定团", "定制团", "一日游"],
};

const valuesByLocale: LocalizedList = {
  mn: [
    "Аюулгүй байдал нэн тэргүүнд",
    "Хариуцлагатай аялал жуулчлал",
    "Соёлын хүндэтгэл",
    "Сэтгэл ханамж төвтэй үйлчилгээ",
    "Шударга, ойлгомжтой мэдээлэл",
  ],
  en: [
    "Safety first",
    "Responsible travel",
    "Respect for local culture",
    "Service built around guest comfort",
    "Clear and honest information",
  ],
  ru: [
    "Безопасность прежде всего",
    "Ответственный туризм",
    "Уважение к культуре",
    "Сервис с заботой о госте",
    "Понятная и честная информация",
  ],
  zh: [
    "安全第一",
    "负责任的旅行方式",
    "尊重当地文化",
    "以旅客体验为中心的服务",
    "清楚透明的信息",
  ],
};

const faqsByLocale: Record<Locale, LocalizedFaq[]> = {
  mn: [
    {
      question: "Захиалга хэрхэн баталгаажих вэ?",
      answer: "Та хүсэлтээ илгээсний дараа бид аяллын боломж, тов, нөхцөлийг танилцуулж баталгаажуулна.",
    },
    {
      question: "Төлбөрийн мэдээллийг хэзээ авдаг вэ?",
      answer: "Захиалга баталгаажих үед төлбөрийн нөхцөл, хугацаа, шилжүүлэх мэдээллийг ойлгомжтой илгээнэ.",
    },
    {
      question: "Санал хүсэлтээ хаана илгээх вэ?",
      answer: "Та холбоо барих хэсэг болон санал хүсэлтийн хэсгээр дамжуулан хүсэлтээ илгээж болно.",
    },
  ],
  en: [
    {
      question: "How is a booking confirmed?",
      answer: "After you send a request, we confirm availability, timing, and conditions with you.",
    },
    {
      question: "When do I receive payment details?",
      answer: "Payment timing and transfer details are shared clearly once the booking is confirmed.",
    },
    {
      question: "Where can I send feedback?",
      answer: "You can contact us through the contact page or the feedback area in your account.",
    },
  ],
  ru: [
    {
      question: "Как подтверждается бронирование?",
      answer: "После вашей заявки мы уточняем доступность, даты и условия, а затем подтверждаем поездку.",
    },
    {
      question: "Когда я получу платежные данные?",
      answer: "После подтверждения бронирования мы отправим понятную информацию по оплате и срокам.",
    },
    {
      question: "Куда отправить отзыв?",
      answer: "Вы можете связаться с нами через страницу контактов или раздел отзывов.",
    },
  ],
  zh: [
    {
      question: "预订如何确认？",
      answer: "您提交请求后，我们会与您确认名额、日期和条件。",
    },
    {
      question: "什么时候会收到支付信息？",
      answer: "预订确认后，我们会清楚说明支付方式、时间和转账信息。",
    },
    {
      question: "在哪里提交反馈？",
      answer: "您可以通过联系页面或反馈区域向我们发送意见。",
    },
  ],
};

const policiesByLocale: Record<Locale, LocalizedPolicy[]> = {
  mn: [
    {
      title: "Захиалгын бодлого",
      body: "Захиалга баталгаажсаны дараа тухайн үйлчилгээний боломж, quote, төлбөрийн төлөвөөр баталгаажуулна.",
    },
    {
      title: "Төлбөр ба буцаалтын бодлого",
      body: "Төлбөрийн төлөв booking record-той шууд холбогдож, refund эсвэл partial refund тохиолдолд finance/admin хэсэгт тэмдэглэгдэнэ.",
    },
    {
      title: "Support ба гомдлын шийдвэрлэлт",
      body: "Холбоо барих хэсгээр дамжуулан ирсэн бүх санал хүсэлт, гомдлыг бид хүлээн авч шуурхай шийдвэрлэнэ.",
    },
  ],
  en: [
    {
      title: "Booking policy",
      body: "Once a booking is confirmed, availability, quotation, and payment status are confirmed for that service.",
    },
    {
      title: "Payment and refund policy",
      body: "Payment status is linked to the booking record, and refund or partial refund cases are noted by the finance/admin team.",
    },
    {
      title: "Support and complaint handling",
      body: "We receive all feedback and complaints sent through the contact section and respond as quickly as possible.",
    },
  ],
  ru: [
    {
      title: "Политика бронирования",
      body: "После подтверждения бронирования доступность услуги, quote и статус оплаты также подтверждаются.",
    },
    {
      title: "Политика оплаты и возврата",
      body: "Статус оплаты связан с booking record, а refund или partial refund фиксируются в finance/admin разделе.",
    },
    {
      title: "Support и рассмотрение жалоб",
      body: "Мы принимаем все отзывы и жалобы, поступающие через раздел связи, и стараемся решить их оперативно.",
    },
  ],
  zh: [
    {
      title: "预订政策",
      body: "预订确认后，我们会根据服务可用情况、quote 和支付状态完成确认。",
    },
    {
      title: "支付与退款政策",
      body: "支付状态会直接关联 booking record，如发生 refund 或 partial refund，会在 finance/admin 部分记录。",
    },
    {
      title: "Support 与投诉处理",
      body: "我们会接收通过联系页面发送的所有意见与投诉，并尽快处理。",
    },
  ],
};

const fallbackServiceImages: Record<LocalizedService["id"], string> = {
  esim: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
  insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop",
};

const servicesByLocale: Record<Locale, LocalizedService[]> = {
  mn: [
    {
      id: "esim",
      title: "e-SIM захиалга",
      desc: "Очих улс, дата багц, идэвхжих өдрөө оруулж e-SIM хүсэлт илгээнэ.",
      image: siteData.services.find((item) => item.id === "esim")?.image || fallbackServiceImages.esim,
      highlights: ["Улс / бүс", "Дата багц", "Идэвхжих өдөр"],
    },
    {
      id: "insurance",
      title: "Даатгал захиалга",
      desc: "Очих улс, хугацаа, аялагчдын тоо, хамрах хүрээгээр даатгалын хүсэлт илгээнэ.",
      image: siteData.services.find((item) => item.id === "insurance")?.image || fallbackServiceImages.insurance,
      highlights: ["Очих улс", "Хугацаа", "Хамрах хүрээ"],
    },
  ],
  en: [
    {
      id: "esim",
      title: "e-SIM request",
      desc: "Send your destination, activation date, and preferred data plan in one request.",
      image: siteData.services.find((item) => item.id === "esim")?.image || fallbackServiceImages.esim,
      highlights: ["Country / region", "Data plan", "Activation date"],
    },
    {
      id: "insurance",
      title: "Insurance request",
      desc: "Send destination, travel dates, traveler count, and preferred cover level.",
      image: siteData.services.find((item) => item.id === "insurance")?.image || fallbackServiceImages.insurance,
      highlights: ["Destination", "Travel dates", "Coverage"],
    },
  ],
  ru: [
    {
      id: "esim",
      title: "Заказ e-SIM",
      desc: "Отправьте страну, пакет данных и дату активации одним запросом.",
      image: siteData.services.find((item) => item.id === "esim")?.image || fallbackServiceImages.esim,
      highlights: ["Страна / регион", "Пакет данных", "Дата активации"],
    },
    {
      id: "insurance",
      title: "Заказ страховки",
      desc: "Отправьте страну, даты поездки, число путешественников и уровень покрытия.",
      image: siteData.services.find((item) => item.id === "insurance")?.image || fallbackServiceImages.insurance,
      highlights: ["Направление", "Даты поездки", "Покрытие"],
    },
  ],
  zh: [
    {
      id: "esim",
      title: "e-SIM 申请",
      desc: "填写目的地、启用日期和流量需求即可提交申请。",
      image: siteData.services.find((item) => item.id === "esim")?.image || fallbackServiceImages.esim,
      highlights: ["国家 / 地区", "流量套餐", "启用日期"],
    },
    {
      id: "insurance",
      title: "保险申请",
      desc: "填写目的地、出行日期、人数和保障范围即可提交申请。",
      image: siteData.services.find((item) => item.id === "insurance")?.image || fallbackServiceImages.insurance,
      highlights: ["目的地", "日期", "保障范围"],
    },
  ],
};

const destinationRegionMeta: Record<
  DestinationRegionId,
  Record<Locale, Omit<LocalizedDestinationRegion, "id" | "image" | "places">>
> = {
  central: {
    mn: {
      title: "Төв бүс",
      summary: "Түүх, соёл, эзэнт гүрний ул мөрийг нэг дор харуулах төвийн маршрут.",
      season: "5-10 сар",
      style: "Түүхэн аялал",
    },
    en: {
      title: "Central Region",
      summary: "A route that brings together imperial history, culture, and heritage in central Mongolia.",
      season: "May to October",
      style: "Historic route",
    },
    ru: {
      title: "Центральный регион",
      summary: "Маршрут с историей империи, культурой и главными наследными точками центральной Монголии.",
      season: "Май – октябрь",
      style: "Исторический маршрут",
    },
    zh: {
      title: "中部地区",
      summary: "集中展示帝国历史、文化与遗产地标的蒙古中部路线。",
      season: "5 月至 10 月",
      style: "历史线路",
    },
  },
  khangai: {
    mn: {
      title: "Хангайн бүс",
      summary: "Нуур, гол, галт уулын тогтоц, ногоон уулстай байгалийн аяллын бүс.",
      season: "6-9 сар",
      style: "Байгалийн аялал",
    },
    en: {
      title: "Khangai Region",
      summary: "A green mountain region shaped by lakes, rivers, volcanic landforms, and cool summer stays.",
      season: "June to September",
      style: "Nature route",
    },
    ru: {
      title: "Хангайский регион",
      summary: "Природный маршрут с озерами, реками, вулканическими формами и зелеными горами.",
      season: "Июнь – сентябрь",
      style: "Природный маршрут",
    },
    zh: {
      title: "杭爱地区",
      summary: "以湖泊、河流、火山地貌和绿色山地为特色的自然旅行区域。",
      season: "6 月至 9 月",
      style: "自然线路",
    },
  },
  east: {
    mn: {
      title: "Зүүн бүс",
      summary: "Өргөн тал, нүүдлийн шувуу, хилийн нуур, дархан цаазат газрын онцлогтой бүс.",
      season: "6-9 сар",
      style: "Тал нутгийн аялал",
    },
    en: {
      title: "Eastern Region",
      summary: "Open steppe landscapes, migratory birds, border lakes, and protected grassland reserves.",
      season: "June to September",
      style: "Steppe route",
    },
    ru: {
      title: "Восточный регион",
      summary: "Широкие степи, перелетные птицы, приграничные озера и заповедные территории.",
      season: "Июнь – сентябрь",
      style: "Степной маршрут",
    },
    zh: {
      title: "东部地区",
      summary: "拥有广阔草原、候鸟、边境湖泊和保护区的东部线路。",
      season: "6 月至 9 月",
      style: "草原线路",
    },
  },
  gobi: {
    mn: {
      title: "Говийн бүс",
      summary: "Элсэн манхан, хавцал, цохио, говийн уудам орон зайг мэдрүүлэх онцгой бүс.",
      season: "4-10 сар",
      style: "Говийн аялал",
    },
    en: {
      title: "Gobi Region",
      summary: "Desert canyons, giant dunes, layered cliffs, and the wide landscapes of the Gobi.",
      season: "April to October",
      style: "Desert route",
    },
    ru: {
      title: "Регион Гоби",
      summary: "Пустынные каньоны, большие дюны, цветные обрывы и просторные пейзажи Гоби.",
      season: "Апрель – октябрь",
      style: "Пустынный маршрут",
    },
    zh: {
      title: "戈壁地区",
      summary: "由峡谷、沙丘、彩色断崖和广阔荒漠景观组成的经典路线。",
      season: "4 月至 10 月",
      style: "戈壁线路",
    },
  },
  ulaanbaatar: {
    mn: {
      title: "Улаанбаатар орчим",
      summary: "Нийслэлийн өдөр аялал, соёлын зогсоол, хотын панорам, түүхэн дурсгалуудтай маршрут.",
      season: "Жилийн дөрвөн улирал",
      style: "Хотын аялал",
    },
    en: {
      title: "Around Ulaanbaatar",
      summary: "City highlights, cultural landmarks, viewpoints, and easy day-trip stops around the capital.",
      season: "All year",
      style: "City route",
    },
    ru: {
      title: "Окрестности Улан-Батора",
      summary: "Городские достопримечательности, культурные точки, панорамы и удобные однодневные выезды вокруг столицы.",
      season: "Круглый год",
      style: "Городской маршрут",
    },
    zh: {
      title: "乌兰巴托周边",
      summary: "包含城市亮点、文化景点、观景点与便捷一日游站点的首都周边路线。",
      season: "全年",
      style: "城市线路",
    },
  },
};

export function getLocalizedBusinessDirections(locale: Locale) {
  if (locale === "mn") {
    return [
      "Гадаад жуулчдыг Монголд аялуулах",
      "Монгол жуулчдыг гадаад руу аялуулах",
      "Дотоодын жуулчдыг Монгол орноор аялуулах",
    ];
  }

  return repairDeep(businessDirectionsByLocale[locale]);
}

export function getLocalizedTravelStyles(locale: Locale) {
  if (locale === "mn") {
    return ["Хуваарьт аялал", "Захиалгат аялал", "Өдрийн аялал"];
  }

  return repairDeep(travelStylesByLocale[locale]);
}

export function getLocalizedValues(locale: Locale) {
  if (locale === "mn") {
    return [
      "Аюулгүй байдал нэн тэргүүнд",
      "Хариуцлагатай аялал жуулчлал",
      "Соёлын хүндэтгэл",
      "Зочны тав тухад төвлөрсөн үйлчилгээ",
      "Шударга, ойлгомжтой мэдээлэл",
    ];
  }

  return repairDeep(valuesByLocale[locale]);
}

export function getLocalizedFaqs(locale: Locale) {
  return repairDeep(faqsByLocale[locale]);
}

export function getLocalizedPolicies(locale: Locale) {
  return repairDeep(policiesByLocale[locale]);
}

export function getLocalizedServices(locale: Locale) {
  return repairDeep(servicesByLocale[locale]);
}

export async function getLocalizedDestinations(locale: Locale): Promise<LocalizedDestinationRegion[]> {
  const baseRegions = await getWikipediaDestinations(locale);

  return repairDeep(
    baseRegions.map((region) => {
      const meta = destinationRegionMeta[region.id][locale];
      return {
        id: region.id,
        title: meta.title,
        summary: meta.summary,
        season: meta.season,
        style: meta.style,
        image: region.image,
        places: region.places,
      };
    }),
  );
}
