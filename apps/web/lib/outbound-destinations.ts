import type { Locale } from "@/lib/i18n";

export type OutboundDestination = {
  slug: "moscow" | "beijing" | "dubai";
  href: string;
  image: string;
  country: Record<Locale, string>;
  title: Record<Locale, string>;
  route: Record<Locale, string>;
  summary: Record<Locale, string>;
};

export const outboundDestinations: OutboundDestination[] = [
  {
    slug: "moscow",
    href: "/ayalluud/outbound?search=Москва",
    image:
      "https://images.unsplash.com/photo-1513326738677-b964603b136d?q=80&w=1200&auto=format&fit=crop",
    country: {
      mn: "ОХУ",
      en: "Russia",
      ru: "Россия",
      zh: "俄罗斯",
    },
    title: {
      mn: "Москва хотын аялал",
      en: "Moscow city trip",
      ru: "Путешествие в Москву",
      zh: "莫斯科城市之旅",
    },
    route: {
      mn: "Москва хот, соёлын үзвэр, хотын аялал",
      en: "Moscow, cultural highlights, city exploration",
      ru: "Москва, культурные объекты, обзор по городу",
      zh: "莫斯科城市风景与文化行程",
    },
    summary: {
      mn: "ОХУ-ын нийслэл Москва хотын түүхэн төв, соёлын үзвэр, хотын аяллын үндсэн мэдээллийг үзэх боломжтой.",
      en: "Explore key city-trip information for Moscow, including historic sights, cultural stops, and urban highlights.",
      ru: "Здесь можно посмотреть основную информацию о поездке в Москву: исторический центр, культурные объекты и городскую программу.",
      zh: "可查看莫斯科城市旅行的主要信息，包括历史城区、文化景点和城市行程亮点。",
    },
  },
  {
    slug: "beijing",
    href: "/ayalluud/outbound?search=Бээжин",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop",
    country: {
      mn: "БНХАУ",
      en: "China",
      ru: "Китай",
      zh: "中国",
    },
    title: {
      mn: "Бээжин хотын аялал",
      en: "Beijing city trip",
      ru: "Путешествие в Пекин",
      zh: "北京城市之旅",
    },
    route: {
      mn: "Бээжин хот, түүх соёл, худалдааны бүс",
      en: "Beijing, history, culture, shopping areas",
      ru: "Пекин, история, культура, торговые районы",
      zh: "北京历史文化与商业区域行程",
    },
    summary: {
      mn: "Бээжин хотын түүх, соёл, хотын аялал, худалдааны үндсэн чиглэлүүдийг нэг дороос танилцуулна.",
      en: "See a concise overview of Beijing city travel, cultural landmarks, and popular shopping districts.",
      ru: "Краткий обзор поездки в Пекин: городские маршруты, культурные достопримечательности и торговые районы.",
      zh: "集中查看北京城市旅游、文化景点与热门购物区域的主要信息。",
    },
  },
  {
    slug: "dubai",
    href: "/ayalluud/outbound?search=Дубай",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    country: {
      mn: "АНЭУ",
      en: "UAE",
      ru: "ОАЭ",
      zh: "阿联酋",
    },
    title: {
      mn: "Дубай хотын аялал",
      en: "Dubai city trip",
      ru: "Путешествие в Дубай",
      zh: "迪拜城市之旅",
    },
    route: {
      mn: "Дубай хот, амралт, хотын үзвэр, худалдаа",
      en: "Dubai, leisure, city attractions, shopping",
      ru: "Дубай, отдых, достопримечательности, шопинг",
      zh: "迪拜休闲、城市景点与购物行程",
    },
    summary: {
      mn: "Дубай хотын амралт, худалдаа, орчин үеийн үзвэрийн аяллын товч мэдээллийг эндээс үзээрэй.",
      en: "Review a clear summary of Dubai leisure travel, modern attractions, and shopping-focused itineraries.",
      ru: "Здесь собрана краткая информация о поездке в Дубай: отдых, современные достопримечательности и шопинг.",
      zh: "这里可查看迪拜休闲旅行、现代景点和购物行程的简明介绍。",
    },
  },
];
