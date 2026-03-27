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
  mainNav: {
    href: string;
    label: string;
    matchPrefixes?: string[];
    children?: {
      href: string;
      label: string;
      description: string;
      quickLinks?: {
        href: string;
        label: string;
      }[];
    }[];
  }[];
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
      {
        href: "/ayalluud",
        label: "Аяллууд",
        matchPrefixes: ["/ayalluud", "/tours", "/daily-tours", "/destinations"],
        children: [
          {
            href: "/ayalluud/inbound",
            label: "Гадаад жуулчдад Монголын аялал",
            description: "Монголд ирж аялах гадаад жуулчдад зориулсан аяллууд",
          },
          {
            href: "/ayalluud/outbound",
            label: "Монголчуудад гадаад аялал",
            description: "Гадаад улс руу явах аяллууд",
          },
          {
            href: "/ayalluud/domestic",
            label: "Дотоод аялал",
            description: "Монгол орноор аялах аяллууд",
          },
        ],
      },
      {
        href: "/services",
        label: "Үйлчилгээ",
        matchPrefixes: ["/services", "/travel-guide", "/reviews", "/booking-payment"],
        children: [
          {
            href: "/travel-guide",
            label: "Аялалын үеийн зөвлөгөө",
            description: "Аяллын өмнө болон аяллын үеэр хэрэгтэй зөвлөгөө",
          },
          {
            href: "/reviews",
            label: "Сэтгэгдэл",
            description: "Санал хүсэлт болон хэрэглэгчийн сэтгэгдэл",
          },
          {
            href: "/booking-payment",
            label: "Захиалга / Төлбөр",
            description: "Захиалга, төлбөрийн мэдээллээ нэг дороос харах хэсэг",
          },
        ],
      },
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
            { href: "/ayalluud/inbound", label: "Гадаад жуулчдад Монголын аялал" },
            { href: "/ayalluud/outbound", label: "Монголчуудад гадаад аялал" },
            { href: "/ayalluud/domestic", label: "Дотоод аялал" },
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
      {
        href: "/ayalluud",
        label: "Tours",
        matchPrefixes: ["/ayalluud", "/tours", "/daily-tours", "/destinations"],
        children: [
          {
            href: "/ayalluud/inbound",
            label: "Mongolia tours for foreign visitors",
            description: "Tours for international visitors traveling in Mongolia",
          },
          {
            href: "/ayalluud/outbound",
            label: "International trips for Mongolian travelers",
            description: "Trips for Mongolian travelers going abroad",
          },
          {
            href: "/ayalluud/domestic",
            label: "Domestic tours",
            description: "Tours around Mongolia for local travelers",
          },
        ],
      },
      {
        href: "/services",
        label: "Services",
        matchPrefixes: ["/services", "/travel-guide", "/reviews", "/booking-payment"],
        children: [
          {
            href: "/travel-guide",
            label: "Travel Guide",
            description: "Useful travel tips before and during your trip",
          },
          {
            href: "/reviews",
            label: "Reviews",
            description: "Customer feedback and travel impressions",
          },
          {
            href: "/booking-payment",
            label: "Booking / Payment",
            description: "Check your booking and payment details in one place",
          },
        ],
      },
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
            { href: "/ayalluud/inbound", label: "Mongolia tours for foreign visitors" },
            { href: "/ayalluud/outbound", label: "International trips for Mongolian travelers" },
            { href: "/ayalluud/domestic", label: "Domestic tours" },
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
      {
        href: "/ayalluud",
        label: "Туры",
        matchPrefixes: ["/ayalluud", "/tours", "/daily-tours", "/destinations"],
        children: [
          {
            href: "/ayalluud/inbound",
            label: "Туры по Монголии для иностранных гостей",
            description: "Туры для иностранных гостей, приезжающих в Монголию",
          },
          {
            href: "/ayalluud/outbound",
            label: "Зарубежные поездки для монгольских туристов",
            description: "Туры для граждан Монголии за рубеж",
          },
          {
            href: "/ayalluud/domestic",
            label: "Внутренние туры",
            description: "Путешествия по Монголии для местных туристов",
          },
        ],
      },
      {
        href: "/services",
        label: "Услуги",
        matchPrefixes: ["/services", "/travel-guide", "/reviews", "/booking-payment"],
        children: [
          {
            href: "/travel-guide",
            label: "Путеводитель",
            description: "Полезные советы до поездки и во время путешествия",
          },
          {
            href: "/reviews",
            label: "Отзывы",
            description: "Отзывы и впечатления путешественников",
          },
          {
            href: "/booking-payment",
            label: "Бронирование / Оплата",
            description: "Раздел для просмотра бронирования и оплаты",
          },
        ],
      },
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
            { href: "/ayalluud/inbound", label: "Туры по Монголии для иностранных гостей" },
            { href: "/ayalluud/outbound", label: "Зарубежные поездки для монгольских туристов" },
            { href: "/ayalluud/domestic", label: "Внутренние туры" },
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
      {
        href: "/ayalluud",
        label: "旅游线路",
        matchPrefixes: ["/ayalluud", "/tours", "/daily-tours", "/destinations"],
        children: [
          {
            href: "/ayalluud/inbound",
            label: "面向外国游客的蒙古旅游",
            description: "为来蒙古旅行的外国游客准备的线路",
          },
          {
            href: "/ayalluud/outbound",
            label: "面向蒙古游客的出境游",
            description: "为蒙古游客前往国外准备的线路",
          },
          {
            href: "/ayalluud/domestic",
            label: "蒙古国内游",
            description: "在蒙古境内旅行的线路",
          },
        ],
      },
      {
        href: "/services",
        label: "服务",
        matchPrefixes: ["/services", "/travel-guide", "/reviews", "/booking-payment"],
        children: [
          {
            href: "/travel-guide",
            label: "旅行建议",
            description: "出行前后可参考的实用建议",
          },
          {
            href: "/reviews",
            label: "评价",
            description: "查看游客反馈与出行感受",
          },
          {
            href: "/booking-payment",
            label: "预订 / 支付",
            description: "集中查看预订与支付信息",
          },
        ],
      },
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
            { href: "/ayalluud/inbound", label: "面向外国游客的蒙古旅游" },
            { href: "/ayalluud/outbound", label: "面向蒙古游客的出境游" },
            { href: "/ayalluud/domestic", label: "蒙古国内游" },
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



