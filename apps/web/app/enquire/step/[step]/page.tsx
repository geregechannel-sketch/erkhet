"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TravelerDetailsTable } from "@/components/bookings/TravelerDetailsTable";
import { TravelerDetailsEditor } from "@/components/forms/TravelerDetailsEditor";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import type { Locale } from "@/lib/i18n";
import { parseSupportType } from "@/lib/support-copy";
import { repairDeep } from "@/lib/text";
import type { SupportRequest, TravelerDetail } from "@/lib/types";

type LocaleText = Record<Locale, string>;

type EnquiryForm = {
  businessLine: "inbound" | "outbound" | "domestic";
  destinationId: string;
  customDestination: string;
  travelStyleId: string;
  startDate: string;
  endDate: string;
  participantCount: string;
  travelerDetails: TravelerDetail[];
  budget: string;
  selectedServiceIds: string[];
  paymentMethodId: string;
  fullName: string;
  email: string;
  phone: string;
  note: string;
};

type CardOption = {
  id: string;
  label: LocaleText;
  description: LocaleText;
};

type DestinationOption = CardOption & {
  businessLine: EnquiryForm["businessLine"];
  season: LocaleText;
  currencyCode: string;
  currencyLabel: LocaleText;
};

type WizardCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  currentStep: string;
  stepLabels: string[];
  back: string;
  guide: string;
  next: string;
  submit: string;
  submitting: string;
  validationCurrentStep: string;
  validationContact: string;
  validationPayment: string;
  submitError: string;
  outboundHint: string;
  domesticHint: string;
  customDestinationLabel: string;
  customDestinationPlaceholderOutbound: string;
  customDestinationPlaceholderDomestic: string;
  dateHint: string;
  participantPlaceholder: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notePlaceholder: string;
  paymentHint: string;
  paymentGuideTitle: string;
  paymentGuideBody: string;
  summary: {
    businessLine: string;
    destination: string;
    style: string;
    dates: string;
    travelers: string;
    budget: string;
    services: string;
    contact: string;
    payment: string;
    travelerDetails: string;
    note: string;
  };
  fallback: {
    none: string;
    notSelected: string;
    countSuffix: string;
    people: string;
    travelerNameless: string;
    noAge: string;
    noGender: string;
  };
  traveler: {
    title: string;
    description: string;
    addLabel: string;
    emptyState: string;
    removeLabel: string;
    labels: {
      fullName: string;
      age: string;
      gender: string;
      hobby: string;
      diet: string;
      allergy: string;
    };
    placeholders: {
      fullName: string;
      age: string;
      gender: string;
      hobby: string;
      diet: string;
      allergy: string;
    };
    emptyTable: string;
  };
  requestSubjectPrefix: string;
};

const STORAGE_KEY = "erkhet.enquiry.form";
const TOTAL_STEPS = 10;

const defaultForm: EnquiryForm = {
  businessLine: "domestic",
  destinationId: "",
  customDestination: "",
  travelStyleId: "",
  startDate: "",
  endDate: "",
  participantCount: "2",
  travelerDetails: [],
  budget: "",
  selectedServiceIds: [],
  paymentMethodId: "",
  fullName: "",
  email: "",
  phone: "",
  note: "",
};

