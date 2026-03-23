import type { Locale } from "./i18n";

export type MarketCity = {
  code: string;
  timezone: string;
  lat: number;
  lon: number;
  quoteCurrency: string;
  fallbackTemp: number;
  fallbackWeatherCode: number;
  flag: string;
  city: Record<Locale, string>;
};

export type MarketSnapshotItem = {
  code: string;
  city: string;
  flag: string;
  quoteCurrency: string;
  localTime: string;
  rate: number;
  temperatureC: number;
  weatherCode: number;
  weatherText: string;
};

const localeTags: Record<Locale, string> = {
  mn: "mn-MN",
  en: "en-US",
  ru: "ru-RU",
  zh: "zh-CN",
};

export function localeTag(locale: Locale) {
  return localeTags[locale];
}

export const marketCities: MarketCity[] = [
  {
    code: "ulaanbaatar",
    timezone: "Asia/Ulaanbaatar",
    lat: 47.8864,
    lon: 106.9057,
    quoteCurrency: "MNT",
    fallbackTemp: -8,
    fallbackWeatherCode: 2,
    flag: "🇲🇳",
    city: { mn: "Улаанбаатар", en: "Ulaanbaatar", ru: "Улан-Батор", zh: "乌兰巴托" },
  },
  {
    code: "beijing",
    timezone: "Asia/Shanghai",
    lat: 39.9042,
    lon: 116.4074,
    quoteCurrency: "CNY",
    fallbackTemp: 11,
    fallbackWeatherCode: 1,
    flag: "🇨🇳",
    city: { mn: "Бээжин", en: "Beijing", ru: "Пекин", zh: "北京" },
  },
  {
    code: "dubai",
    timezone: "Asia/Dubai",
    lat: 25.2048,
    lon: 55.2708,
    quoteCurrency: "AED",
    fallbackTemp: 28,
    fallbackWeatherCode: 0,
    flag: "🇦🇪",
    city: { mn: "Дубай", en: "Dubai", ru: "Дубай", zh: "迪拜" },
  },
  {
    code: "moscow",
    timezone: "Europe/Moscow",
    lat: 55.7558,
    lon: 37.6176,
    quoteCurrency: "RUB",
    fallbackTemp: -3,
    fallbackWeatherCode: 3,
    flag: "🇷🇺",
    city: { mn: "Москва", en: "Moscow", ru: "Москва", zh: "莫斯科" },
  },
];

export const fallbackRates: Record<string, number> = {
  MNT: 3450,
  CNY: 7.2,
  AED: 3.67,
  RUB: 91.4,
};

export function weatherLabel(code: number, locale: Locale) {
  const labels: Record<number, Record<Locale, string>> = {
    0: { mn: "Цэлмэг", en: "Clear", ru: "Ясно", zh: "晴" },
    1: { mn: "Бага зэргийн үүлтэй", en: "Mostly clear", ru: "Малооблачно", zh: "少云" },
    2: { mn: "Үүлэрхэг", en: "Partly cloudy", ru: "Переменная облачность", zh: "多云" },
    3: { mn: "Бүрхэг", en: "Overcast", ru: "Пасмурно", zh: "阴天" },
    45: { mn: "Манантай", en: "Fog", ru: "Туман", zh: "有雾" },
    48: { mn: "Цантсан манан", en: "Rime fog", ru: "Изморозь", zh: "冻雾" },
    51: { mn: "Шиврээ бороо", en: "Drizzle", ru: "Морось", zh: "毛毛雨" },
    61: { mn: "Бороо", en: "Rain", ru: "Дождь", zh: "下雨" },
    71: { mn: "Цастай", en: "Snow", ru: "Снег", zh: "下雪" },
    80: { mn: "Аадар", en: "Showers", ru: "Ливень", zh: "阵雨" },
    95: { mn: "Аянгатай", en: "Thunderstorm", ru: "Гроза", zh: "雷暴" },
  };
  return labels[code]?.[locale] || labels[3][locale];
}

export function buildFallbackSnapshot(locale: Locale): MarketSnapshotItem[] {
  const now = new Date();
  return marketCities.map((city) => ({
    code: city.code,
    city: city.city[locale],
    flag: city.flag,
    quoteCurrency: city.quoteCurrency,
    localTime: new Intl.DateTimeFormat(localeTag(locale), {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: city.timezone,
    }).format(now),
    rate: fallbackRates[city.quoteCurrency] ?? 1,
    temperatureC: city.fallbackTemp,
    weatherCode: city.fallbackWeatherCode,
    weatherText: weatherLabel(city.fallbackWeatherCode, locale),
  }));
}
