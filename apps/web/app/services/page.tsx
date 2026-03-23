"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getLocalizedServices } from "@/lib/localized-content";
import { siteData } from "@/lib/siteData";
import type { ServiceBooking } from "@/lib/types";

type ServiceType = ServiceBooking["serviceType"];
type ServiceCard = {
  id: ServiceType;
  title: string;
  desc: string;
  image: string;
  highlights: string[];
};

const copyByLocale = {
  mn: {
    eyebrow: "Service Desk",
    title: "Үйлчилгээний захиалга",
    body: "Зочид буудал, ресторан, онгоцны суудал, такси, e-SIM, даатгалын хүсэлтээ нэг цонхоор илгээж, төлөвөө өөрийн бүртгэлээс хянаарай.",
    actionBook: "Захиалах",
    actionLoginBook: "Нэвтэрч захиалах",
    selected: "Сонгосон үйлчилгээ",
    loginPrompt: "Үйлчилгээний хүсэлт үүсгэхийн тулд нэвтэрнэ үү.",
    login: "Нэвтрэх",
    register: "Бүртгүүлэх",
    contactName: "Холбоо барих нэр",
    email: "И-мэйл",
    phone: "Утас",
    city: "Хот",
    destination: "Очих хот / бүс",
    guests: "Хүний тоо",
    rooms: "Өрөөний тоо",
    roomType: "Өрөөний төрөл / нэмэлт хүсэлт",
    cuisine: "Хоолны төрөл",
    restaurantStyle: "Business / Family / Private dining",
    flightFrom: "Хаанаас",
    flightTo: "Хаашаа",
    passengers: "Зорчигчийн тоо",
    pickup: "Тосох газар",
    dropoff: "Буулгах газар",
    days: "Хэрэглэх хоног",
    quantity: "Тоо ширхэг",
    note: "Нэмэлт тайлбар / preference",
    submitting: "Илгээж байна...",
    submit: "Хүсэлт илгээх",
    requiredError: "Шаардлагатай мэдээллээ бүрэн оруулна уу.",
    sent: "хүсэлт амжилттай илгээгдлээ.",
    failed: "Хүсэлт илгээхэд алдаа гарлаа.",
    myRequests: "Миний үйлчилгээний хүсэлтүүд",
    myRequestsEyebrow: "My Requests",
    loginToSee: "Нэвтэрсний дараа таны илгээсэн бүх service request энд харагдана.",
    loading: "Ачааллаж байна...",
    empty: "Одоогоор үйлчилгээний хүсэлт алга.",
    qtyLine: "Тоон мэдээлэл",
    adminNote: "Admin note",
    statuses: {
      new: "Шинэ",
      in_review: "Хянагдаж байна",
      quoted: "Үнийн санал гарсан",
      confirmed: "Баталгаажсан",
      cancelled: "Цуцлагдсан",
      completed: "Дууссан",
    },
    intros: {
      hotel: "Очих хот, буудлын зэрэглэл, өрөөний тоо, зочдын мэдээллээ оруулна.",
      restaurant: "Хот, огноо, цаг, хүний тоо, хоолны төрлөө оруулна.",
      flight: "Нисэх чиглэл, явах/буцах өдөр, cabin class, зорчигчийн тоогоо оруулна.",
      taxi: "Тосох газар, буулгах газар, цаг, тээврийн хэрэгслийн хэрэгцээгээ оруулна.",
      esim: "Очих улс, идэвхжих өдөр, дата багцын хэрэгцээгээ оруулна.",
      insurance: "Очих улс, даатгалын хугацаа, аялагчдын тоо, хамрах хүрээгээ оруулна.",
    },
  },
  en: {
    eyebrow: "Service Desk",
    title: "Service Booking",
    body: "Submit hotel, restaurant, flight, taxi, e-SIM, and insurance requests from one place and track their status from your account.",
    actionBook: "Book now",
    actionLoginBook: "Sign in to book",
    selected: "Selected service",
    loginPrompt: "Sign in to create a service request.",
    login: "Sign in",
    register: "Register",
    contactName: "Contact name",
    email: "Email",
    phone: "Phone",
    city: "City",
    destination: "Destination city / region",
    guests: "Guest count",
    rooms: "Room count",
    roomType: "Room type / special request",
    cuisine: "Cuisine",
    restaurantStyle: "Business / Family / Private dining",
    flightFrom: "From",
    flightTo: "To",
    passengers: "Passenger count",
    pickup: "Pickup location",
    dropoff: "Drop-off location",
    days: "Usage days",
    quantity: "Quantity",
    note: "Additional note / preference",
    submitting: "Sending...",
    submit: "Submit request",
    requiredError: "Please complete the required fields.",
    sent: "request sent successfully.",
    failed: "Failed to submit request.",
    myRequests: "My service requests",
    myRequestsEyebrow: "My Requests",
    loginToSee: "After sign-in, all your submitted service requests will appear here.",
    loading: "Loading...",
    empty: "No service requests yet.",
    qtyLine: "Quantity",
    adminNote: "Admin note",
    statuses: { new: "New", in_review: "In review", quoted: "Quoted", confirmed: "Confirmed", cancelled: "Cancelled", completed: "Completed" },
    intros: {
      hotel: "Enter your city, hotel class, room count, and guest details.",
      restaurant: "Provide city, date, time, guest count, and cuisine preference.",
      flight: "Enter route, departure and return dates, cabin class, and passenger count.",
      taxi: "Enter pickup, drop-off, schedule, and vehicle preferences.",
      esim: "Select destination country, activation date, and preferred data plan.",
      insurance: "Enter destination, coverage dates, traveler count, and preferred protection level.",
    },
  },
  ru: {
    eyebrow: "Service Desk",
    title: "Заказ услуг",
    body: "Отправляйте запросы на отель, ресторан, авиабилеты, такси, e-SIM и страховку из одного окна и отслеживайте статус в кабинете.",
    actionBook: "Забронировать",
    actionLoginBook: "Войти и забронировать",
    selected: "Выбранная услуга",
    loginPrompt: "Войдите, чтобы создать сервисный запрос.",
    login: "Войти",
    register: "Регистрация",
    contactName: "Контактное имя",
    email: "Email",
    phone: "Телефон",
    city: "Город",
    destination: "Город / регион",
    guests: "Количество гостей",
    rooms: "Количество номеров",
    roomType: "Тип номера / пожелания",
    cuisine: "Тип кухни",
    restaurantStyle: "Business / Family / Private dining",
    flightFrom: "Откуда",
    flightTo: "Куда",
    passengers: "Количество пассажиров",
    pickup: "Место посадки",
    dropoff: "Место высадки",
    days: "Количество дней",
    quantity: "Количество",
    note: "Дополнительная информация / preference",
    submitting: "Отправка...",
    submit: "Отправить запрос",
    requiredError: "Пожалуйста, заполните обязательные поля.",
    sent: "запрос успешно отправлен.",
    failed: "Не удалось отправить запрос.",
    myRequests: "Мои сервисные запросы",
    myRequestsEyebrow: "My Requests",
    loginToSee: "После входа здесь будут отображаться все ваши сервисные запросы.",
    loading: "Загрузка...",
    empty: "Пока нет сервисных запросов.",
    qtyLine: "Количество",
    adminNote: "Admin note",
    statuses: { new: "Новый", in_review: "На проверке", quoted: "Коммерческое предложение", confirmed: "Подтверждено", cancelled: "Отменено", completed: "Завершено" },
    intros: {
      hotel: "Укажите город, класс отеля, количество номеров и гостей.",
      restaurant: "Укажите город, дату, время, количество гостей и предпочтения по кухне.",
      flight: "Укажите маршрут, даты вылета и возврата, класс и количество пассажиров.",
      taxi: "Укажите точки посадки и высадки, время и тип автомобиля.",
      esim: "Укажите страну назначения, дату активации и пакет данных.",
      insurance: "Укажите страну, сроки страхования, число путешественников и уровень покрытия.",
    },
  },
  zh: {
    eyebrow: "Service Desk",
    title: "服务预订",
    body: "在一个页面提交酒店、餐厅、机票、出租车、e-SIM 和旅行保险请求，并在账户中跟踪状态。",
    actionBook: "立即预订",
    actionLoginBook: "登录后预订",
    selected: "已选服务",
    loginPrompt: "请先登录以创建服务请求。",
    login: "登录",
    register: "注册",
    contactName: "联系人姓名",
    email: "邮箱",
    phone: "电话",
    city: "城市",
    destination: "目的城市 / 地区",
    guests: "人数",
    rooms: "房间数",
    roomType: "房型 / 特殊需求",
    cuisine: "菜系",
    restaurantStyle: "Business / Family / Private dining",
    flightFrom: "出发地",
    flightTo: "目的地",
    passengers: "乘客人数",
    pickup: "上车地点",
    dropoff: "下车地点",
    days: "使用天数",
    quantity: "数量",
    note: "附加说明 / preference",
    submitting: "发送中...",
    submit: "提交请求",
    requiredError: "请完整填写必填信息。",
    sent: "请求已成功提交。",
    failed: "提交请求失败。",
    myRequests: "我的服务请求",
    myRequestsEyebrow: "My Requests",
    loginToSee: "登录后，您提交的所有服务请求会显示在这里。",
    loading: "加载中...",
    empty: "目前没有服务请求。",
    qtyLine: "数量",
    adminNote: "Admin note",
    statuses: { new: "新建", in_review: "审核中", quoted: "已报价", confirmed: "已确认", cancelled: "已取消", completed: "已完成" },
    intros: {
      hotel: "请输入目的城市、酒店等级、房间数和住客信息。",
      restaurant: "请输入城市、日期、时间、人数和用餐偏好。",
      flight: "请输入航线、出发和返程日期、舱位等级以及乘客人数。",
      taxi: "请输入上车点、下车点、时间和车辆偏好。",
      esim: "请输入目的地国家、启用日期和流量需求。",
      insurance: "请输入目的地、保障日期、旅客人数和所需保障级别。",
    },
  },
} as const;