const copyByLocale: Record<Locale, WizardCopy> = {
  mn: {
    eyebrow: "Аялал төлөвлөх",
    title: "Миний аялал",
    intro: "10 алхмаар аяллын хэрэгцээ, чиглэл, төсөв, төлбөрийн хэлбэрээ шат дараатай илгээнэ үү.",
    currentStep: "Одоогийн алхам",
    stepLabels: [
      "Аяллын чиглэл",
      "Чиглэл / Бүс",
      "Аяллын хэв маяг",
      "Огноо",
      "Аялагчдын мэдээлэл",
      "Төсөв",
      "Нэмэлт үйлчилгээ",
      "Холбоо барих",
      "Төлбөр төлөх",
      "Баталгаажуулах",
    ],
    back: "Буцах",
    guide: "Гарын авлага",
    next: "Дараагийн алхам",
    submit: "Хүсэлт илгээх",
    submitting: "Хүсэлт илгээж байна...",
    validationCurrentStep: "Энэ алхмын шаардлагатай мэдээллийг бүрэн оруулна уу.",
    validationContact: "Холбоо барих мэдээллээ бүрэн оруулна уу.",
    validationPayment: "Төлбөрийн хэлбэрээ сонгоно уу.",
    submitError: "Хүсэлт илгээхэд алдаа гарлаа.",
    outboundHint: "Гадаад чиглэл сонгосон тул төсөв тухайн улсын валютаар автоматаар шинэчлэгдэнэ.",
    domesticHint: "Монгол доторх чиглэлүүдийн төсөв төгрөгөөр харагдана.",
    customDestinationLabel: "Жагсаалтад байхгүй чиглэлээ бичиж болно.",
    customDestinationPlaceholderOutbound: "Жишээ нь: Сингапур, Истанбул, Хонконг",
    customDestinationPlaceholderDomestic: "Жишээ нь: Хөвсгөл нуур, Хамрын хийд, Баян-Өлгий",
    dateHint: "Эхлэх өдөр заавал сонгоно. Дуусах өдөр тодорхой биш бол хоосон үлдээж болно.",
    participantPlaceholder: "Аялагчийн тоо",
    contactName: "Нэр",
    contactEmail: "И-мэйл",
    contactPhone: "Утас / WhatsApp",
    notePlaceholder: "Нэмэлт тайлбар, тусгай хүсэлт, харшил, хоолны сонголт",
    paymentHint: "Сонгосон төлбөрийн хэлбэр тань захиалгатай хамт бүртгэгдэнэ.",
    paymentGuideTitle: "Төлбөрийн заавар",
    paymentGuideBody: "Төлбөрийн сонголтоо баталгаажуулсны дараа манай баг тантай холбогдон дараагийн алхмыг тайлбарлана.",
    summary: {
      businessLine: "Аяллын чиглэл",
      destination: "Чиглэл",
      style: "Хэв маяг",
      dates: "Огноо",
      travelers: "Оролцогч",
      budget: "Төсөв",
      services: "Нэмэлт үйлчилгээ",
      contact: "Холбоо барих",
      payment: "Төлбөрийн хэлбэр",
      travelerDetails: "Аялагчдын мэдээлэл",
      note: "Нэмэлт тайлбар",
    },
    fallback: {
      none: "—",
      notSelected: "Сонгоогүй",
      countSuffix: "хүн",
      people: "настай",
      travelerNameless: "Нэргүй",
      noAge: "нас оруулаагүй",
      noGender: "хүйс оруулаагүй",
    },
    traveler: {
      title: "Аялагчийн мэдээлэл",
      description: "Энэ хэсгийг заавал бөглөх албагүй. Аяллыг илүү зөв зохион байгуулахад хэрэгтэй мэдээллээ оруулж болно.",
      addLabel: "Аялагч нэмэх",
      emptyState: "Хамт явах хүмүүсийн нэр, нас, хоолны онцлог, харшлын мэдээллийг энд оруулж болно.",
      removeLabel: "Хасах",
      labels: {
        fullName: "Нэр",
        age: "Нас",
        gender: "Хүйс",
        hobby: "Сонирхол",
        diet: "Хоолны онцлог",
        allergy: "Харшил",
      },
      placeholders: {
        fullName: "Нэр",
        age: "Нас",
        gender: "Эрэгтэй / Эмэгтэй",
        hobby: "Жишээ: Гэрэл зураг",
        diet: "Жишээ: Цагаан хоолтон",
        allergy: "Харшлын мэдээлэл",
      },
      emptyTable: "Нэмэлт аялагчийн мэдээлэл оруулаагүй байна.",
    },
    requestSubjectPrefix: "Захиалгат аяллын хүсэлт",
  },
  en: {
    eyebrow: "Trip planner",
    title: "My Trip",
    intro: "Send your travel needs, route, budget, and payment choice step by step in 10 simple steps.",
    currentStep: "Current step",
    stepLabels: [
      "Trip type",
      "Destination / Region",
      "Travel style",
      "Dates",
      "Traveler details",
      "Budget",
      "Extra services",
      "Contact",
      "Payment",
      "Confirmation",
    ],
    back: "Back",
    guide: "Travel guide",
    next: "Next step",
    submit: "Send request",
    submitting: "Sending request...",
    validationCurrentStep: "Please complete the required information for this step.",
    validationContact: "Please complete your contact information.",
    validationPayment: "Please choose a payment method.",
    submitError: "Something went wrong while sending your request.",
    outboundHint: "For outbound travel, the budget updates automatically in the selected country's currency.",
    domesticHint: "Domestic directions are shown with Mongolian tugrik budgeting.",
    customDestinationLabel: "You can type a destination that is not listed.",
    customDestinationPlaceholderOutbound: "For example: Singapore, Istanbul, Hong Kong",
    customDestinationPlaceholderDomestic: "For example: Lake Khuvsgul, Khamar Monastery, Bayan-Ulgii",
    dateHint: "Start date is required. Leave the end date empty if it is not fixed yet.",
    participantPlaceholder: "Number of travelers",
    contactName: "Full name",
    contactEmail: "Email",
    contactPhone: "Phone / WhatsApp",
    notePlaceholder: "Additional notes, special requests, allergies, meal preference",
    paymentHint: "Your chosen payment method will be linked to this request.",
    paymentGuideTitle: "Payment guide",
    paymentGuideBody: "After you confirm the payment option, our team will contact you with the next instructions.",
    summary: {
      businessLine: "Trip type",
      destination: "Destination",
      style: "Style",
      dates: "Dates",
      travelers: "Travelers",
      budget: "Budget",
      services: "Extra services",
      contact: "Contact",
      payment: "Payment method",
      travelerDetails: "Traveler details",
      note: "Additional notes",
    },
    fallback: {
      none: "—",
      notSelected: "Not selected",
      countSuffix: "travelers",
      people: "years old",
      travelerNameless: "Unnamed traveler",
      noAge: "age not added",
      noGender: "gender not added",
    },
    traveler: {
      title: "Traveler details",
      description: "This part is optional. Add any helpful details to plan the trip more smoothly.",
      addLabel: "Add traveler",
      emptyState: "You can add names, ages, dietary notes, and allergy details for people traveling with you.",
      removeLabel: "Remove",
      labels: { fullName: "Name", age: "Age", gender: "Gender", hobby: "Interest", diet: "Meal preference", allergy: "Allergy" },
      placeholders: {
        fullName: "Name",
        age: "Age",
        gender: "Male / Female",
        hobby: "Example: Photography",
        diet: "Example: Vegetarian",
        allergy: "Allergy details",
      },
      emptyTable: "No extra traveler details added.",
    },
    requestSubjectPrefix: "Custom tour request",
  },
  ru: {
    eyebrow: "План поездки",
    title: "Моё путешествие",
    intro: "Отправьте ваши пожелания по маршруту, бюджету и способу оплаты поэтапно в 10 простых шагах.",
    currentStep: "Текущий шаг",
    stepLabels: [
      "Тип поездки",
      "Направление / регион",
      "Стиль путешествия",
      "Даты",
      "Данные путешественников",
      "Бюджет",
      "Дополнительные услуги",
      "Контакты",
      "Оплата",
      "Подтверждение",
    ],
    back: "Назад",
    guide: "Путеводитель",
    next: "Следующий шаг",
    submit: "Отправить запрос",
    submitting: "Отправляем запрос...",
    validationCurrentStep: "Пожалуйста, заполните обязательную информацию на этом шаге.",
    validationContact: "Пожалуйста, заполните контактную информацию.",
    validationPayment: "Пожалуйста, выберите способ оплаты.",
    submitError: "Во время отправки запроса произошла ошибка.",
    outboundHint: "Для зарубежной поездки бюджет автоматически показывается в валюте выбранной страны.",
    domesticHint: "Для внутренних направлений бюджет показывается в монгольских тугриках.",
    customDestinationLabel: "Вы можете вписать направление, которого нет в списке.",
    customDestinationPlaceholderOutbound: "Например: Сингапур, Стамбул, Гонконг",
    customDestinationPlaceholderDomestic: "Например: Хубсугул, Хамрын хийд, Баян-Өлгий",
    dateHint: "Дата начала обязательна. Если дата окончания ещё не известна, оставьте поле пустым.",
    participantPlaceholder: "Количество путешественников",
    contactName: "Имя",
    contactEmail: "Эл. почта",
    contactPhone: "Телефон / WhatsApp",
    notePlaceholder: "Дополнительные пожелания, аллергия, питание, особые запросы",
    paymentHint: "Выбранный способ оплаты будет сохранён вместе с вашей заявкой.",
    paymentGuideTitle: "Пояснение по оплате",
    paymentGuideBody: "После подтверждения способа оплаты наша команда свяжется с вами и объяснит следующий шаг.",
    summary: {
      businessLine: "Тип поездки",
      destination: "Направление",
      style: "Стиль",
      dates: "Даты",
      travelers: "Путешественники",
      budget: "Бюджет",
      services: "Дополнительные услуги",
      contact: "Контакты",
      payment: "Способ оплаты",
      travelerDetails: "Данные путешественников",
      note: "Дополнительные заметки",
    },
    fallback: {
      none: "—",
      notSelected: "Не выбрано",
      countSuffix: "чел.",
      people: "лет",
      travelerNameless: "Без имени",
      noAge: "возраст не указан",
      noGender: "пол не указан",
    },
    traveler: {
      title: "Данные путешественников",
      description: "Этот раздел не обязателен. Вы можете добавить полезную информацию для более точной организации поездки.",
      addLabel: "Добавить путешественника",
      emptyState: "Здесь можно указать имена, возраст, питание и аллергию участников поездки.",
      removeLabel: "Удалить",
      labels: { fullName: "Имя", age: "Возраст", gender: "Пол", hobby: "Интерес", diet: "Питание", allergy: "Аллергия" },
      placeholders: {
        fullName: "Имя",
        age: "Возраст",
        gender: "Мужчина / Женщина",
        hobby: "Например: Фото",
        diet: "Например: Вегетарианец",
        allergy: "Информация об аллергии",
      },
      emptyTable: "Дополнительные данные путешественников не добавлены.",
    },
    requestSubjectPrefix: "Запрос на индивидуальный тур",
  },
  zh: {
    eyebrow: "行程规划",
    title: "我的旅程",
    intro: "请按 10 个步骤填写您的旅行需求、路线、预算和付款方式。",
    currentStep: "当前步骤",
    stepLabels: ["旅行类型", "目的地 / 区域", "旅行风格", "日期", "游客信息", "预算", "附加服务", "联系方式", "付款方式", "确认"],
    back: "返回",
    guide: "旅行指南",
    next: "下一步",
    submit: "提交请求",
    submitting: "正在提交...",
    validationCurrentStep: "请先完整填写当前步骤需要的信息。",
    validationContact: "请完整填写联系方式。",
    validationPayment: "请选择付款方式。",
    submitError: "提交请求时发生错误。",
    outboundHint: "如果选择出境旅行，预算会自动按所选国家的货币显示。",
    domesticHint: "蒙古国内方向的预算将按蒙图显示。",
    customDestinationLabel: "如果列表中没有合适的方向，也可以自己填写。",
    customDestinationPlaceholderOutbound: "例如：新加坡、伊斯坦布尔、香港",
    customDestinationPlaceholderDomestic: "例如：库苏古尔湖、哈马尔寺、巴彦乌列盖",
    dateHint: "开始日期必填。如果结束日期暂时未定，可以留空。",
    participantPlaceholder: "游客人数",
    contactName: "姓名",
    contactEmail: "邮箱",
    contactPhone: "电话 / WhatsApp",
    notePlaceholder: "其他说明、特殊需求、过敏或饮食偏好",
    paymentHint: "您选择的付款方式会与此次请求一起保存。",
    paymentGuideTitle: "付款说明",
    paymentGuideBody: "确认付款方式后，我们的团队会尽快联系您并说明下一步安排。",
    summary: {
      businessLine: "旅行类型",
      destination: "目的地",
      style: "旅行风格",
      dates: "日期",
      travelers: "游客人数",
      budget: "预算",
      services: "附加服务",
      contact: "联系方式",
      payment: "付款方式",
      travelerDetails: "游客信息",
      note: "补充说明",
    },
    fallback: {
      none: "—",
      notSelected: "未选择",
      countSuffix: "人",
      people: "岁",
      travelerNameless: "未填写姓名",
      noAge: "未填写年龄",
      noGender: "未填写性别",
    },
    traveler: {
      title: "游客信息",
      description: "此部分为选填内容，您可以补充有助于安排行程的信息。",
      addLabel: "添加游客",
      emptyState: "您可以在这里填写同行人员的姓名、年龄、饮食偏好和过敏信息。",
      removeLabel: "删除",
      labels: { fullName: "姓名", age: "年龄", gender: "性别", hobby: "兴趣", diet: "饮食偏好", allergy: "过敏" },
      placeholders: {
        fullName: "姓名",
        age: "年龄",
        gender: "男 / 女",
        hobby: "例如：摄影",
        diet: "例如：素食",
        allergy: "过敏信息",
      },
      emptyTable: "尚未填写游客附加信息。",
    },
    requestSubjectPrefix: "定制旅行咨询",
  },
};

