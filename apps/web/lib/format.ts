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

export function formatCurrency(amount?: number, currency = "MNT") {
  if (typeof amount !== "number") {
    return "";
  }

  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(value?: string | Date | null) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function describeDuration(days: number, nights: number) {
  if (days <= 0) {
    return "Тодорхойгүй";
  }
  if (nights > 0) {
    return `${days} өдөр / ${nights} шөнө`;
  }
  return `${days} өдөр`;
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
