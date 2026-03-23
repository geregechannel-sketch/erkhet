import type { Locale } from "@/lib/i18n";
import { siteData } from "@/lib/siteData";
import { getWikipediaDestinations, type LocalizedDestinationRegionBase } from "@/lib/wikipedia-destinations";

type ServiceItem = (typeof siteData.services)[number];
type DestinationItem = LocalizedDestinationRegionBase & {
  title: string;
  summary: string;
  season: string;
  style: string;
};
type FaqItem = (typeof siteData.faqs)[number];
type PolicyItem = (typeof siteData.policies)[number];

type RegionTranslation = {
  title: string;
  summary: string;
  season: string;
  style: string;
};

const serviceTranslations: Record<Locale, Record<ServiceItem["id"], { title: string; desc: string; highlights: string[] }>> = {
  mn: {
    hotel: {
      title: "Зочид буудал захиалга",
      desc: "Очих хот, хугацаа, төсөвт тохирсон буудлын хүсэлтийг нэг дор илгээнэ.",
      highlights: ["Check-in / Check-out", "Өрөөний төрөл", "Зочдын тоо"],
    },
    restaurant: {
      title: "Ресторан захиалга",
      desc: "Business dinner, family table, private dining хүсэлтийг урьдчилан баталгаажуулна.",
      highlights: ["Цагийн захиалга", "Хүний тоо", "Хоолны сонголт"],
    },
    flight: {
      title: "Онгоцны суудал захиалга",
      desc: "Нислэгийн чиглэл, огноо, суудлын ангилал бүхий хүсэлтийг төвлөрсөн байдлаар илгээнэ.",
      highlights: ["One-way / Round-trip", "Cabin class", "Зорчигчийн тоо"],
    },
    taxi: {
      title: "Такси захиалга",
      desc: "Airport pickup, city transfer, intercity ride хүсэлтийг урьдчилан захиална.",
      highlights: ["Тосох / буулгах", "Тээврийн төрөл", "Ирэх цаг"],
    },
    esim: {
      title: "e-SIM захиалга",
      desc: "Очих улс, дата багц, идэвхжих огноогоор e-SIM хүсэлт илгээнэ.",
      highlights: ["Улс / бүс", "Дата багц", "Идэвхжих өдөр"],
    },
    insurance: {
      title: "Даатгал захиалга",
      desc: "Очих улс, хугацаа, аялагчдын тоо, хамрах хүрээгээр аяллын даатгалын хүсэлт илгээнэ.",
      highlights: ["Улс / бүс", "Хугацаа", "Хамрах хүрээ"],
    },
  },
  en: {
    hotel: {
      title: "Hotel Booking",
      desc: "Submit hotel requests matched to your city, dates, and budget in one place.",
      highlights: ["Check-in / Check-out", "Room type", "Guest count"],
    },
    restaurant: {
      title: "Restaurant Booking",
      desc: "Pre-arrange business dinners, family tables, and private dining requests.",
      highlights: ["Reservation time", "Guest count", "Cuisine preference"],
    },
    flight: {
      title: "Flight Booking",
      desc: "Send departure, return, route, and cabin-class preferences through one service desk.",
      highlights: ["One-way / Round-trip", "Cabin class", "Passenger count"],
    },
    taxi: {
      title: "Taxi Booking",
      desc: "Book airport pickup, city transfers, and intercity rides in advance.",
      highlights: ["Pickup / Drop-off", "Vehicle type", "Arrival timing"],
    },
    esim: {
      title: "e-SIM Booking",
      desc: "Request destination-ready e-SIM plans by country, data package, and activation date.",
      highlights: ["Country / Region", "Data plan", "Activation date"],
    },
    insurance: {
      title: "Insurance Booking",
      desc: "Submit travel insurance requests by destination, trip dates, traveler count, and coverage level.",
      highlights: ["Country / Region", "Coverage period", "Coverage level"],
    },
  },
  ru: {
    hotel: {
      title: "Бронирование отеля",
      desc: "Отправляйте запрос на отель с учетом города, дат и бюджета в одном месте.",
      highlights: ["Заезд / выезд", "Тип номера", "Количество гостей"],
    },
    restaurant: {
      title: "Бронирование ресторана",
      desc: "Заранее согласовывайте деловые ужины, семейные столы и private dining запросы.",
      highlights: ["Время брони", "Количество гостей", "Предпочтения по кухне"],
    },
    flight: {
      title: "Бронирование авиабилетов",
      desc: "Отправляйте пожелания по направлению, датам и классу обслуживания через единый сервис.",
      highlights: ["В одну сторону / туда-обратно", "Класс", "Количество пассажиров"],
    },
    taxi: {
      title: "Заказ такси",
      desc: "Заранее оформляйте airport pickup, city transfer и intercity ride.",
      highlights: ["Точка посадки / высадки", "Тип автомобиля", "Время прибытия"],
    },
    esim: {
      title: "Заказ e-SIM",
      desc: "Оформляйте e-SIM по стране, пакету данных и дате активации.",
      highlights: ["Страна / регион", "Пакет данных", "Дата активации"],
    },
    insurance: {
      title: "Страховка для поездки",
      desc: "Отправляйте запрос на туристическую страховку по стране, датам поездки, числу путешественников и уровню покрытия.",
      highlights: ["Страна / регион", "Период покрытия", "Уровень покрытия"],
    },
  },
  zh: {
    hotel: {
      title: "酒店预订",
      desc: "在一个入口提交符合目的地城市、日期和预算的酒店需求。",
      highlights: ["入住 / 退房", "房型", "住客人数"],
    },
    restaurant: {
      title: "餐厅预订",
      desc: "提前安排商务用餐、家庭聚餐和私人晚宴需求。",
      highlights: ["预订时间", "人数", "餐饮偏好"],
    },
    flight: {
      title: "机票预订",
      desc: "通过统一服务台提交航线、日期和舱位需求。",
      highlights: ["单程 / 往返", "舱位等级", "乘客人数"],
    },
    taxi: {
      title: "出租车预订",
      desc: "提前安排接机、市内接送和城际出行。",
      highlights: ["上车 / 下车地点", "车辆类型", "到达时间"],
    },
    esim: {
      title: "e-SIM 预订",
      desc: "按国家、流量包和启用日期提交 e-SIM 请求。",
      highlights: ["国家 / 地区", "流量包", "启用日期"],
    },
    insurance: {
      title: "旅行保险预订",
      desc: "按目的地、出行日期、旅客人数和保障范围提交旅行保险需求。",
      highlights: ["国家 / 地区", "保障期限", "保障级别"],
    },
  },
};