const serviceBadgeLabels: Record<ServiceType, string> = {
  hotel: "HOTEL",
  restaurant: "RESTAURANT",
  flight: "FLIGHT",
  taxi: "TAXI",
  esim: "e-SIM",
  insurance: "INSURANCE",
};

const insuranceOptionsByLocale = {
  mn: {
    policyLabel: "Даатгалын төрөл",
    coverageLabel: "Хамрах хүрээ",
    policyOptions: [
      { value: "single-trip", label: "Нэг удаагийн аялал" },
      { value: "family", label: "Гэр бүлийн хамгаалалт" },
      { value: "business", label: "Бизнес аялал" },
    ],
    coverageOptions: [
      { value: "standard", label: "Стандарт хамгаалалт" },
      { value: "premium", label: "Өргөтгөсөн хамгаалалт" },
      { value: "adventure", label: "Адал явдлын хамгаалалт" },
    ],
  },
  en: {
    policyLabel: "Policy type",
    coverageLabel: "Coverage level",
    policyOptions: [
      { value: "single-trip", label: "Single-trip cover" },
      { value: "family", label: "Family cover" },
      { value: "business", label: "Business travel cover" },
    ],
    coverageOptions: [
      { value: "standard", label: "Standard cover" },
      { value: "premium", label: "Premium cover" },
      { value: "adventure", label: "Adventure cover" },
    ],
  },
  ru: {
    policyLabel: "Тип полиса",
    coverageLabel: "Уровень покрытия",
    policyOptions: [
      { value: "single-trip", label: "Разовая поездка" },
      { value: "family", label: "Семейное покрытие" },
      { value: "business", label: "Деловая поездка" },
    ],
    coverageOptions: [
      { value: "standard", label: "Стандартное покрытие" },
      { value: "premium", label: "Расширенное покрытие" },
      { value: "adventure", label: "Приключенческое покрытие" },
    ],
  },
  zh: {
    policyLabel: "保险类型",
    coverageLabel: "保障级别",
    policyOptions: [
      { value: "single-trip", label: "单次出行保障" },
      { value: "family", label: "家庭保障" },
      { value: "business", label: "商务出行保障" },
    ],
    coverageOptions: [
      { value: "standard", label: "标准保障" },
      { value: "premium", label: "高级保障" },
      { value: "adventure", label: "探险保障" },
    ],
  },
} as const;