const businessLineOptions: CardOption[] = [
  {
    id: "inbound",
    label: {
      mn: "Гадаад жуулчдад Монголын аялал",
      en: "Mongolia tours for foreign visitors",
      ru: "Туры по Монголии для иностранных гостей",
      zh: "面向外国游客的蒙古旅行",
    },
    description: {
      mn: "Монголд ирж аялах гадаад жуулчдад зориулсан аяллууд",
      en: "Trips designed for international travelers visiting Mongolia",
      ru: "Туры для иностранных гостей, приезжающих в Монголию",
      zh: "为来蒙古旅行的外国游客准备的线路",
    },
  },
  {
    id: "outbound",
    label: {
      mn: "Монголчуудад гадаад аялал",
      en: "International trips for Mongolian travelers",
      ru: "Зарубежные поездки для монгольских путешественников",
      zh: "面向蒙古游客的出境旅行",
    },
    description: {
      mn: "Монгол жуулчдыг гадаад улс руу аялуулах аяллууд",
      en: "Trips for Mongolian travelers going abroad",
      ru: "Поездки для монгольских путешественников за границу",
      zh: "为蒙古游客出境旅行准备的线路",
    },
  },
  {
    id: "domestic",
    label: {
      mn: "Дотоод аялал",
      en: "Domestic tours",
      ru: "Внутренние туры",
      zh: "蒙古国内旅行",
    },
    description: {
      mn: "Монгол жуулчдыг Монгол орноор аялуулах дотоодын аяллууд",
      en: "Domestic trips for travelers exploring Mongolia",
      ru: "Внутренние поездки по Монголии",
      zh: "为在蒙古境内旅行的游客准备的线路",
    },
  },
];

