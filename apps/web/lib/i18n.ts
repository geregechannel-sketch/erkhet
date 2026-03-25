import { repairDeep } from "@/lib/text";

export const supportedLocales = ["mn", "en", "ru", "zh"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "mn";
export const localeCookieName = "erkhet_locale";

export function resolveLocale(value?: string | null): Locale {
  if (!value) return defaultLocale;
  const normalized = value.toLowerCase();
  if (normalized === "zh-cn" || normalized === "cn") return "zh";
  return (supportedLocales as readonly string[]).includes(normalized) ? (normalized as Locale) : defaultLocale;
}

const rawLocaleLabels: Record<Locale, string> = {
  mn: "Монгол",
  en: "English",
  ru: "Русский",
  zh: "中文",
};

export const localeLabels = repairDeep(rawLocaleLabels) as Record<Locale, string>;

const rawLocaleShortLabels: Record<Locale, string> = {
  mn: "MN",
  en: "EN",
  ru: "RU",
  zh: "中文",
};

export const localeShortLabels = repairDeep(rawLocaleShortLabels) as Record<Locale, string>;

export const localeFlags: Record<Locale, string> = {
  mn: "🇲🇳",
  en: "🇬🇧",
  ru: "🇷🇺",
  zh: "🇨🇳",
};

type ChromeMessages = {
  brandTagline: string;
  goMongolia: string;
  mainNav: { href: string; label: string }[];
  utility: {
    myAccount: string;
    myBookings: string;
    login: string;
    register: string;
    admin: string;
    requestBooking: string;
    menu: string;
    userSection: string;
    guestSection: string;
    adminSection: string;
    logout: string;
    guestTitle: string;
    guestPrompt: string;
    startTrip: string;
    promoTitle: string;
    promoBody: string;
    promoButton: string;
    adminDashboard: string;
    stats: string;
    requests: string;
    language: string;
    marketFallback: string;
  };
  footer: {
    intro: string;
    groups: { title: string; links: { href: string; label: string }[] }[];
    rights: string;
  };
};

const rawChromeMessages: Record<Locale, ChromeMessages> = {
  mn: {
    brandTagline: "Монгол аяллын зөвлөх үйлчилгээ",
    goMongolia: "Миний аялал",
    mainNav: [
      { href: "/about", label: "Бидний тухай" },
      { href: "/tours", label: "Аяллууд" },
      { href: "/daily-tours", label: "Өдрийн аялал" },
      { href: "/destinations", label: "Чиглэлүүд" },
      { href: "/travel-guide", label: "Аялалын үеийн зөвлөгөө" },
      { href: "/services", label: "Үйлчилгээ" },
      { href: "/reviews", label: "Сэтгэгдэл" },
      { href: "/booking-payment", label: "Захиалга / Төлбөр" },
      { href: "/contact", label: "Холбоо барих" },
    ],
    utility: {
      myAccount: "Миний хэсэг",
      myBookings: "Миний захиалгууд",
      login: "Нэвтрэх",
      register: "Бүртгүүлэх",
      admin: "Админ",
      requestBooking: "Захиалга өгөх",
      menu: "Цэс",
      userSection: "Хэрэглэгчийн хэсэг",
      guestSection: "Хэрэглэгчийн хандалт",
      adminSection: "Админ",
      logout: "Гарах",
      guestTitle: "Нэг бүртгэл, нэг хяналт",
      guestPrompt: "Нэвтэрсний дараа хадгалсан аялал, захиалга, төлбөр, хүсэлтээ нэг дороос хянаарай.",
      startTrip: "Төлөвлөлтийг эхлүүлэх",
      promoTitle: "Төсөв, хугацаа, чиглэлдээ тохирсон саналаа аваарай",
      promoBody: "10 алхамт төлөвлөлтийн урсгалаар аяллын хүсэлтээ илгээж, дараагийн шат бүрийг хувийн хэсгээсээ хянаарай.",
      promoButton: "Аялал төлөвлөх",
      adminDashboard: "Админ самбар",
      stats: "Статистик",
      requests: "Хүсэлтүүд",
      language: "Хэл",
      marketFallback: "Хотын мэдээлэл ачаалж байна",
    },
    footer: {
      intro: "Гадаад, дотоод, outbound аялал, захиалга, төлбөр, хэрэглэгчийн удирдлагыг нэг дор төвлөрүүлсэн аяллын үйлчилгээний платформ.",
      groups: [
        {
          title: "Компанийн тухай",
          links: [
            { href: "/about", label: "Бидний тухай" },
            { href: "/travel-guide", label: "Аялалын үеийн зөвлөгөө" },
            { href: "/reviews", label: "Сэтгэгдэл" },
            { href: "/contact", label: "Холбоо барих" },
          ],
        },
        {
          title: "Аялал ба үйлчилгээ",
          links: [
            { href: "/tours", label: "Аяллууд" },
            { href: "/daily-tours", label: "Өдрийн аялал" },
            { href: "/destinations", label: "Чиглэлүүд" },
            { href: "/services", label: "Үйлчилгээ" },
          ],
        },
        {
          title: "Захиалга",
          links: [
            { href: "/booking-payment", label: "Захиалга / Төлбөр" },
            { href: "/account", label: "Миний хэсэг" },
            { href: "/enquire/step/1", label: "Аялал төлөвлөх" },
            { href: "/help", label: "FAQ / Бодлого" },
          ],
        },
      ],
      rights: "Бүх эрх хуулиар хамгаалагдсан.",
    },
  },
  en: {
    brandTagline: "Travel advisory and booking services for Mongolia",
    goMongolia: "My Trip",
    mainNav: [
      { href: "/about", label: "About" },
      { href: "/tours", label: "Tours" },
      { href: "/daily-tours", label: "Day Tours" },
      { href: "/destinations", label: "Destinations" },
      { href: "/travel-guide", label: "Travel Guide" },
      { href: "/services", label: "Services" },
      { href: "/reviews", label: "Reviews" },
      { href: "/booking-payment", label: "Booking / Payment" },
      { href: "/contact", label: "Contact" },
    ],
    utility: {
      myAccount: "My Account",
      myBookings: "My Bookings",
      login: "Sign In",
      register: "Register",
      admin: "Admin",
      requestBooking: "Request Booking",
      menu: "Menu",
      userSection: "User Area",
      guestSection: "Guest Access",
      adminSection: "Admin",
      logout: "Logout",
      guestTitle: "One account, one control panel",
      guestPrompt: "Sign in to review saved tours, bookings, payments, and support requests in one place.",
      startTrip: "Start planning",
      promoTitle: "Get a proposal matched to your budget, timing, and route",
      promoBody: "Use the 10-step planning flow to submit your request and follow each next stage from your account.",
      promoButton: "Plan a trip",
      adminDashboard: "Admin Dashboard",
      stats: "Statistics",
      requests: "Requests",
      language: "Language",
      marketFallback: "Loading city snapshots",
    },
    footer: {
      intro: "A connected travel platform for inbound, domestic, outbound tours, bookings, payments, and customer management.",
      groups: [
        {
          title: "Company",
          links: [
            { href: "/about", label: "About" },
            { href: "/travel-guide", label: "Travel Guide" },
            { href: "/reviews", label: "Reviews" },
            { href: "/contact", label: "Contact" },
          ],
        },
        {
          title: "Travel & Services",
          links: [
            { href: "/tours", label: "Tours" },
            { href: "/daily-tours", label: "Day Tours" },
            { href: "/destinations", label: "Destinations" },
            { href: "/services", label: "Services" },
          ],
        },
        {
          title: "Booking",
          links: [
            { href: "/booking-payment", label: "Booking / Payment" },
            { href: "/account", label: "My Account" },
            { href: "/enquire/step/1", label: "Plan a Trip" },
            { href: "/help", label: "FAQ / Policy" },
          ],
        },
      ],
      rights: "All rights reserved.",
    },
  },
  ru: {
    brandTagline: "Туристические консультации и бронирование по Монголии",
    goMongolia: "Моё путешествие",
    mainNav: [
      { href: "/about", label: "О нас" },
      { href: "/tours", label: "Туры" },
      { href: "/daily-tours", label: "Однодневные туры" },
      { href: "/destinations", label: "Направления" },
      { href: "/travel-guide", label: "Путеводитель" },
      { href: "/services", label: "Услуги" },
      { href: "/reviews", label: "Отзывы" },
      { href: "/booking-payment", label: "Бронирование / Оплата" },
      { href: "/contact", label: "Контакты" },
    ],
    utility: {
      myAccount: "Мой кабинет",
      myBookings: "Мои бронирования",
      login: "Войти",
      register: "Регистрация",
      admin: "Админ",
      requestBooking: "Оставить заявку",
      menu: "Меню",
      userSection: "Личный кабинет",
      guestSection: "Доступ пользователя",
      adminSection: "Админ",
      logout: "Выйти",
      guestTitle: "Одна учетная запись, единый контроль",
      guestPrompt: "Войдите, чтобы отслеживать сохраненные туры, бронирования, платежи и запросы в одном месте.",
      startTrip: "Начать планирование",
      promoTitle: "Получите предложение под ваш бюджет, сроки и маршрут",
      promoBody: "Используйте 10-шаговый сценарий планирования и отслеживайте следующие этапы из личного кабинета.",
      promoButton: "Планировать поездку",
      adminDashboard: "Админ-панель",
      stats: "Статистика",
      requests: "Запросы",
      language: "Язык",
      marketFallback: "Загружаем данные по городам",
    },
    footer: {
      intro: "Единая travel-платформа для inbound, domestic, outbound туров, бронирований, оплат и управления клиентами.",
      groups: [
        {
          title: "Компания",
          links: [
            { href: "/about", label: "О нас" },
            { href: "/travel-guide", label: "Путеводитель" },
            { href: "/reviews", label: "Отзывы" },
            { href: "/contact", label: "Контакты" },
          ],
        },
        {
          title: "Туры и услуги",
          links: [
            { href: "/tours", label: "Туры" },
            { href: "/daily-tours", label: "Однодневные туры" },
            { href: "/destinations", label: "Направления" },
            { href: "/services", label: "Услуги" },
          ],
        },
        {
          title: "Бронирование",
          links: [
            { href: "/booking-payment", label: "Бронирование / Оплата" },
            { href: "/account", label: "Личный кабинет" },
            { href: "/enquire/step/1", label: "План поездки" },
            { href: "/help", label: "FAQ / Политики" },
          ],
        },
      ],
      rights: "Все права защищены.",
    },
  },
  zh: {
    brandTagline: "蒙古旅行咨询与预订服务",
    goMongolia: "我的旅程",
    mainNav: [
      { href: "/about", label: "关于我们" },
      { href: "/tours", label: "旅游线路" },
      { href: "/daily-tours", label: "一日游" },
      { href: "/destinations", label: "目的地" },
      { href: "/travel-guide", label: "旅行指南" },
      { href: "/services", label: "服务" },
      { href: "/reviews", label: "评价" },
      { href: "/booking-payment", label: "预订 / 支付" },
      { href: "/contact", label: "联系我们" },
    ],
    utility: {
      myAccount: "我的账户",
      myBookings: "我的预订",
      login: "登录",
      register: "注册",
      admin: "管理",
      requestBooking: "提交预订",
      menu: "菜单",
      userSection: "用户中心",
      guestSection: "访客入口",
      adminSection: "管理",
      logout: "退出",
      guestTitle: "一个账户，统一管理",
      guestPrompt: "登录后即可在一个地方查看收藏线路、预订、支付和支持请求。",
      startTrip: "开始规划",
      promoTitle: "获取符合预算、时间和路线的方案",
      promoBody: "通过 10 步规划流程提交需求，并在个人账户中跟进每一步状态。",
      promoButton: "规划行程",
      adminDashboard: "管理后台",
      stats: "统计",
      requests: "请求",
      language: "语言",
      marketFallback: "正在加载城市快照",
    },
    footer: {
      intro: "一个连接 inbound、domestic、outbound 旅游、预订、支付和客户管理的综合平台。",
      groups: [
        {
          title: "公司",
          links: [
            { href: "/about", label: "关于我们" },
            { href: "/travel-guide", label: "旅行指南" },
            { href: "/reviews", label: "评价" },
            { href: "/contact", label: "联系我们" },
          ],
        },
        {
          title: "旅游与服务",
          links: [
            { href: "/tours", label: "旅游线路" },
            { href: "/daily-tours", label: "一日游" },
            { href: "/destinations", label: "目的地" },
            { href: "/services", label: "服务" },
          ],
        },
        {
          title: "预订",
          links: [
            { href: "/booking-payment", label: "预订 / 支付" },
            { href: "/account", label: "我的账户" },
            { href: "/enquire/step/1", label: "规划行程" },
            { href: "/help", label: "FAQ / 政策" },
          ],
        },
      ],
      rights: "保留所有权利。",
    },
  },
};

export const chromeMessages = repairDeep(rawChromeMessages) as Record<Locale, ChromeMessages>;