const regionTranslations: Record<Locale, Record<DestinationItem["id"], RegionTranslation>> = {
  mn: {
    central: { title: "Төв бүс", summary: "Эртний нийслэл, буддын соёл, төвийн хангайн уудам тал хосолсон түүхэн бүс.", season: "5-10 сар", style: "Соёл, гэр бааз, түүхэн маршрут" },
    khangai: { title: "Хангайн бүс", summary: "Нуур, галт уулын тогоо, өндөр уулс, нүүдэлчдийн амьдрал хосолсон олон өдрийн алдартай бүс.", season: "6-9 сар", style: "Байгаль, адал явдал, нуурын маршрут" },
    east: { title: "Зүүн бүс", summary: "Домог, түүх, тал хээр, тахилгат уулс, рашаан сувиллын уур амьсгал бүхий нууцлаг бүс.", season: "5-9 сар", style: "Түүх, рашаан, мөргөлийн аялал" },
    gobi: { title: "Говийн бүс", summary: "Их говийн уудам тал, улаан хад, манхан элс, хийд мөргөлийн аяллыг хослуулсан хамгийн эрэлттэй бүс.", season: "4-10 сар", style: "Адал явдал, цөл, зураг авалтын маршрут" },
    ulaanbaatar: { title: "Улаанбаатар орчим", summary: "Хотын соёл, музей, сүм хийд, ойрын өдөр аялал, arrival/departure day-д тохирсон маршрут бүхий бүс.", season: "Жилийн дөрвөн улирал", style: "Хот, богино буудал, өдрийн аялал" },
  },
  en: {
    central: { title: "Central Region", summary: "A historic region that blends ancient capitals, Buddhist heritage, and central steppe landscapes.", season: "May to October", style: "Culture, ger camps, heritage route" },
    khangai: { title: "Khangai Region", summary: "A classic multi-day area of lakes, volcanic craters, highlands, and nomadic landscapes.", season: "June to September", style: "Nature, adventure, lake route" },
    east: { title: "Eastern Region", summary: "A quieter region of legends, sacred lakes, healing springs, and pilgrimage-style routes.", season: "May to September", style: "History, wellness, spiritual travel" },
    gobi: { title: "Gobi Region", summary: "Mongolia's most sought-after desert route with cliffs, dunes, canyons, and monastery visits.", season: "April to October", style: "Adventure, desert, photo expedition" },
    ulaanbaatar: { title: "Around Ulaanbaatar", summary: "City culture, museums, monasteries, and short tours suited to arrival and departure days.", season: "All year", style: "City, short stay, day tour" },
  },
  ru: {
    central: { title: "Центральный регион", summary: "Исторический регион, где сочетаются древние столицы, буддийское наследие и степные пейзажи.", season: "Май - октябрь", style: "Культура, гер-кэмпы, исторический маршрут" },
    khangai: { title: "Хангайский регион", summary: "Классический многодневный регион с озерами, вулканами, высокогорьем и кочевыми ландшафтами.", season: "Июнь - сентябрь", style: "Природа, приключения, озерный маршрут" },
    east: { title: "Восточный регион", summary: "Более тихий регион легенд, священных озер, минеральных источников и паломнических маршрутов.", season: "Май - сентябрь", style: "История, wellness, духовные поездки" },
    gobi: { title: "Гобийский регион", summary: "Самый востребованный пустынный маршрут Монголии со скалами, дюнами, каньонами и монастырями.", season: "Апрель - октябрь", style: "Приключения, пустыня, фотоэкспедиции" },
    ulaanbaatar: { title: "Окрестности Улан-Батора", summary: "Городская культура, музеи, монастыри и короткие маршруты для дней прилета и вылета.", season: "Круглый год", style: "Город, короткое пребывание, однодневные туры" },
  },
  zh: {
    central: { title: "中部地区", summary: "融合古都、佛教遗产与中部草原风貌的历史区域。", season: "5 月至 10 月", style: "文化、蒙古包营地、历史线路" },
    khangai: { title: "杭爱地区", summary: "湖泊、火山口、高地与游牧景观结合的经典多日路线。", season: "6 月至 9 月", style: "自然、探险、湖区路线" },
    east: { title: "东部地区", summary: "以传说、圣湖、温泉和朝圣氛围著称的宁静区域。", season: "5 月至 9 月", style: "历史、康养、精神之旅" },
    gobi: { title: "戈壁地区", summary: "蒙古最受欢迎的沙漠线路，结合悬崖、沙丘、峡谷和寺院探访。", season: "4 月至 10 月", style: "探险、沙漠、摄影线路" },
    ulaanbaatar: { title: "乌兰巴托周边", summary: "适合抵离日的城市文化、博物馆、寺院与短途线路。", season: "全年", style: "城市、短住、一日游" },
  },
};