const destinationOptions: DestinationOption[] = [
  {
    id: "ub-area",
    businessLine: "inbound",
    currencyCode: "MNT",
    currencyLabel: { mn: "Монгол төгрөг", en: "Mongolian tugrik", ru: "Монгольский тугрик", zh: "蒙古图格里克" },
    season: { mn: "Жилийн дөрвөн улирал", en: "Year round", ru: "Круглый год", zh: "四季皆宜" },
    label: { mn: "Улаанбаатар орчим", en: "Around Ulaanbaatar", ru: "Окрестности Улан-Батора", zh: "乌兰巴托周边" },
    description: {
      mn: "Хотын аялал, музей, Гандан, Цонжин Болдог зэрэг ойрын маршрут.",
      en: "City tours, museums, Gandan Monastery, and nearby cultural routes.",
      ru: "Городские экскурсии, музеи, монастыри и близкие культурные маршруты.",
      zh: "城市观光、博物馆、甘丹寺及周边文化线路。",
    },
  },
  {
    id: "gobi",
    businessLine: "inbound",
    currencyCode: "MNT",
    currencyLabel: { mn: "Монгол төгрөг", en: "Mongolian tugrik", ru: "Монгольский тугрик", zh: "蒙古图格里克" },
    season: { mn: "5-10 сар", en: "May to October", ru: "С мая по октябрь", zh: "5月至10月" },
    label: { mn: "Говийн аялал", en: "Gobi tour", ru: "Путешествие по Гоби", zh: "戈壁之旅" },
    description: {
      mn: "Цагаан суварга, Ёлын ам, Баянзаг зэрэг говийн маршрут.",
      en: "Classic Gobi highlights including Tsagaan Suvarga, Yol Valley, and Bayanzag.",
      ru: "Классический маршрут по Гоби: Цагаан Суварга, Ёлын Ам и Баянзаг.",
      zh: "经典戈壁线路，包括白色佛塔、秃鹫谷和巴彦扎格。",
    },
  },
  {
    id: "khangai",
    businessLine: "inbound",
    currencyCode: "MNT",
    currencyLabel: { mn: "Монгол төгрөг", en: "Mongolian tugrik", ru: "Монгольский тугрик", zh: "蒙古图格里克" },
    season: { mn: "6-9 сар", en: "June to September", ru: "С июня по сентябрь", zh: "6月至9月" },
    label: { mn: "Хангайн аялал", en: "Khangai tour", ru: "Путешествие по Хангаю", zh: "杭爱山之旅" },
    description: {
      mn: "Хархорин, Тэрхийн цагаан нуур, Хөвсгөл чиглэлийн урт маршрут.",
      en: "Longer scenic routes through Kharkhorin, Terkhiin Tsagaan Lake, and northern Mongolia.",
      ru: "Длинный маршрут через Хархорин, озеро Тэрхийн Цагаан и север Монголии.",
      zh: "贯穿哈拉和林、特尔欣查干湖和北部地区的长线行程。",
    },
  },
  {
    id: "beijing",
    businessLine: "outbound",
    currencyCode: "CNY",
    currencyLabel: { mn: "Хятад юань", en: "Chinese yuan", ru: "Китайский юань", zh: "人民币" },
    season: { mn: "Жилийн дөрвөн улирал", en: "Year round", ru: "Круглый год", zh: "四季皆宜" },
    label: { mn: "Бээжин", en: "Beijing", ru: "Пекин", zh: "北京" },
    description: {
      mn: "Соёл, үзвэр, худалдаа хосолсон city break аялал.",
      en: "A city break with culture, attractions, and shopping.",
      ru: "Городской тур с культурой, достопримечательностями и шопингом.",
      zh: "结合文化、景点和购物的城市短途行程。",
    },
  },
  {
    id: "dubai",
    businessLine: "outbound",
    currencyCode: "AED",
    currencyLabel: { mn: "АНЭУ дирхам", en: "UAE dirham", ru: "Дирхам ОАЭ", zh: "阿联酋迪拉姆" },
    season: { mn: "10-4 сар", en: "October to April", ru: "С октября по апрель", zh: "10月至4月" },
    label: { mn: "Дубай", en: "Dubai", ru: "Дубай", zh: "迪拜" },
    description: {
      mn: "Амралт, shopping, desert safari хосолсон family travel.",
      en: "A family trip with leisure, shopping, and desert safari.",
      ru: "Семейная поездка с отдыхом, шопингом и desert safari.",
      zh: "适合家庭的休闲、购物和沙漠体验之旅。",
    },
  },
  {
    id: "moscow",
    businessLine: "outbound",
    currencyCode: "RUB",
    currencyLabel: { mn: "Орос рубль", en: "Russian ruble", ru: "Российский рубль", zh: "俄罗斯卢布" },
    season: { mn: "Жилийн дөрвөн улирал", en: "Year round", ru: "Круглый год", zh: "四季皆宜" },
    label: { mn: "Москва", en: "Moscow", ru: "Москва", zh: "莫斯科" },
    description: {
      mn: "Хотын үзвэр, соёл, бизнес аялал хосолсон маршрут.",
      en: "A route that combines sightseeing, culture, and business travel.",
      ru: "Маршрут с экскурсиями, культурой и деловыми поездками.",
      zh: "结合观光、文化和商务需求的城市线路。",
    },
  },
  {
    id: "khuvsgul",
    businessLine: "domestic",
    currencyCode: "MNT",
    currencyLabel: { mn: "Монгол төгрөг", en: "Mongolian tugrik", ru: "Монгольский тугрик", zh: "蒙古图格里克" },
    season: { mn: "6-9 сар", en: "June to September", ru: "С июня по сентябрь", zh: "6月至9月" },
    label: { mn: "Хөвсгөл", en: "Khuvsgul", ru: "Хубсугул", zh: "库苏古尔" },
    description: {
      mn: "Нуурын эрэг, байгаль, гэр бааз хосолсон амралтын аялал.",
      en: "A relaxing lakeside route with nature and ger camp stays.",
      ru: "Спокойный маршрут к озеру с природой и юрточным лагерем.",
      zh: "以湖畔风景、自然和蒙古包营地为主的休闲线路。",
    },
  },
  {
    id: "kharkhorin",
    businessLine: "domestic",
    currencyCode: "MNT",
    currencyLabel: { mn: "Монгол төгрөг", en: "Mongolian tugrik", ru: "Монгольский тугрик", zh: "蒙古图格里克" },
    season: { mn: "5-10 сар", en: "May to October", ru: "С мая по октябрь", zh: "5月至10月" },
    label: { mn: "Хархорин", en: "Kharkhorin", ru: "Хархорин", zh: "哈拉和林" },
    description: {
      mn: "Түүх, соёл, музей, Эрдэнэ Зуу хийдийг багтаасан аялал.",
      en: "A route focused on history, museums, and Erdene Zuu Monastery.",
      ru: "Маршрут по истории, музеям и монастырю Эрдэнэ-Зуу.",
      zh: "以历史、博物馆和额尔德尼召寺为主的线路。",
    },
  },
];

