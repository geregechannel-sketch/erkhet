import type { Locale } from "@/lib/i18n";
import { repairDeep } from "@/lib/text";

const rawLabelMaps = {
  unknown: {
    mn: "Тодорхойгүй",
    en: "Not specified",
    ru: "Не указано",
    zh: "未说明",
  },
  bookingStatus: {
    mn: {
      pending: "Хүлээгдэж буй",
      confirmed: "Баталгаажсан",
      cancelled: "Цуцлагдсан",
      completed: "Дууссан",
    },
    en: {
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
    },
    ru: {
      pending: "Ожидается",
      confirmed: "Подтверждено",
      cancelled: "Отменено",
      completed: "Завершено",
    },
    zh: {
      pending: "待确认",
      confirmed: "已确认",
      cancelled: "已取消",
      completed: "已完成",
    },
  },
  paymentStatus: {
    mn: {
      unpaid: "Төлөөгүй",
      pending: "Хүлээгдэж буй",
      partially_paid: "Хэсэгчлэн төлсөн",
      paid: "Төлөгдсөн",
      failed: "Амжилтгүй",
      cancelled: "Цуцлагдсан",
      refunded: "Буцаасан",
      partially_refunded: "Хэсэгчлэн буцаасан",
    },
    en: {
      unpaid: "Unpaid",
      pending: "Pending",
      partially_paid: "Partially paid",
      paid: "Paid",
      failed: "Failed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      partially_refunded: "Partially refunded",
    },
    ru: {
      unpaid: "Не оплачено",
      pending: "Ожидается",
      partially_paid: "Частично оплачено",
      paid: "Оплачено",
      failed: "Неуспешно",
      cancelled: "Отменено",
      refunded: "Возвращено",
      partially_refunded: "Частичный возврат",
    },
    zh: {
      unpaid: "未支付",
      pending: "处理中",
      partially_paid: "部分支付",
      paid: "已支付",
      failed: "失败",
      cancelled: "已取消",
      refunded: "已退款",
      partially_refunded: "部分退款",
    },
  },
  businessLine: {
    mn: {
      inbound: "Монголд аялуулах",
      outbound: "Гадаад аялал",
      domestic: "Дотоод аялал",
    },
    en: {
      inbound: "Inbound",
      outbound: "Outbound",
      domestic: "Domestic",
    },
    ru: {
      inbound: "Приём в Монголии",
      outbound: "Выездной тур",
      domestic: "Внутренний тур",
    },
    zh: {
      inbound: "入境游",
      outbound: "出境游",
      domestic: "国内游",
    },
  },
  operationType: {
    mn: {
      scheduled: "Хуваарьт",
      custom: "Захиалгат",
    },
    en: {
      scheduled: "Scheduled",
      custom: "Custom",
    },
    ru: {
      scheduled: "По расписанию",
      custom: "Индивидуальный",
    },
    zh: {
      scheduled: "固定班期",
      custom: "定制",
    },
  },
  userRole: {
    mn: {
      customer: "Хэрэглэгч",
      super_admin: "Супер админ",
      booking_manager: "Захиалгын менежер",
      finance: "Санхүү",
      support: "Дэмжлэг",
    },
    en: {
      customer: "Customer",
      super_admin: "Super admin",
      booking_manager: "Booking manager",
      finance: "Finance",
      support: "Support",
    },
    ru: {
      customer: "Клиент",
      super_admin: "Супер-админ",
      booking_manager: "Менеджер бронирований",
      finance: "Финансы",
      support: "Поддержка",
    },
    zh: {
      customer: "用户",
      super_admin: "超级管理员",
      booking_manager: "预订经理",
      finance: "财务",
      support: "客服支持",
    },
  },
  userStatus: {
    mn: {
      active: "Идэвхтэй",
      inactive: "Идэвхгүй",
      blocked: "Блоклосон",
    },
    en: {
      active: "Active",
      inactive: "Inactive",
      blocked: "Blocked",
    },
    ru: {
      active: "Активен",
      inactive: "Неактивен",
      blocked: "Заблокирован",
    },
    zh: {
      active: "启用",
      inactive: "未启用",
      blocked: "已封禁",
    },
  },
  serviceBookingStatus: {
    mn: {
      new: "Шинэ",
      in_review: "Хянагдаж байна",
      quoted: "Үнийн санал гарсан",
      confirmed: "Баталгаажсан",
      cancelled: "Цуцлагдсан",
      completed: "Дууссан",
    },
    en: {
      new: "New",
      in_review: "In review",
      quoted: "Quoted",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
    },
    ru: {
      new: "Новый",
      in_review: "На проверке",
      quoted: "Коммерческое предложение",
      confirmed: "Подтверждено",
      cancelled: "Отменено",
      completed: "Завершено",
    },
    zh: {
      new: "新建",
      in_review: "审核中",
      quoted: "已报价",
      confirmed: "已确认",
      cancelled: "已取消",
      completed: "已完成",
    },
  },
  serviceType: {
    mn: {
      hotel: "Зочид буудал",
      restaurant: "Ресторан",
      flight: "Нислэг",
      taxi: "Такси",
      esim: "e-SIM",
      insurance: "Даатгал",
    },
    en: {
      hotel: "Hotel",
      restaurant: "Restaurant",
      flight: "Flight",
      taxi: "Taxi",
      esim: "e-SIM",
      insurance: "Insurance",
    },
    ru: {
      hotel: "Отель",
      restaurant: "Ресторан",
      flight: "Авиабилет",
      taxi: "Такси",
      esim: "e-SIM",
      insurance: "Страховка",
    },
    zh: {
      hotel: "酒店",
      restaurant: "餐厅",
      flight: "机票",
      taxi: "出租车",
      esim: "e-SIM",
      insurance: "保险",
    },
  },
  tourStatus: {
    mn: {
      draft: "Ноорог",
      published: "Нийтэлсэн",
      archived: "Архивласан",
    },
    en: {
      draft: "Draft",
      published: "Published",
      archived: "Archived",
    },
    ru: {
      draft: "Черновик",
      published: "Опубликовано",
      archived: "Архив",
    },
    zh: {
      draft: "草稿",
      published: "已发布",
      archived: "已归档",
    },
  },
  tourKind: {
    mn: {
      multi_day: "Олон өдрийн",
      day_tour: "Нэг өдрийн",
    },
    en: {
      multi_day: "Multi-day",
      day_tour: "Day tour",
    },
    ru: {
      multi_day: "Многодневный",
      day_tour: "Однодневный",
    },
    zh: {
      multi_day: "多日游",
      day_tour: "一日游",
    },
  },
  reconciliationState: {
    mn: {
      matched: "Таарсан",
      pending: "Хүлээгдэж буй",
      failed: "Амжилтгүй",
      cancelled: "Цуцлагдсан",
      refunded: "Буцаасан",
      unpaid: "Төлөөгүй",
      underpaid: "Дутуу төлсөн",
      overpaid: "Илүү төлсөн",
    },
    en: {
      matched: "Matched",
      pending: "Pending",
      failed: "Failed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      unpaid: "Unpaid",
      underpaid: "Underpaid",
      overpaid: "Overpaid",
    },
    ru: {
      matched: "Сверено",
      pending: "Ожидается",
      failed: "Неуспешно",
      cancelled: "Отменено",
      refunded: "Возвращено",
      unpaid: "Не оплачено",
      underpaid: "Недоплата",
      overpaid: "Переплата",
    },
    zh: {
      matched: "已匹配",
      pending: "处理中",
      failed: "失败",
      cancelled: "已取消",
      refunded: "已退款",
      unpaid: "未支付",
      underpaid: "少付",
      overpaid: "多付",
    },
  },
  durationUnknown: {
    mn: "Тодорхойгүй",
    en: "Not specified",
    ru: "Не указано",
    zh: "未说明",
  },
} as const;