const valuesByLocale: Record<Locale, string[]> = {
  mn: ["Аюулгүй байдал нэн тэргүүнд", "Хариуцлагатай аялал жуулчлал", "Соёлын хүндэтгэл", "Сэтгэл ханамж төвтэй үйлчилгээ", "Шударга, ойлгомжтой мэдээлэл"],
  en: ["Safety first", "Responsible travel", "Cultural respect", "Customer-centered service", "Clear and fair information"],
  ru: ["Безопасность прежде всего", "Ответственный туризм", "Уважение к культуре", "Сервис с фокусом на клиента", "Понятная и честная информация"],
  zh: ["安全优先", "负责任旅游", "尊重文化", "以客户为中心的服务", "清晰透明的信息"],
};

const businessDirectionsByLocale: Record<Locale, string[]> = {
  mn: ["Гадаад жуулчдыг Монголд аялуулах", "Монгол жуулчдыг гадаад руу аялуулах", "Монгол орны дотоодын аяллыг зохион байгуулах"],
  en: ["Inbound tours in Mongolia", "Outbound trips from Mongolia", "Domestic travel across Mongolia"],
  ru: ["Въездные туры по Монголии", "Выездные поездки из Монголии", "Внутренние маршруты по Монголии"],
  zh: ["蒙古入境游", "蒙古出境游", "蒙古国内游"],
};

const travelStylesByLocale: Record<Locale, string[]> = {
  mn: ["Хуваарьт аялал", "Захиалгат аялал", "Өдрийн аялал", "Соёл, түүхийн маршрут", "Байгаль, гэр баазын аялал"],
  en: ["Scheduled tours", "Custom tours", "Day tours", "Culture and history routes", "Nature and ger camp journeys"],
  ru: ["Туры по расписанию", "Индивидуальные туры", "Однодневные туры", "Культурно-исторические маршруты", "Природа и гер-кэмпы"],
  zh: ["计划团", "定制团", "一日游", "文化历史线路", "自然与蒙古包营地体验"],
};