const travelStyles: CardOption[] = [
  { id: "culture", label: { mn: "Соёл, түүхийн аялал", en: "Culture and history", ru: "Культура и история", zh: "文化与历史" }, description: { mn: "Музей, түүхэн газар, үзвэр хосолсон тайван хөтөлбөр.", en: "A calmer route with museums, landmarks, and cultural stops.", ru: "Спокойный маршрут с музеями, историей и культурными точками.", zh: "以博物馆、历史景点和文化体验为主的行程。" } },
  { id: "nature", label: { mn: "Байгалийн аялал", en: "Nature trip", ru: "Природа", zh: "自然风光" }, description: { mn: "Байгаль, гэр бааз, зураг авах, амрахад тохирсон аялал.", en: "Nature-focused travel with scenery, ger camps, and relaxation.", ru: "Путешествие по природе с красивыми видами и отдыхом.", zh: "适合看风景、住营地和放松休息的自然线路。" } },
  { id: "family", label: { mn: "Гэр бүлийн аялал", en: "Family trip", ru: "Семейная поездка", zh: "家庭旅行" }, description: { mn: "Хүүхэдтэй, ахмад настай аялагчидтай явхад тохиромжтой хөтөлбөр.", en: "Comfortable pacing for families, seniors, and children.", ru: "Удобный темп для семей, пожилых и детей.", zh: "适合家庭、长者和儿童的舒适节奏行程。" } },
  { id: "shopping", label: { mn: "Shopping аялал", en: "Shopping trip", ru: "Шопинг", zh: "购物之旅" }, description: { mn: "Худалдаа, чөлөөт цаг, хотын маршрутад төвлөрсөн аялал.", en: "A city-based route focused on shopping and free time.", ru: "Городской маршрут с шопингом и свободным временем.", zh: "以购物和城市自由活动为主的线路。" } },
  { id: "custom", label: { mn: "Захиалгат аялал", en: "Custom trip", ru: "Индивидуальный тур", zh: "定制旅行" }, description: { mn: "Таны хүсэлд тохируулан маршрутыг шинээр гаргах аялал.", en: "A route built around your own interests and timing.", ru: "Маршрут, составленный под ваши интересы и даты.", zh: "根据您的兴趣和时间单独规划的行程。" } },
];

const serviceOptions: CardOption[] = [
  { id: "esim", label: { mn: "e-SIM захиалга", en: "eSIM", ru: "eSIM", zh: "eSIM" }, description: { mn: "Очих улс, data багц, идэвхжүүлэх өдөртэй хамт хүсэлтээ илгээнэ.", en: "Send your destination, data plan, and activation date.", ru: "Укажите страну, пакет интернета и дату активации.", zh: "填写目的地、流量套餐和启用日期。" } },
  { id: "insurance", label: { mn: "Даатгал захиалга", en: "Insurance", ru: "Страховка", zh: "保险" }, description: { mn: "Аяллын хугацаа, аялагчдын тоо, хамгаалалтын хэрэгцээгээ оруулна.", en: "Share your travel dates, traveler count, and coverage needs.", ru: "Укажите даты поездки, число туристов и нужный уровень покрытия.", zh: "填写出行日期、人数和需要的保障范围。" } },
];

const paymentOptions: CardOption[] = [
  { id: "qpay", label: { mn: "QPay", en: "QPay", ru: "QPay", zh: "QPay" }, description: { mn: "QR эсвэл төлбөрийн холбоосоор баталгаажуулна.", en: "Confirm with a QR code or payment link.", ru: "Подтверждение через QR или ссылку на оплату.", zh: "通过二维码或支付链接完成确认。" } },
  { id: "card", label: { mn: "Visa / Mastercard", en: "Visa / Mastercard", ru: "Visa / Mastercard", zh: "Visa / Mastercard" }, description: { mn: "Олон улсын картаар урьдчилгаа эсвэл үлдэгдлээ төлнө.", en: "Pay a deposit or balance with an international card.", ru: "Оплата депозита или полной суммы международной картой.", zh: "使用国际银行卡支付定金或余款。" } },
];