const labelMaps = repairDeep(rawLabelMaps) as typeof rawLabelMaps;

const localeTags: Record<Locale, string> = {
  mn: "mn-MN",
  en: "en-US",
  ru: "ru-RU",
  zh: "zh-CN",
};

function resolveLocaleTag(locale: Locale) {
  return localeTags[locale] || localeTags.mn;
}

function formatMappedValue(
  value: string | undefined,
  map: Record<Locale, Record<string, string>>,
  locale: Locale = "mn"
) {
  if (!value) {
    return labelMaps.unknown[locale];
  }
  return map[locale]?.[value] || value;
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
    return labelMaps.durationUnknown[locale];
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

export function formatUnknown(locale: Locale = "mn") {
  return labelMaps.unknown[locale];
}

export function formatBookingStatus(status?: string, locale: Locale = "mn") {
  return formatMappedValue(status, labelMaps.bookingStatus, locale);
}

export function formatPaymentStatus(status?: string, locale: Locale = "mn") {
  return formatMappedValue(status, labelMaps.paymentStatus, locale);
}

export function formatBusinessLine(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.businessLine, locale);
}

export function formatOperationType(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.operationType, locale);
}

export function formatUserRole(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.userRole, locale);
}

export function formatUserStatus(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.userStatus, locale);
}

export function formatServiceBookingStatus(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.serviceBookingStatus, locale);
}

export function formatServiceType(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.serviceType, locale);
}

export function formatTourStatus(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.tourStatus, locale);
}

export function formatTourKind(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.tourKind, locale);
}

export function formatReconciliationState(value?: string, locale: Locale = "mn") {
  return formatMappedValue(value, labelMaps.reconciliationState, locale);
}