function statusLabel(status: ServiceBooking["status"], copy: (typeof copyByLocale)[keyof typeof copyByLocale]) {
  return copy.statuses[status] || status;
}

function ServicesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const insuranceOptions = insuranceOptionsByLocale[locale];
  const services = useMemo(() => getLocalizedServices(locale) as ServiceCard[], [locale]);
  const [selected, setSelected] = useState<ServiceType>((searchParams.get("service") as ServiceType) || "hotel");
  const [requests, setRequests] = useState<ServiceBooking[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const current = searchParams.get("service") as ServiceType | null;
    if (current && services.some((item) => item.id === current)) {
      setSelected(current);
    }
  }, [searchParams, services]);

  useEffect(() => {
    if (!token) {
      setRequests([]);
      return;
    }
    setLoadingRequests(true);
    void browserApiFetch<ServiceBooking[]>("/me/service-bookings", { headers: authHeaders(token) })
      .then(setRequests)
      .finally(() => setLoadingRequests(false));
  }, [token]);

  const currentService = services.find((item) => item.id === selected) || services[0];

  const chooseService = (serviceType: ServiceType) => {
    setSelected(serviceType);
    setMessage(null);
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/services?service=${serviceType}`)}`);
      return;
    }
    document.getElementById("service-booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/services?service=${selected}`)}`);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payloadByService: Record<ServiceType, { destination: string; travelDate: string; endDate?: string; quantity: number; details: Record<string, string | number> }> = {
      hotel: {
        destination: String(formData.get("hotelCity") || ""),
        travelDate: String(formData.get("hotelCheckIn") || ""),
        endDate: String(formData.get("hotelCheckOut") || ""),
        quantity: Number(formData.get("hotelRooms") || 1),
        details: { hotelClass: String(formData.get("hotelClass") || ""), guests: Number(formData.get("hotelGuests") || 1), roomType: String(formData.get("hotelRoomType") || "") },
      },
      restaurant: {
        destination: String(formData.get("restaurantCity") || ""),
        travelDate: String(formData.get("restaurantDate") || ""),
        quantity: Number(formData.get("restaurantGuests") || 1),
        details: { reservationTime: String(formData.get("restaurantTime") || ""), cuisine: String(formData.get("restaurantCuisine") || ""), venueStyle: String(formData.get("restaurantStyle") || "") },
      },
      flight: {
        destination: `${String(formData.get("flightFrom") || "")} -> ${String(formData.get("flightTo") || "")}`,
        travelDate: String(formData.get("flightDeparture") || ""),
        endDate: String(formData.get("flightReturn") || ""),
        quantity: Number(formData.get("flightPassengers") || 1),
        details: { fromCity: String(formData.get("flightFrom") || ""), toCity: String(formData.get("flightTo") || ""), tripType: String(formData.get("flightTripType") || ""), cabinClass: String(formData.get("flightCabin") || "") },
      },
      taxi: {
        destination: `${String(formData.get("taxiPickup") || "")} -> ${String(formData.get("taxiDropoff") || "")}`,
        travelDate: String(formData.get("taxiDate") || ""),
        quantity: Number(formData.get("taxiPassengers") || 1),
        details: { pickupTime: String(formData.get("taxiTime") || ""), vehicleType: String(formData.get("taxiVehicle") || ""), pickupLocation: String(formData.get("taxiPickup") || ""), dropoffLocation: String(formData.get("taxiDropoff") || "") },
      },
      esim: {
        destination: String(formData.get("esimCountry") || ""),
        travelDate: String(formData.get("esimActivation") || ""),
        quantity: Number(formData.get("esimQuantity") || 1),
        details: { dataPlan: String(formData.get("esimPlan") || ""), validDays: Number(formData.get("esimDays") || 1), deviceType: String(formData.get("esimDevice") || "") },
      },
      insurance: {
        destination: String(formData.get("insuranceCountry") || ""),
        travelDate: String(formData.get("insuranceStart") || ""),
        endDate: String(formData.get("insuranceEnd") || ""),
        quantity: Number(formData.get("insuranceTravelers") || 1),
        details: {
          policyType: String(formData.get("insurancePolicy") || ""),
          coverage: String(formData.get("insuranceCoverage") || ""),
        },
      },
    };

    const payload = payloadByService[selected];
    if (!payload.destination || !payload.travelDate) {
      setMessage(copy.requiredError);
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const created = await browserApiFetch<ServiceBooking>("/service-bookings", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          serviceType: selected,
          destination: payload.destination,
          travelDate: payload.travelDate,
          endDate: payload.endDate,
          quantity: payload.quantity,
          contactName: formData.get("contactName"),
          contactEmail: formData.get("contactEmail"),
          contactPhone: formData.get("contactPhone"),
          details: { ...payload.details, note: String(formData.get("note") || "") },
        }),
      });
      setRequests((current) => [created, ...current]);
      event.currentTarget.reset();
      setMessage(`${created.serviceLabel} ${copy.sent}`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : copy.failed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <section className="pageHero serviceHero">
        <div className="container stackMd">
          <p className="eyebrow serviceEyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="serviceCardGrid">
            {services.map((service) => (
              <article key={service.id} className={`serviceCard${selected === service.id ? " selected" : ""}`}>
                <img src={service.image} alt={service.title} className="serviceCardImage" />
                <div className="serviceCardBody stackSm">
                  <div className="stackXs">
                    <p className="eyebrow serviceBadge">{serviceBadgeLabels[service.id]}</p>
                    <h3>{service.title}</h3>
                    <p className="meta">{service.desc}</p>
                  </div>
                  <ul className="serviceHighlights">
                    {service.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button className="btn primary" type="button" onClick={() => chooseService(service.id)}>
                    {user ? copy.actionBook : copy.actionLoginBook}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="serviceLayout">
            <section id="service-booking-form" className="panel stackMd serviceFormPanel">
              <div className="sectionHeading compact">
                <div>
                  <p className="eyebrow">{copy.selected}</p>
                  <h2>{currentService.title}</h2>
                </div>
              </div>
              <p className="meta">{copy.intros[selected]}</p>

              {!user ? (
                <div className="serviceLoginPrompt stackSm">
                  <p>{copy.loginPrompt}</p>
                  <div className="rowActions">
                    <Link className="btn primary" href={`/auth/login?redirect=${encodeURIComponent(`/services?service=${selected}`)}`}>{copy.login}</Link>
                    <Link className="btn secondary" href={`/auth/register?redirect=${encodeURIComponent(`/services?service=${selected}`)}`}>{copy.register}</Link>
                  </div>
                </div>
              ) : (
                <form className="serviceRequestForm" onSubmit={onSubmit}>
                  <div className="serviceFieldsGrid">
                    <input name="contactName" defaultValue={user.fullName} placeholder={copy.contactName} required />
                    <input name="contactEmail" defaultValue={user.email} placeholder={copy.email} type="email" required />
                    <input name="contactPhone" defaultValue={user.phone} placeholder={copy.phone} required />

                    {selected === "hotel" ? (
                      <>
                        <input name="hotelCity" placeholder={copy.destination} required />
                        <input name="hotelCheckIn" type="date" required />
                        <input name="hotelCheckOut" type="date" required />
                        <input name="hotelGuests" type="number" min="1" defaultValue="2" placeholder={copy.guests} required />
                        <input name="hotelRooms" type="number" min="1" defaultValue="1" placeholder={copy.rooms} required />
                        <select name="hotelClass" defaultValue="4-star">
                          <option value="4-star">4 star</option>
                          <option value="5-star">5 star</option>
                          <option value="boutique">Boutique</option>
                        </select>
                        <input className="full" name="hotelRoomType" placeholder={copy.roomType} />
                      </>
                    ) : null}

                    {selected === "restaurant" ? (
                      <>
                        <input name="restaurantCity" placeholder={copy.city} required />
                        <input name="restaurantDate" type="date" required />
                        <input name="restaurantTime" type="time" required />
                        <input name="restaurantGuests" type="number" min="1" defaultValue="2" placeholder={copy.guests} required />
                        <input name="restaurantCuisine" placeholder={copy.cuisine} />
                        <input name="restaurantStyle" placeholder={copy.restaurantStyle} />
                      </>
                    ) : null}

                    {selected === "flight" ? (
                      <>
                        <input name="flightFrom" placeholder={copy.flightFrom} required />
                        <input name="flightTo" placeholder={copy.flightTo} required />
                        <select name="flightTripType" defaultValue="round-trip">
                          <option value="round-trip">Round-trip</option>
                          <option value="one-way">One-way</option>
                        </select>
                        <select name="flightCabin" defaultValue="economy">
                          <option value="economy">Economy</option>
                          <option value="premium-economy">Premium economy</option>
                          <option value="business">Business</option>
                        </select>
                        <input name="flightDeparture" type="date" required />
                        <input name="flightReturn" type="date" />
                        <input name="flightPassengers" type="number" min="1" defaultValue="1" placeholder={copy.passengers} required />
                      </>
                    ) : null}

                    {selected === "taxi" ? (
                      <>
                        <input name="taxiPickup" placeholder={copy.pickup} required />
                        <input name="taxiDropoff" placeholder={copy.dropoff} required />
                        <input name="taxiDate" type="date" required />
                        <input name="taxiTime" type="time" required />
                        <input name="taxiPassengers" type="number" min="1" defaultValue="2" placeholder={copy.passengers} required />
                        <select name="taxiVehicle" defaultValue="sedan">
                          <option value="sedan">Sedan</option>
                          <option value="van">Van</option>
                          <option value="vip">VIP</option>
                        </select>
                      </>
                    ) : null}

                    {selected === "esim" ? (
                      <>
                        <input name="esimCountry" placeholder={copy.destination} required />
                        <input name="esimActivation" type="date" required />
                        <select name="esimPlan" defaultValue="5gb">
                          <option value="5gb">5 GB</option>
                          <option value="10gb">10 GB</option>
                          <option value="unlimited">Unlimited</option>
                        </select>
                        <input name="esimDays" type="number" min="1" defaultValue="7" placeholder={copy.days} required />
                        <input name="esimQuantity" type="number" min="1" defaultValue="1" placeholder={copy.quantity} required />
                        <select name="esimDevice" defaultValue="iphone">
                          <option value="iphone">iPhone</option>
                          <option value="android">Android</option>
                          <option value="other">Other</option>
                        </select>
                      </>
                    ) : null}

                    {selected === "insurance" ? (
                      <>
                        <input name="insuranceCountry" placeholder={copy.destination} required />
                        <input name="insuranceStart" type="date" required />
                        <input name="insuranceEnd" type="date" required />
                        <input name="insuranceTravelers" type="number" min="1" defaultValue="1" placeholder={copy.passengers} required />
                        <select name="insurancePolicy" defaultValue="single-trip">
                          {insuranceOptions.policyOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <select name="insuranceCoverage" defaultValue="standard">
                          {insuranceOptions.coverageOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </>
                    ) : null}

                    <textarea className="full" name="note" rows={4} placeholder={copy.note} />
                  </div>

                  <div className="rowActions">
                    <button className="btn primary" type="submit" disabled={submitting}>
                      {submitting ? copy.submitting : copy.submit}
                    </button>
                    <span className="meta">{siteData.payment.instructions}</span>
                  </div>
                </form>
              )}

              {message ? <p className="inlineMessage success">{message}</p> : null}
            </section>

            <aside className="panel stackMd serviceHistoryPanel">
              <div className="sectionHeading compact">
                <div>
                  <p className="eyebrow">{copy.myRequestsEyebrow}</p>
                  <h2>{copy.myRequests}</h2>
                </div>
              </div>

              {!user ? <p className="meta">{copy.loginToSee}</p> : null}
              {user && loadingRequests ? <p className="meta">{copy.loading}</p> : null}
              {user && !loadingRequests && requests.length === 0 ? <p className="meta">{copy.empty}</p> : null}

              {user && requests.map((request) => (
                <article key={request.serviceReference} className="serviceRequestCard stackSm">
                  <div className="rowActions spread">
                    <strong>{request.serviceLabel}</strong>
                    <span className={`statusPill status-${request.status}`}>{statusLabel(request.status, copy)}</span>
                  </div>
                  <p className="meta">{request.serviceReference}</p>
                  <p>{request.destination}</p>
                  <p className="meta">{formatDate(request.travelDate)} {request.endDate ? `- ${formatDate(request.endDate)}` : ""}</p>
                  <p className="meta">{copy.qtyLine}: {request.quantity}</p>
                  {request.adminNote ? <p className="meta">{copy.adminNote}: {request.adminNote}</p> : null}
                </article>
              ))}
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServicesPageFallback() {
  return (
    <main>
      <section className="pageHero serviceHero">
        <div className="container stackMd">
          <p className="eyebrow serviceEyebrow">Service Desk</p>
          <h1>Үйлчилгээний захиалга</h1>
          <p>Үйлчилгээний хэсгийг ачааллаж байна...</p>
        </div>
      </section>
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServicesPageFallback />}>
      <ServicesPageContent />
    </Suspense>
  );
}


