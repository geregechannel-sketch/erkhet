import type { Locale } from "@/lib/i18n";
import { repairDeep, repairText } from "@/lib/text";
import type { Tour } from "@/lib/types";

type TourOverride = Pick<
  Partial<Tour>,
  "title" | "summary" | "description" | "route" | "pricingNote" | "durationDays" | "durationNights"
> & {
  itinerary?: string[];
  inclusions?: string[];
  exclusions?: string[];
};

const localizedTours: Record<string, Partial<Record<Locale, TourOverride>>> = {
  "ub-4d": {
    en: {
      title: "Ulaanbaatar Highlights / For International Visitors /",
      summary: "A route for discovering Ulaanbaatar and traditional Mongolian life.",
      description:
        "A cultural route through Ulaanbaatar with a nomad family visit and the Chinggis Khaan equestrian statue complex.",
      route: "Zamyn-Uud - Sainshand - Ulaanbaatar - Chinggis Khaan Statue Complex",
      itinerary: [
        "Day 1: Travel from Zamyn-Uud to Sainshand and visit Khamar Monastery",
        "Day 2: Ulaanbaatar city tour with the square, museum, and Gandan Monastery",
        "Day 3: Traditional Mongolian lifestyle experience",
        "Day 4: Chinggis Khaan Statue Complex and return",
      ],
      inclusions: ["Professional guide", "Transport on route", "Core trip coordination"],
      exclusions: ["Personal expenses", "Optional add-on activities"],
    },
    ru: {
      title: "Маршрут вокруг Улан-Батора / Для иностранных гостей /",
      summary: "Знакомство с Улан-Батором и традиционным монгольским бытом.",
      description:
        "Культурный маршрут по Улан-Батору с посещением семьи кочевников и комплекса конной статуи Чингисхана.",
      route: "Замын-Үүд - Сайншанд - Улан-Батор - Комплекс конной статуи Чингисхана",
      itinerary: [
        "День 1: Переезд из Замын-Үүда в Сайншанд и посещение монастыря Хамрын хийд",
        "День 2: Обзорная экскурсия по Улан-Батору, площадь, музей и монастырь Гандан",
        "День 3: Знакомство с традиционным монгольским бытом",
        "День 4: Комплекс конной статуи Чингисхана и возвращение",
      ],
      inclusions: ["Профессиональный гид", "Транспорт по маршруту", "Базовая организация поездки"],
      exclusions: ["Личные расходы", "Дополнительные активности по желанию"],
    },
    zh: {
      title: "乌兰巴托周边线路 / 面向国际游客 /",
      summary: "适合了解乌兰巴托城市文化与蒙古传统生活方式的精选行程。",
      description: "体验乌兰巴托的历史与文化，走访牧民家庭，并参观成吉思汗骑马雕像群。",
      route: "扎门乌德 - 赛音山达 - 乌兰巴托 - 成吉思汗骑马雕像群",
      itinerary: [
        "第 1 天：从扎门乌德前往赛音山达并参观哈木林寺",
        "第 2 天：乌兰巴托城市观光，参观广场、博物馆与甘丹寺",
        "第 3 天：体验蒙古传统生活方式",
        "第 4 天：参观成吉思汗骑马雕像群后返回",
      ],
      inclusions: ["专业向导", "行程内交通", "基础行程组织服务"],
      exclusions: ["个人消费", "自选附加活动"],
    },
  },
  "gobi-5d": {
    en: {
      title: "Gobi Route / For International Visitors /",
      summary: "A full program covering the key highlights of the Gobi.",
      description: "A five-day planned route covering Tsagaan Suvarga, Yol Valley, and Mukhar Shivert canyon.",
      route: "Sainshand - Ulaanbaatar - Mandalgovi - Tsagaan Suvarga - Yol Valley",
      itinerary: [
        "Day 1: Travel from Zamyn-Uud to Sainshand, visit Khamar Monastery, and arrive in Ulaanbaatar",
        "Day 2: Ulaanbaatar city tour",
        "Day 3: Mandalgovi, Tsagaan Suvarga, and Dalanzadgad",
        "Day 4: Mukhar Shivert canyon, Yol Valley, and return to Ulaanbaatar",
        "Day 5: Chinggis Khaan Statue Complex and return",
      ],
      inclusions: ["Professional guide", "Transport", "Core camp and route coordination"],
      exclusions: ["Personal use items", "Optional extra services"],
    },
    ru: {
      title: "Тур по Гоби / Для иностранных гостей /",
      summary: "Полная программа по ключевым точкам Гоби.",
      description: "Пятидневный маршрут через Цагаан Суварга, Ёлын Ам и ущелье Мухар Шивэрт.",
      route: "Сайншанд - Улан-Батор - Мандалговь - Цагаан Суварга - Ёлын Ам",
      itinerary: [
        "День 1: Переезд из Замын-Үүда в Сайншанд, посещение монастыря Хамрын хийд и прибытие в Улан-Батор",
        "День 2: Обзорная экскурсия по Улан-Батору",
        "День 3: Мандалговь, Цагаан Суварга и Даланзадгад",
        "День 4: Ущелье Мухар Шивэрт, Ёлын Ам и возвращение в Улан-Батор",
        "День 5: Комплекс конной статуи Чингисхана и возвращение",
      ],
      inclusions: ["Профессиональный гид", "Транспорт", "Базовая организация маршрута"],
      exclusions: ["Личные расходы", "Дополнительные услуги по желанию"],
    },
    zh: {
      title: "戈壁线路 / 面向国际游客 /",
      summary: "覆盖戈壁核心景点的完整行程。",
      description: "5 天游览白色佛塔、秃鹫谷和木哈尔希韦尔特峡谷等重点景点。",
      route: "赛音山达 - 乌兰巴托 - 曼达勒戈壁 - 白色佛塔 - 秃鹫谷",
      itinerary: [
        "第 1 天：从扎门乌德前往赛音山达，参观哈木林寺后抵达乌兰巴托",
        "第 2 天：乌兰巴托城市观光",
        "第 3 天：曼达勒戈壁、白色佛塔、达兰扎德嘎德",
        "第 4 天：木哈尔希韦尔特峡谷、秃鹫谷，随后返回乌兰巴托",
        "第 5 天：成吉思汗骑马雕像群后返回",
      ],
      inclusions: ["专业向导", "交通", "基础营地与路线组织"],
      exclusions: ["个人消费", "自选附加服务"],
    },
  },
  "khangai-7d": {
    en: {
      title: "Khangai Route / For International Visitors /",
      summary: "A long route combining the nature and culture of Khangai and Khuvsgul.",
      description: "A seven-day route through Khuvsgul and the Darkhad region.",
      route: "Sainshand - Ulaanbaatar - Khuvsgul - Darkhad",
      itinerary: [
        "Day 1: Travel from Zamyn-Uud to Sainshand and visit Khamar Monastery",
        "Day 2: Ulaanbaatar city tour",
        "Day 3: Khuvsgul aimag and Muren",
        "Day 4: Renchinlkhumbe, Jargant River, and the 13 ovoo of Darkhad",
        "Day 5: Lake Khuvsgul",
        "Day 6: Return to Ulaanbaatar",
        "Day 7: Chinggis Khaan Statue Complex and return",
      ],
      inclusions: ["Guide", "Transport", "Route coordination"],
      exclusions: ["Personal expenses", "Optional trip add-ons"],
    },
    ru: {
      title: "Тур по Хангаю / Для иностранных гостей /",
      summary: "Длинный маршрут по природе и культуре Хангая и Хөвсгёла.",
      description: "Семидневное путешествие по Хөвсгёлу и Дархадскому краю.",
      route: "Сайншанд - Улан-Батор - Хөвсгөл - Дархад",
      itinerary: [
        "День 1: Переезд из Замын-Үүда в Сайншанд и посещение монастыря Хамрын хийд",
        "День 2: Обзорная экскурсия по Улан-Батору",
        "День 3: Аймак Хөвсгөл и Мөрөн",
        "День 4: Рэнчинлхүмбэ, река Жаргант-Гол и 13 обо Дархада",
        "День 5: Озеро Хөвсгөл",
        "День 6: Возвращение в Улан-Батор",
        "День 7: Комплекс конной статуи Чингисхана и возвращение",
      ],
      inclusions: ["Гид", "Транспорт", "Организация маршрута"],
      exclusions: ["Личные расходы", "Дополнительные услуги по желанию"],
    },
    zh: {
      title: "杭爱线路 / 面向国际游客 /",
      summary: "结合杭爱与库苏古尔自然风光和文化体验的长线行程。",
      description: "7 天游览库苏古尔与达尔哈德地区。",
      route: "赛音山达 - 乌兰巴托 - 库苏古尔 - 达尔哈德",
      itinerary: [
        "第 1 天：从扎门乌德前往赛音山达并参观哈木林寺",
        "第 2 天：乌兰巴托城市观光",
        "第 3 天：前往库苏古尔省木伦",
        "第 4 天：仁钦伦布、扎尔甘特河与达尔哈德十三敖包",
        "第 5 天：库苏古尔湖",
        "第 6 天：返回乌兰巴托",
        "第 7 天：成吉思汗骑马雕像群后返回",
      ],
      inclusions: ["向导", "交通", "行程组织服务"],
      exclusions: ["个人消费", "自选附加项目"],
    },
  },
  "aglag-1d": {
    mn: {
      title: "Аглаг бүтээлийн хийдийн 1 өдрийн аялал",
      summary: "Өдрийн мөргөл, байгалийн тайван орчинтой маршрут.",
      description: "Улаанбаатар орчмын хамгийн эрэлттэй өдрийн аяллын нэг.",
      route: "Улаанбаатар орчим",
      pricingNote: "Үнэ хүсэлтээр",
      itinerary: ["1 өдөр: Аглаг бүтээлийн хийд"],
    },
    en: {
      title: "Aglag Monastery Day Tour",
      summary: "A peaceful day route with pilgrimage and nature.",
      description: "One of the most requested day tours around Ulaanbaatar.",
      route: "Around Ulaanbaatar",
      pricingNote: "Price on request",
      itinerary: ["Day 1: Aglag Monastery"],
      inclusions: ["Guide", "Transport"],
      exclusions: ["Meals", "Personal expenses"],
    },
    ru: {
      title: "Однодневный тур в монастырь Аглаг",
      summary: "Спокойный однодневный маршрут с паломничеством и природой.",
      description: "Один из самых востребованных однодневных маршрутов вокруг Улан-Батора.",
      route: "Окрестности Улан-Батора",
      pricingNote: "Цена по запросу",
      itinerary: ["День 1: Монастырь Аглаг"],
      inclusions: ["Гид", "Транспорт"],
      exclusions: ["Питание", "Личные расходы"],
    },
    zh: {
      title: "阿格拉格寺一日游",
      summary: "兼具朝圣与自然氛围的宁静一日路线。",
      description: "乌兰巴托周边最受欢迎的一日线路之一。",
      route: "乌兰巴托周边",
      pricingNote: "价格面议",
      itinerary: ["第 1 天：阿格拉格寺"],
      inclusions: ["向导", "交通"],
      exclusions: ["餐食", "个人消费"],
    },
  },
  "gobi-2d": {
    mn: {
      title: "Говийн богино хугацаат аялал",
      summary: "Дотоод жуулчдад зориулсан богино Говийн маршрут.",
      description: "Цагаан суварга, Ёлын ам, Мухар шивэртийн амыг хамарсан 2 өдөр, 1 шөнийн аялал.",
      route: "Цагаан суварга - Ёлын ам - Мухар шивэртийн ам",
      pricingNote: "Үнэ хүсэлтээр",
      durationNights: 1,
      itinerary: [
        "1 өдөр: Цагаан суварга",
        "2 өдөр: Ёлын ам, Мухар шивэртийн ам, Өмнөговийн байгалийн түүхийн музей үзээд Улаанбаатар руу буцна",
      ],
    },
    en: {
      title: "Short Gobi Tour",
      summary: "A compact Gobi route for local travelers.",
      description: "A 2-day, 1-night route covering Tsagaan Suvarga, Yol Valley, and Mukhar Shivert canyon.",
      route: "Tsagaan Suvarga - Yol Valley - Mukhar Shivert canyon",
      pricingNote: "Price on request",
      durationNights: 1,
      itinerary: [
        "Day 1: Tsagaan Suvarga",
        "Day 2: Yol Valley, Mukhar Shivert canyon, South Gobi Natural History Museum, and return to Ulaanbaatar",
      ],
      inclusions: ["Guide", "Transport"],
      exclusions: ["Personal expenses", "Optional extra services"],
    },
    ru: {
      title: "Короткий тур по Гоби",
      summary: "Короткий маршрут по Гоби для местных путешественников.",
      description: "Маршрут на 2 дня и 1 ночь через Цагаан Суварга, Ёлын Ам и ущелье Мухар Шивэрт.",
      route: "Цагаан Суварга - Ёлын Ам - ущелье Мухар Шивэрт",
      pricingNote: "Цена по запросу",
      durationNights: 1,
      itinerary: [
        "День 1: Цагаан Суварга",
        "День 2: Ёлын Ам, ущелье Мухар Шивэрт, музей природы Южной Гоби и возвращение в Улан-Батор",
      ],
      inclusions: ["Гид", "Транспорт"],
      exclusions: ["Личные расходы", "Дополнительные услуги по желанию"],
    },
    zh: {
      title: "戈壁短线行程",
      summary: "面向蒙古国内游客的戈壁短线。",
      description: "2 天 1 晚游览白色佛塔、秃鹫谷和木哈尔希韦尔特峡谷。",
      route: "白色佛塔 - 秃鹫谷 - 木哈尔希韦尔特峡谷",
      pricingNote: "价格面议",
      durationNights: 1,
      itinerary: [
        "第 1 天：白色佛塔",
        "第 2 天：秃鹫谷、木哈尔希韦尔特峡谷、南戈壁自然历史博物馆，随后返回乌兰巴托",
      ],
      inclusions: ["向导", "交通"],
      exclusions: ["个人消费", "自选附加服务"],
    },
  },
  "Ээж хад - 1 өдөр": {
    mn: {
      title: "Ээж хад, Манзушир хийдийн туурийн 1 өдрийн аялал",
      summary: "Ээж хаданд мөргөж, Манзушир хийдийн туурь үзэх өдрийн маршрут.",
      description:
        "Ээж хад нь Төв аймгийн Сэргэлэн суманд байрладаг шүтээний газар. Манзушир хийдийн туурь нь Төв аймгийн Зуунмод суманд оршдог бөгөөд нэг өдрийн дотор хамтатган үзэх боломжтой.",
      route: "Улаанбаатар - Ээж хад - Манзушир хийдийн туурь - Улаанбаатар",
      itinerary: ["1 өдөр: Ээж хаданд мөргөж, Манзушир хийдийн туурь үзээд Улаанбаатарт буцна"],
      inclusions: ["Аяллын ирэх, очих унаа", "Жолооч, хөтчийн үйлчилгээ"],
      exclusions: ["Аяллын турш хоол", "Нэмэлт үйлчилгээ"],
    },
    en: {
      title: "Eej Khad and Manzushir Ruins Day Tour / Tuv Province /",
      summary: "A day route for pilgrimage at Eej Khad and a visit to the Manzushir Monastery ruins.",
      description:
        "Eej Khad is a sacred stop in Sergelen soum, Tuv aimag. The route continues to the Manzushir Monastery ruins in Zuunmod soum for a compact spiritual day trip.",
      route: "Ulaanbaatar - Eej Khad - Manzushir Monastery Ruins - Ulaanbaatar",
      itinerary: ["Day 1: Visit Eej Khad, continue to the Manzushir Monastery ruins, and return to Ulaanbaatar"],
      inclusions: ["Round-trip transport", "Driver and guide service"],
      exclusions: ["Meals during the tour", "Additional services"],
    },
    ru: {
      title: "Однодневный тур к Ээж Хад и руинам монастыря Манзушир / Аймак Төв /",
      summary: "Однодневный маршрут с паломничеством к Ээж Хад и посещением руин монастыря Манзушир.",
      description:
        "Ээж Хад находится в сомоне Сэргэлэн аймака Төв. Далее маршрут проходит через руины монастыря Манзушир в сомоне Зуунмод и подходит для спокойной духовной поездки на один день.",
      route: "Улан-Батор - Ээж Хад - руины монастыря Манзушир - Улан-Батор",
      itinerary: ["День 1: Посещение Ээж Хад, руин монастыря Манзушир и возвращение в Улан-Батор"],
      inclusions: ["Транспорт туда и обратно", "Услуги водителя и гида"],
      exclusions: ["Питание во время тура", "Дополнительные услуги"],
    },
    zh: {
      title: "母亲圣石与曼珠希尔寺遗址一日游 / 中央省 /",
      summary: "前往母亲圣石祈福并参观曼珠希尔寺遗址的一日路线。",
      description:
        "母亲圣石位于中央省色尔格楞苏木，是当地朝圣地点之一。随后前往中央省宗莫德附近的曼珠希尔寺遗址，适合安排成一天的静心行程。",
      route: "乌兰巴托 - 母亲圣石 - 曼珠希尔寺遗址 - 乌兰巴托",
      itinerary: ["第 1 天：前往母亲圣石祈福，参观曼珠希尔寺遗址后返回乌兰巴托"],
      inclusions: ["往返交通", "司机与向导服务"],
      exclusions: ["行程餐食", "附加服务"],
    },
  },
};