const budgetTemplates: Record<string, Record<Locale, string[]>> = {
  MNT: {
    mn: ["1-3 сая ₮", "3-6 сая ₮", "6-10 сая ₮", "10+ сая ₮", "Уян хатан"],
    en: ["1-3 million ₮", "3-6 million ₮", "6-10 million ₮", "10+ million ₮", "Flexible"],
    ru: ["1-3 млн ₮", "3-6 млн ₮", "6-10 млн ₮", "10+ млн ₮", "Гибко"],
    zh: ["100-300万 ₮", "300-600万 ₮", "600-1000万 ₮", "1000万 ₮ 以上", "灵活"],
  },
  CNY: {
    mn: ["5,000-10,000 CNY", "10,000-18,000 CNY", "18,000-30,000 CNY", "30,000+ CNY", "Уян хатан"],
    en: ["5,000-10,000 CNY", "10,000-18,000 CNY", "18,000-30,000 CNY", "30,000+ CNY", "Flexible"],
    ru: ["5 000-10 000 CNY", "10 000-18 000 CNY", "18 000-30 000 CNY", "30 000+ CNY", "Гибко"],
    zh: ["5,000-10,000 CNY", "10,000-18,000 CNY", "18,000-30,000 CNY", "30,000+ CNY", "灵活"],
  },
  AED: {
    mn: ["2,500-5,000 AED", "5,000-9,000 AED", "9,000-15,000 AED", "15,000+ AED", "Уян хатан"],
    en: ["2,500-5,000 AED", "5,000-9,000 AED", "9,000-15,000 AED", "15,000+ AED", "Flexible"],
    ru: ["2 500-5 000 AED", "5 000-9 000 AED", "9 000-15 000 AED", "15 000+ AED", "Гибко"],
    zh: ["2,500-5,000 AED", "5,000-9,000 AED", "9,000-15,000 AED", "15,000+ AED", "灵活"],
  },
  RUB: {
    mn: ["60,000-120,000 RUB", "120,000-220,000 RUB", "220,000-360,000 RUB", "360,000+ RUB", "Уян хатан"],
    en: ["60,000-120,000 RUB", "120,000-220,000 RUB", "220,000-360,000 RUB", "360,000+ RUB", "Flexible"],
    ru: ["60 000-120 000 RUB", "120 000-220 000 RUB", "220 000-360 000 RUB", "360 000+ RUB", "Гибко"],
    zh: ["60,000-120,000 RUB", "120,000-220,000 RUB", "220,000-360,000 RUB", "360,000+ RUB", "灵活"],
  },
};

const repairedCopyByLocale = repairDeep(copyByLocale) as Record<Locale, WizardCopy>;
const repairedBusinessLineOptions = repairDeep(businessLineOptions) as CardOption[];
const repairedDestinationOptions = repairDeep(destinationOptions) as DestinationOption[];
const repairedTravelStyles = repairDeep(travelStyles) as CardOption[];
const repairedServiceOptions = repairDeep(serviceOptions) as CardOption[];
const repairedPaymentOptions = repairDeep(paymentOptions) as CardOption[];
const repairedBudgetTemplates = repairDeep(budgetTemplates) as Record<string, Record<Locale, string[]>>;

function parseStep(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const next = Number(value || 1);
  if (Number.isNaN(next) || next < 1) return 1;
  return Math.min(next, TOTAL_STEPS);
}

function textForLocale(text: LocaleText, locale: Locale) {
  return text[locale] || text.mn;
}

function getDestinationOptions(businessLine: EnquiryForm["businessLine"]) {
  return repairedDestinationOptions.filter((item) => item.businessLine === businessLine);
}

function getBudgetOptions(locale: Locale, currencyCode: string) {
  return repairedBudgetTemplates[currencyCode]?.[locale] || repairedBudgetTemplates.MNT[locale];
}

function buildTravelerSummary(travelers: TravelerDetail[], copy: WizardCopy) {
  if (!travelers.length) {
    return copy.fallback.none;
  }

  return travelers
    .map((traveler, index) => {
      const parts = [
        traveler.fullName || copy.fallback.travelerNameless,
        traveler.age ? `${traveler.age} ${copy.fallback.people}` : copy.fallback.noAge,
        traveler.gender || copy.fallback.noGender,
        traveler.hobby ? `${copy.traveler.labels.hobby}: ${traveler.hobby}` : "",
        traveler.diet ? `${copy.traveler.labels.diet}: ${traveler.diet}` : "",
        traveler.allergy ? `${copy.traveler.labels.allergy}: ${traveler.allergy}` : "",
      ].filter(Boolean);
      return `${index + 1}. ${parts.join(", ")}`;
    })
    .join("\n");
}

