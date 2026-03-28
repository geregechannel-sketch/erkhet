import type { Locale } from "@/lib/i18n";

const bookingStatusMap: Record<string, string> = {
  pending: "Хүлээгдэж буй",
  confirmed: "Баталгаажсан",
  cancelled: "Цуцлагдсан",
  completed: "Дууссан",
};

const paymentStatusMap: Record<string, string> = {
  unpaid: "Төлөөгүй",
  pending: "Хүлээгдэж буй",
  partially_paid: "Хэсэгчлэн төлсөн",
  paid: "Төлөгдсөн",
  failed: "Амжилтгүй",
  cancelled: "Цуцлагдсан",
  refunded: "Буцаасан",
  partially_refunded: "Хэсэгчлэн буцаасан",
};

const businessLineMap: Record<string, string> = {
  inbound: "Монголд аялуулах",
  outbound: "Гадаад аялал",
  domestic: "Дотоод аялал",
};

const operationTypeMap: Record<string, string> = {
  scheduled: "Хуваарьт",
  custom: "Захиалгат",
};

const localeTags: Record<Locale, string> = {
  mn: "mn-MN",
  en: "en-US",
  ru: "ru-RU",
  zh: "zh-CN",
};

const unknownDurationByLocale: Record<Locale, string> = {
  mn: "Тодорхойгүй",
  en: "Not specified",
  ru: "Не указано",
  zh: "未说明",
};

function resolveLocaleTag(locale: Locale) {
  return localeTags[locale] || localeTags.mn;
}

export function formatCurrency(amount?: number, currency = "MNT", locale: Locale = "mn") {
  if (typeof amount !== "number") {
    return "";
  }

  return new Intl.NumberFormat(resolveLocaleTag(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value?: string | Date | null, locale: Locale = "mn") {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.DateTimeFormat(resolveLocaleTag(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function describeDuration(days: number, nights: number, locale: Locale = "mn") {
  if (days <= 0) {
    return unknownDurationByLocale[locale];
  }

  if (nights > 0) {
    switch (locale) {
      case "en":
        return `${days} days / ${nights} nights`;
      case "ru":
        return `${days} дн. / ${nights} ноч.`;
      case "zh":
        return `${days} 天 / ${nights} 晚`;
      default:
        return `${days} өдөр / ${nights} шөнө`;
    }
  }

  switch (locale) {
    case "en":
      return `${days} day${days === 1 ? "" : "s"}`;
    case "ru":
      return `${days} дн.`;
    case "zh":
      return `${days} 天`;
    default:
      return `${days} өдөр`;
  }
}

export function formatBookingStatus(status?: string) {
  if (!status) {
    return "Тодорхойгүй";
  }
  return bookingStatusMap[status] || status;
}

export function formatPaymentStatus(status?: string) {
  if (!status) {
    return "Тодорхойгүй";
  }
  return paymentStatusMap[status] || status;
}

export function formatBusinessLine(value?: string) {
  if (!value) {
    return "Тодорхойгүй";
  }
  return businessLineMap[value] || value;
}

export function formatOperationType(value?: string) {
  if (!value) {
    return "Тодорхойгүй";
  }
  return operationTypeMap[value] || value;
}