function repairList(items: string[]) {
  return items.map((item) => repairText(item).trim()).filter(Boolean);
}

function normalizeOverrideKey(value: string) {
  return repairText(value).trim().toLowerCase();
}

function normalizeTour(tour: Tour): Tour {
  return {
    ...tour,
    slug: repairText(tour.slug).trim(),
    title: repairText(tour.title).trim(),
    summary: repairText(tour.summary).trim(),
    description: repairText(tour.description).trim(),
    route: repairText(tour.route).trim(),
    pricingNote: repairText(tour.pricingNote || "").trim(),
    itinerary: repairList(tour.itinerary),
    inclusions: repairList(tour.inclusions),
    exclusions: repairList(tour.exclusions),
  };
}

export function localizeTour(tour: Tour, locale: Locale): Tour {
  const normalized = normalizeTour(tour);
  const normalizedSlug = normalizeOverrideKey(tour.slug);
  const normalizedTitle = normalizeOverrideKey(tour.title);
  const overrideEntry = Object.entries(localizedTours).find(
    ([slug]) => {
      const normalizedKey = normalizeOverrideKey(slug);
      return normalizedKey === normalizedSlug || normalizedKey === normalizedTitle;
    },
  );
  const override = overrideEntry ? repairDeep(overrideEntry[1]?.[locale]) : undefined;

  if (!override) {
    return normalized;
  }

  return {
    ...normalized,
    ...override,
    pricingNote: override.pricingNote ?? normalized.pricingNote,
    itinerary: override.itinerary ?? normalized.itinerary,
    inclusions: override.inclusions ?? normalized.inclusions,
    exclusions: override.exclusions ?? normalized.exclusions,
  };
}