const faqsByLocale: Record<Locale, FaqItem[]> = {
  mn: [
    { question: "Захиалгыг заавал бүртгэлтэй хэрэглэгч хийх үү?", answer: "Тийм. Хадгалсан аялал, захиалга, төлбөр, үйлчилгээний хүсэлт, support history бүгд My Account дотор холбогдохын тулд нэвтэрсэн байх шаардлагатай." },
    { question: "Үнэ тодорхойгүй үйлчилгээ дээр яах вэ?", answer: "Хүсэлт эхлээд service booking record болж хадгалагдана. Дараа нь оператор quote болон нөхцөлийг баталгаажуулж статусыг шинэчилнэ." },
    { question: "Төлбөр амжилтгүй болбол юу болох вэ?", answer: "Төлбөрийн бичлэг хадгалагдаж, статус нь failed эсвэл cancelled болж admin reconciliation хэсэгт шууд харагдана." },
  ],
  en: [
    { question: "Do bookings require a registered account?", answer: "Yes. Saved tours, bookings, payments, service requests, and support history are linked through My Account." },
    { question: "What happens when pricing is request-only?", answer: "The request is stored first as a service booking record, then your operator updates the quote and status." },
    { question: "What if a payment fails?", answer: "The payment record is still stored and appears as failed or cancelled in admin reconciliation." },
  ],
  ru: [
    { question: "Нужна ли учетная запись для бронирования?", answer: "Да. Сохраненные туры, бронирования, платежи, сервисные запросы и история поддержки связываются через личный кабинет." },
    { question: "Что делать, если цена по запросу?", answer: "Сначала создается service booking record, после чего оператор обновляет предложение и статус." },
    { question: "Что будет при неудачной оплате?", answer: "Запись об оплате все равно сохраняется и отображается как failed или cancelled в разделе reconciliation." },
  ],
  zh: [
    { question: "提交预订是否必须注册账号？", answer: "是的。收藏线路、预订、支付、服务请求和支持历史都会通过 My Account 关联。" },
    { question: "如果价格需要另行确认怎么办？", answer: "系统会先保存服务请求记录，随后由工作人员补充报价和状态。" },
    { question: "如果支付失败会怎样？", answer: "支付记录仍会保留，并在管理端 reconciliation 中显示为 failed 或 cancelled。" },
  ],
};

const policiesByLocale: Record<Locale, PolicyItem[]> = {
  mn: [
    { title: "Захиалгын бодлого", body: "Захиалга баталгаажсаны дараа тухайн үйлчилгээний боломж, quote, төлбөрийн төлөвөөр баталгаажуулна." },
    { title: "Төлбөр ба буцаалтын бодлого", body: "Төлбөрийн төлөв booking record-той шууд холбогдож, refund эсвэл partial refund тохиолдолд finance/admin хэсэгт тэмдэглэгдэнэ." },
    { title: "Support ба гомдлын шийдвэрлэлт", body: "Public contact болон My Account support form-оор ирсэн бүх хүсэлт admin support history дээр төвлөрнө." },
  ],
  en: [
    { title: "Booking policy", body: "A booking is confirmed against actual availability, quote, and payment status." },
    { title: "Payment and refund policy", body: "Payment status is tied directly to the booking record, and refund events are tracked in finance and admin workflows." },
    { title: "Support and complaint handling", body: "Requests submitted from the public site and My Account are centralized in admin support history." },
  ],
  ru: [
    { title: "Политика бронирования", body: "Бронирование подтверждается по наличию мест, коммерческому предложению и статусу оплаты." },
    { title: "Политика оплаты и возвратов", body: "Статус оплаты напрямую связан с booking record, а возвраты фиксируются в finance и admin процессе." },
    { title: "Поддержка и жалобы", body: "Все обращения с публичного сайта и из My Account собираются в admin support history." },
  ],
  zh: [
    { title: "预订政策", body: "预订会根据实际库存、报价和支付状态完成确认。" },
    { title: "支付与退款政策", body: "支付状态直接绑定 booking record，退款会在财务和管理流程中记录。" },
    { title: "支持与投诉处理", body: "来自公开网站和 My Account 的请求都会汇总到管理端支持历史中。" },
  ],
};

export function getLocalizedServices(locale: Locale): ServiceItem[] {
  return siteData.services.map((service) => ({
    ...service,
    ...serviceTranslations[locale][service.id],
  }));
}

export async function getLocalizedDestinations(locale: Locale): Promise<DestinationItem[]> {
  const destinations = await getWikipediaDestinations(locale);

  return destinations.map((destination) => {
    const translated = regionTranslations[locale][destination.id];
    return {
      ...destination,
      title: translated.title,
      summary: translated.summary,
      season: translated.season,
      style: translated.style,
    };
  });
}

export function getLocalizedValues(locale: Locale) {
  return valuesByLocale[locale];
}

export function getLocalizedBusinessDirections(locale: Locale) {
  return businessDirectionsByLocale[locale];
}

export function getLocalizedTravelStyles(locale: Locale) {
  return travelStylesByLocale[locale];
}

export function getLocalizedFaqs(locale: Locale) {
  return faqsByLocale[locale];
}

export function getLocalizedPolicies(locale: Locale) {
  return policiesByLocale[locale];
}