export default function EnquireStepPage() {
  const params = useParams<{ step: string }>();
  const router = useRouter();
  const { locale } = useLocale();
  const { user, token } = useAuth();
  const step = parseStep(params?.step);
  const copy = repairedCopyByLocale[locale];

  const [form, setForm] = useState<EnquiryForm>(defaultForm);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileWizard, setIsMobileWizard] = useState(false);
  const stepBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<EnquiryForm>;
        setForm((current) => ({ ...current, ...parsed }));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user?.fullName || "",
      email: current.email || user?.email || "",
      phone: current.phone || user?.phone || "",
    }));
  }, [user?.email, user?.fullName, user?.phone]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia("(max-width: 720px)");
    const syncLayout = () => setIsMobileWizard(media.matches);

    syncLayout();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncLayout);
      return () => media.removeEventListener("change", syncLayout);
    }

    media.addListener(syncLayout);
    return () => media.removeListener(syncLayout);
  }, []);

  useEffect(() => {
    if (!isMobileWizard) {
      return;
    }

    const currentStepButton = stepBarRef.current?.querySelector<HTMLButtonElement>(".wizardStepPill.current");
    currentStepButton?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [isMobileWizard, step]);

  const currentStepLabel = copy.stepLabels[step - 1];
  const activeLine =
    repairedBusinessLineOptions.find((item) => item.id === form.businessLine) || repairedBusinessLineOptions[0];
  const destinations = useMemo(() => getDestinationOptions(form.businessLine), [form.businessLine]);
  const activeDestination = destinations.find((item) => item.id === form.destinationId);
  const travelStyle = repairedTravelStyles.find((item) => item.id === form.travelStyleId);
  const selectedServices = repairedServiceOptions.filter((item) => form.selectedServiceIds.includes(item.id));
  const paymentMethod = repairedPaymentOptions.find((item) => item.id === form.paymentMethodId);
  const budgetOptions = getBudgetOptions(locale, activeDestination?.currencyCode || "MNT");
  const destinationDisplay = activeDestination
    ? textForLocale(activeDestination.label, locale)
    : form.customDestination.trim();

  function setField<K extends keyof EnquiryForm>(field: K, value: EnquiryForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function selectBusinessLine(value: EnquiryForm["businessLine"]) {
    setForm((current) => ({
      ...current,
      businessLine: value,
      destinationId: "",
      customDestination: "",
      budget: "",
    }));
  }

  function selectDestination(value: string) {
    setForm((current) => ({
      ...current,
      destinationId: value,
      customDestination: "",
      budget: "",
    }));
  }

  function setCustomDestination(value: string) {
    setForm((current) => ({
      ...current,
      destinationId: "",
      customDestination: value,
      budget: "",
    }));
  }

  function toggleService(value: string) {
    setForm((current) => ({
      ...current,
      selectedServiceIds: current.selectedServiceIds.includes(value)
        ? current.selectedServiceIds.filter((item) => item !== value)
        : [...current.selectedServiceIds, value],
    }));
  }

  function goToStep(nextStep: number) {
    router.push(`/enquire/step/${Math.max(1, Math.min(TOTAL_STEPS, nextStep))}`);
  }

  function validateCurrentStep() {
    switch (step) {
      case 2:
        return Boolean(form.destinationId || form.customDestination.trim());
      case 3:
        return Boolean(form.travelStyleId);
      case 4:
        return Boolean(form.startDate);
      case 5:
        return Boolean(form.participantCount);
      case 6:
        return Boolean(form.budget);
      case 8:
        return Boolean(form.fullName.trim() && form.email.trim());
      case 9:
        return Boolean(form.paymentMethodId);
      default:
        return true;
    }
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      setMessage(copy.validationCurrentStep);
      return;
    }
    setMessage(null);
    goToStep(step + 1);
  }

  function buildSummary() {
    const dateRange = form.endDate ? `${form.startDate} - ${form.endDate}` : form.startDate || copy.fallback.none;
    return [
      `${copy.summary.businessLine}: ${textForLocale(activeLine.label, locale)}`,
      `${copy.summary.destination}: ${destinationDisplay || copy.fallback.none}`,
      `${copy.summary.style}: ${travelStyle ? textForLocale(travelStyle.label, locale) : copy.fallback.none}`,
      `${copy.summary.dates}: ${dateRange}`,
      `${copy.summary.travelers}: ${form.participantCount || copy.fallback.none} ${copy.fallback.countSuffix}`,
      `${copy.summary.budget}: ${form.budget || copy.fallback.none}`,
      `${copy.summary.services}: ${selectedServices.map((item) => textForLocale(item.label, locale)).join(", ") || copy.fallback.notSelected}`,
      `${copy.summary.payment}: ${paymentMethod ? textForLocale(paymentMethod.label, locale) : copy.fallback.notSelected}`,
      `${copy.summary.travelerDetails}:\n${buildTravelerSummary(form.travelerDetails, copy)}`,
      `${copy.summary.contact}: ${form.fullName} / ${form.email} / ${form.phone || copy.fallback.none}`,
      `${copy.summary.note}: ${form.note || copy.fallback.none}`,
    ].join("\n");
  }

  async function handleSubmit() {
    if (!form.fullName.trim() || !form.email.trim()) {
      setMessage(copy.validationContact);
      goToStep(8);
      return;
    }

    if (!form.paymentMethodId) {
      setMessage(copy.validationPayment);
      goToStep(9);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const created = await browserApiFetch<SupportRequest>("/support-requests", {
        method: "POST",
        headers: token ? authHeaders(token) : undefined,
        body: JSON.stringify({
          type: "support",
          subject: `${copy.requestSubjectPrefix} - ${destinationDisplay || textForLocale(activeLine.label, locale)}`,
          message: buildSummary(),
          customerName: form.fullName,
          customerEmail: form.email,
          customerPhone: form.phone,
          locale,
        }),
      });
      window.localStorage.removeItem(STORAGE_KEY);
      const params = new URLSearchParams();
      const supportType = parseSupportType(created.type);
      if (supportType) {
        params.set("type", supportType);
      }
      if (created.supportReference) {
        params.set("reference", created.supportReference);
      }
      router.push(params.size > 0 ? `/message-success?${params.toString()}` : "/message-success");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : copy.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="pageHero">
        <div className="container stackMd">
          <p className="eyebrow">
            {copy.eyebrow} {step} / {TOTAL_STEPS}
          </p>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="wizardStepsBar" ref={stepBarRef}>
            {copy.stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                className={`wizardStepPill${index + 1 === step ? " current" : ""}`}
                onClick={() => goToStep(index + 1)}
                aria-current={index + 1 === step ? "step" : undefined}
                aria-label={`${label} ${index + 1}`}
              >
                <span className="wizardStepIndex">{index + 1}</span>
                <span className="wizardStepLabelText">{label}</span>
              </button>
            ))}
          </div>

          <article className="panel stackMd wizardCard">
            <div className="sectionHeading compact">
              <div>
                <p className="eyebrow">{copy.currentStep}</p>
                <h2>{currentStepLabel}</h2>
              </div>
            </div>

            {step === 1 && (
              <div className="grid c3">
                {repairedBusinessLineOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`card optionCard${form.businessLine === item.id ? " selected" : ""}`}
                    onClick={() => selectBusinessLine(item.id as EnquiryForm["businessLine"])}
                  >
                    <div className="content stackSm">
                      <strong>{textForLocale(item.label, locale)}</strong>
                      <p className="meta">{textForLocale(item.description, locale)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="stackMd">
                <p className="meta">{form.businessLine === "outbound" ? copy.outboundHint : copy.domesticHint}</p>
                <div className="grid c3">
                  {destinations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`card optionCard${form.destinationId === item.id ? " selected" : ""}`}
                      onClick={() => selectDestination(item.id)}
                    >
                      <div className="content stackSm">
                        <strong>{textForLocale(item.label, locale)}</strong>
                        <p className="meta">{textForLocale(item.description, locale)}</p>
                        <span className="eyebrow">
                          {textForLocale(item.season, locale)} · {item.currencyCode}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="stackSm">
                  <label className="meta" htmlFor="custom-destination">
                    {copy.customDestinationLabel}
                  </label>
                  <input
                    id="custom-destination"
                    value={form.customDestination}
                    onChange={(event) => setCustomDestination(event.target.value)}
                    placeholder={
                      form.businessLine === "outbound"
                        ? copy.customDestinationPlaceholderOutbound
                        : copy.customDestinationPlaceholderDomestic
                    }
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid c3">
                {repairedTravelStyles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`card optionCard${form.travelStyleId === item.id ? " selected" : ""}`}
                    onClick={() => setField("travelStyleId", item.id)}
                  >
                    <div className="content stackSm">
                      <strong>{textForLocale(item.label, locale)}</strong>
                      <p className="meta">{textForLocale(item.description, locale)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="stackMd">
                <div className="formGrid">
                  <input type="date" value={form.startDate} onChange={(event) => setField("startDate", event.target.value)} />
                  <input type="date" value={form.endDate} onChange={(event) => setField("endDate", event.target.value)} />
                </div>
                <p className="meta">{copy.dateHint}</p>
              </div>
            )}

            {step === 5 && (
              <div className="stackMd">
                <input
                  type="number"
                  min="1"
                  value={form.participantCount}
                  onChange={(event) => setField("participantCount", event.target.value)}
                  placeholder={copy.participantPlaceholder}
                />
                <TravelerDetailsEditor
                  value={form.travelerDetails}
                  onChange={(items) => setField("travelerDetails", items)}
                  title={copy.traveler.title}
                  description={copy.traveler.description}
                  addLabel={copy.traveler.addLabel}
                  emptyState={copy.traveler.emptyState}
                  removeLabel={copy.traveler.removeLabel}
                  labels={copy.traveler.labels}
                  placeholders={copy.traveler.placeholders}
                />
              </div>
            )}

            {step === 6 && (
              <div className="stackMd">
                <p className="meta">
                  {destinationDisplay
                    ? `${destinationDisplay} · ${(activeDestination?.currencyLabel && textForLocale(activeDestination.currencyLabel, locale)) || "MNT"} (${activeDestination?.currencyCode || "MNT"})`
                    : copy.domesticHint}
                </p>
                <div className="grid c3">
                  {budgetOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`card optionCard${form.budget === item ? " selected" : ""}`}
                      onClick={() => setField("budget", item)}
                    >
                      <div className="content">{item}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="grid c2">
                {repairedServiceOptions.map((item) => (
                  <label
                    key={item.id}
                    className={`card optionCard${form.selectedServiceIds.includes(item.id) ? " selected" : ""}`}
                  >
                    <div className="content stackSm">
                      <strong>{textForLocale(item.label, locale)}</strong>
                      <p className="meta">{textForLocale(item.description, locale)}</p>
                      <input
                        type="checkbox"
                        checked={form.selectedServiceIds.includes(item.id)}
                        onChange={() => toggleService(item.id)}
                      />
                    </div>
                  </label>
                ))}
              </div>
            )}

            {step === 8 && (
              <div className="formGrid">
                <input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder={copy.contactName} />
                <input value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder={copy.contactEmail} />
                <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder={copy.contactPhone} />
                <textarea
                  className="full"
                  rows={5}
                  value={form.note}
                  onChange={(event) => setField("note", event.target.value)}
                  placeholder={copy.notePlaceholder}
                />
              </div>
            )}

            {step === 9 && (
              <div className="stackMd">
                <p className="meta">{copy.paymentHint}</p>
                <div className="grid c2">
                  {repairedPaymentOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`card optionCard${form.paymentMethodId === item.id ? " selected" : ""}`}
                      onClick={() => setField("paymentMethodId", item.id)}
                    >
                      <div className="content stackSm">
                        <strong>{textForLocale(item.label, locale)}</strong>
                        <p className="meta">{textForLocale(item.description, locale)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <article className="panel stackSm">
                  <strong>{copy.paymentGuideTitle}</strong>
                  <p>{copy.paymentGuideBody}</p>
                </article>
              </div>
            )}

            {step === 10 && (
              <div className="stackMd">
                <div className="grid c2">
                  <article className="card slimCard"><div className="content stackSm"><strong>{copy.summary.businessLine}</strong><p>{textForLocale(activeLine.label, locale)}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>{copy.summary.destination}</strong><p>{destinationDisplay || copy.fallback.none}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>{copy.summary.style}</strong><p>{travelStyle ? textForLocale(travelStyle.label, locale) : copy.fallback.notSelected}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>{copy.summary.dates}</strong><p>{form.startDate}{form.endDate ? ` - ${form.endDate}` : ""}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>{copy.summary.travelers}</strong><p>{form.participantCount} {copy.fallback.countSuffix}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>{copy.summary.budget}</strong><p>{form.budget || copy.fallback.none}</p></div></article>
                </div>
                <article className="panel stackSm"><strong>{copy.summary.services}</strong><p>{selectedServices.map((item) => textForLocale(item.label, locale)).join(", ") || copy.fallback.notSelected}</p></article>
                <article className="panel stackSm"><strong>{copy.summary.contact}</strong><p>{form.fullName} / {form.email} / {form.phone || copy.fallback.none}</p></article>
                <article className="panel stackSm"><strong>{copy.summary.payment}</strong><p>{paymentMethod ? textForLocale(paymentMethod.label, locale) : copy.fallback.notSelected}</p></article>
                <article className="panel stackSm">
                  <strong>{copy.summary.travelerDetails}</strong>
                  <TravelerDetailsTable travelers={form.travelerDetails} emptyMessage={copy.traveler.emptyTable} labels={copy.traveler.labels} />
                </article>
                <article className="panel stackSm"><strong>{copy.summary.note}</strong><p>{form.note || copy.fallback.none}</p></article>
              </div>
            )}

            {message ? <p className="inlineMessage error">{message}</p> : null}

            <div className="rowActions spread wizardNavActions">
              <div className="rowActions wrapActions">
                {step > 1 ? (
                  <button className="btn secondary" type="button" onClick={() => goToStep(step - 1)}>
                    {copy.back}
                  </button>
                ) : null}
                <Link className="btn secondary" href="/travel-guide">
                  {copy.guide}
                </Link>
              </div>
              <div className="rowActions wrapActions">
                {step < TOTAL_STEPS ? (
                  <button className="btn primary" type="button" onClick={handleNext}>
                    {copy.next}
                  </button>
                ) : (
                  <button className="btn primary" type="button" onClick={() => void handleSubmit()} disabled={submitting}>
                    {submitting ? copy.submitting : copy.submit}
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
