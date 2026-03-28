import type { Locale } from "@/lib/i18n";
import type { SupportEvent, SupportRequest } from "@/lib/types";

export type SupportType = SupportRequest["type"];
export type SupportStatus = SupportRequest["status"];

export const supportTypeLabels: Record<Locale, Record<SupportType, string>> = {
  mn: {
    support: "Дэмжлэгийн хүсэлт",
    feedback: "Санал хүсэлт",
    complaint: "Гомдол",
  },
  en: {
    support: "Support request",
    feedback: "Feedback",
    complaint: "Complaint",
  },
  ru: {
    support: "Запрос в поддержку",
    feedback: "Отзыв",
    complaint: "Жалоба",
  },
  zh: {
    support: "咨询支持",
    feedback: "意见反馈",
    complaint: "投诉",
  },
};

export const supportStatusLabels: Record<Locale, Record<SupportStatus, string>> = {
  mn: {
    new: "Шинэ",
    in_review: "Шалгаж байна",
    resolved: "Шийдсэн",
    closed: "Хаасан",
  },
  en: {
    new: "New",
    in_review: "In review",
    resolved: "Resolved",
    closed: "Closed",
  },
  ru: {
    new: "Новый",
    in_review: "В работе",
    resolved: "Решено",
    closed: "Закрыто",
  },
  zh: {
    new: "新建",
    in_review: "处理中",
    resolved: "已解决",
    closed: "已关闭",
  },
};

const autoReplyByLocale: Record<Locale, Record<SupportType, string>> = {
  mn: {
    support: "Таны хүсэлтийг хүлээн авлаа. Манай оператор тун удахгүй тантай эргэн холбогдоно.",
    feedback: "Таны санал хүсэлтийг хүлээн авлаа. Бид үйлчилгээний чанараа сайжруулахдаа таны илгээсэн мэдээллийг ашиглана.",
    complaint: "Таны гомдлыг хүлээн авлаа. Манай баг яаралтай бүртгэж авсан бөгөөд боломжит хамгийн ойрын хугацаанд танд эргэн холбогдоно.",
  },
  en: {
    support: "We have received your request. A member of our team will contact you shortly.",
    feedback: "We have received your feedback. Thank you for helping us improve our service.",
    complaint: "We have received your complaint. Our team has logged it with priority and will contact you as soon as possible.",
  },
  ru: {
    support: "Мы получили ваш запрос. Сотрудник нашей команды свяжется с вами в ближайшее время.",
    feedback: "Мы получили ваш отзыв. Спасибо, что помогаете нам улучшать качество сервиса.",
    complaint: "Мы получили вашу жалобу. Наша команда уже зарегистрировала её в приоритетном порядке и свяжется с вами в ближайшее время.",
  },
  zh: {
    support: "我们已收到您的请求，我们的工作人员将尽快与您联系。",
    feedback: "我们已收到您的反馈。感谢您帮助我们持续改进服务。",
    complaint: "我们已收到您的投诉。团队已优先登记，并会尽快与您联系。",
  },
};

export function getSupportAutoReply(locale: Locale, type: SupportType) {
  return autoReplyByLocale[locale][type];
}

export function findSupportEvent(events: SupportEvent[] | undefined, eventType: string) {
  if (!events?.length) {
    return null;
  }

  for (let index = events.length - 1; index >= 0; index -= 1) {
    if (events[index]?.eventType === eventType) {
      return events[index] ?? null;
    }
  }

  return null;
}

export function getSupportRequestAutoReply(locale: Locale, request: Pick<SupportRequest, "type" | "events"> | null | undefined) {
  if (!request) {
    return null;
  }

  return findSupportEvent(request.events, "auto_reply")?.message || getSupportAutoReply(locale, request.type);
}

export function parseSupportType(value: string | string[] | undefined): SupportType | null {
  return value === "support" || value === "feedback" || value === "complaint" ? value : null;
}
