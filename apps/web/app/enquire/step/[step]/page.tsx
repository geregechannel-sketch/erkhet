"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TravelerDetailsTable } from "@/components/bookings/TravelerDetailsTable";
import { TravelerDetailsEditor } from "@/components/forms/TravelerDetailsEditor";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { siteData } from "@/lib/siteData";
import type { TravelerDetail } from "@/lib/types";

type EnquiryForm = {
  businessLine: string;
  destination: string;
  travelStyle: string;
  startDate: string;
  endDate: string;
  participantCount: string;
  travelerDetails: TravelerDetail[];
  budget: string;
  selectedServices: string[];
  paymentMethod: string;
  fullName: string;
  email: string;
  phone: string;
  note: string;
};

type DestinationOption = {
  title: string;
  summary: string;
  season: string;
  currencyCode: string;
  currencyLabel: string;
  aliases: string[];
};

type BudgetContext = {
  currencyCode: string;
  currencyLabel: string;
  options: string[];
};

const STORAGE_KEY = "erkhet.enquiry.form";
const TOTAL_STEPS = 10;

const businessLineOptions = [
  { value: "inbound", label: "Гадаад жуулчдыг Монголд аялуулах" },
  { value: "outbound", label: "Монгол жуулчдыг гадаад руу аялуулах" },
  { value: "domestic", label: "Дотоодын аялал" }
] as const;

const stepLabels = [
  "Аяллын чиглэл",
  "Чиглэл / Бүс",
  "Аяллын хэв маяг",
  "Огноо",
  "Аялагчдын мэдээлэл",
  "Төсөв",
  "Нэмэлт үйлчилгээ",
  "Холбоо барих",
  "Төлбөр төлөх",
  "Баталгаажуулах"
] as const;

const currencyBudgets: Record<string, string[]> = {
  MNT: ["1-3 сая ₮", "3-6 сая ₮", "6-10 сая ₮", "10+ сая ₮", "Уян хатан"],
  CNY: ["5,000-10,000 CNY", "10,000-18,000 CNY", "18,000-30,000 CNY", "30,000+ CNY", "Уян хатан"],
  AED: ["2,500-5,000 AED", "5,000-9,000 AED", "9,000-15,000 AED", "15,000+ AED", "Уян хатан"],
  RUB: ["60,000-120,000 RUB", "120,000-220,000 RUB", "220,000-360,000 RUB", "360,000+ RUB", "Уян хатан"],
  KRW: ["1,500,000-3,000,000 KRW", "3,000,000-5,500,000 KRW", "5,500,000-8,000,000 KRW", "8,000,000+ KRW", "Уян хатан"],
  JPY: ["120,000-250,000 JPY", "250,000-450,000 JPY", "450,000-700,000 JPY", "700,000+ JPY", "Уян хатан"],
  THB: ["25,000-50,000 THB", "50,000-90,000 THB", "90,000-150,000 THB", "150,000+ THB", "Уян хатан"],
  USD: ["1,000-2,000 USD", "2,000-4,000 USD", "4,000-7,000 USD", "7,000+ USD", "Уян хатан"]
};

const outboundDestinationOptions: DestinationOption[] = [
  {
    title: "Хятад",
    summary: "Бээжин, Шанхай, Гуанжоу зэрэг хотын city break, shopping болон business маршрут.",
    season: "Жилийн дөрвөн улирал",
    currencyCode: "CNY",
    currencyLabel: "Хятад юань",
    aliases: ["хятад", "china", "beijing", "shanghai", "бээжин", "шанхай"]
  },
  {
    title: "Дубай, АНЭУ",
    summary: "Luxury stay, shopping festival, desert safari болон family vacation чиглэл.",
    season: "10-4 сар",
    currencyCode: "AED",
    currencyLabel: "АНЭУ дирхам",
    aliases: ["дубай", "dubai", "uae", "анэу", "emirates"]
  },
  {
    title: "ОХУ",
    summary: "Москва, Санкт-Петербург болон соёл, үзвэр, business travel хосолсон маршрут.",
    season: "Жилийн дөрвөн улирал",
    currencyCode: "RUB",
    currencyLabel: "Орос рубль",
    aliases: ["оху", "орос", "russia", "moscow", "москва"]
  },
  {
    title: "БНСУ",
    summary: "Сөүл, Бусан хотын shopping, beauty, medical check-up болон leisure аялал.",
    season: "Жилийн дөрвөн улирал",
    currencyCode: "KRW",
    currencyLabel: "Солонгос вон",
    aliases: ["бнсу", "солонгос", "korea", "seoul", "сөүл"]
  },
  {
    title: "Япон",
    summary: "Токио, Осака, Киото чиглэлийн premium city tour, family travel болон season trip.",
    season: "3-5 сар, 9-11 сар",
    currencyCode: "JPY",
    currencyLabel: "Японы иен",
    aliases: ["япон", "japan", "tokyo", "osaka", "токио", "осака"]
  },
  {
    title: "Тайланд",
    summary: "Бангкок, Паттайя, Пукет чиглэлийн амралт, далайн аялал, family holiday.",
    season: "11-4 сар",
    currencyCode: "THB",
    currencyLabel: "Тайландын бат",
    aliases: ["тайланд", "thailand", "bangkok", "phuket", "паттайя", "пукет"]
  }
];

const paymentMethodDescriptions: Record<string, string> = {
  "QPay (MN)": "Монгол хэрэглэгчдэд түгээмэл QPay QR эсвэл payment link урсгалаар төлбөрөө баталгаажуулна.",
  "Visa/Mastercard (Stripe)": "Олон улсын Visa, Mastercard картаар gateway-ready холбоосоор урьдчилгаа эсвэл үлдэгдлээ төлнө."
};

const defaultForm: EnquiryForm = {
  businessLine: "domestic",
  destination: "",
  travelStyle: "",
  startDate: "",
  endDate: "",
  participantCount: "2",
  travelerDetails: [],
  budget: "",
  selectedServices: [],
  paymentMethod: "",
  fullName: "",
  email: "",
  phone: "",
  note: ""
};

function parseStep(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const next = Number(value || 1);
  if (Number.isNaN(next) || next < 1) return 1;
  if (next > TOTAL_STEPS) return TOTAL_STEPS;
  return next;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getBusinessLineLabel(value: string) {
  return businessLineOptions.find((item) => item.value === value)?.label || value;
}

function getDestinationOptions(businessLine: string): DestinationOption[] {
  if (businessLine === "outbound") {
    return outboundDestinationOptions;
  }

  return siteData.destinations.map((item) => ({
    title: item.title,
    summary: item.summary,
    season: item.season,
    currencyCode: "MNT",
    currencyLabel: "Монгол төгрөг",
    aliases: [normalize(item.title), normalize(item.id)]
  }));
}

function resolveBudgetContext(businessLine: string, destination: string): BudgetContext {
  const options = getDestinationOptions(businessLine);
  const normalized = normalize(destination);
  const matched = normalized
    ? options.find(
        (item) =>
          normalize(item.title) === normalized ||
          item.aliases.some((alias) => normalized.includes(alias) || alias.includes(normalized))
      )
    : undefined;

  const currencyCode = matched?.currencyCode || (businessLine === "outbound" ? "USD" : "MNT");

  return {
    currencyCode,
    currencyLabel: matched?.currencyLabel || (currencyCode === "USD" ? "Ам.доллар" : "Монгол төгрөг"),
    options: currencyBudgets[currencyCode] || currencyBudgets.MNT
  };
}

function buildTravelerSummary(travelers: TravelerDetail[]) {
  if (!travelers.length) {
    return "-";
  }

  return travelers
    .map((traveler, index) => {
      const parts = [
        traveler.fullName || "Нэргүй",
        traveler.age ? `${traveler.age} настай` : "нас оруулаагүй",
        traveler.gender || "хүйс оруулаагүй",
        traveler.hobby ? `хобби: ${traveler.hobby}` : "",
        traveler.diet ? `хоол: ${traveler.diet}` : "",
        traveler.allergy ? `харшил: ${traveler.allergy}` : ""
      ].filter(Boolean);
      return `${index + 1}. ${parts.join(", ")}`;
    })
    .join("\n");
}

function buildSummary(form: EnquiryForm) {
  return [
    `Аяллын чиглэл: ${getBusinessLineLabel(form.businessLine)}`,
    `Чиглэл: ${form.destination || "-"}`,
    `Аяллын хэв маяг: ${form.travelStyle || "-"}`,
    `Огноо: ${form.startDate}${form.endDate ? ` - ${form.endDate}` : ""}`,
    `Хүний тоо: ${form.participantCount}`,
    `Төсөв: ${form.budget || "-"}`,
    `Нэмэлт үйлчилгээ: ${form.selectedServices.join(", ") || "-"}`,
    `Төлбөрийн хэлбэр: ${form.paymentMethod || "-"}`,
    `Аялагчдын нэмэлт мэдээлэл:\n${buildTravelerSummary(form.travelerDetails)}`,
    `Холбоо барих: ${form.fullName} / ${form.email} / ${form.phone || "-"}`,
    `Нэмэлт тайлбар: ${form.note || "-"}`
  ].join("\n");
}

export default function EnquireStepPage() {
  const params = useParams<{ step: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const step = parseStep(params?.step);
  const [form, setForm] = useState<EnquiryForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<EnquiryForm>;
        setForm((current) => ({ ...current, ...parsed }));
      }
    } catch {
      // ignore corrupted draft
    }
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user?.fullName || "",
      email: current.email || user?.email || "",
      phone: current.phone || user?.phone || ""
    }));
  }, [user?.email, user?.fullName, user?.phone]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const destinationOptions = useMemo(() => getDestinationOptions(form.businessLine), [form.businessLine]);
  const budgetContext = useMemo(
    () => resolveBudgetContext(form.businessLine, form.destination),
    [form.businessLine, form.destination]
  );
  const selectedStepLabel = stepLabels[step - 1];
  const isOutbound = form.businessLine === "outbound";

  function setField<K extends keyof EnquiryForm>(field: K, value: EnquiryForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setBusinessLine(value: string) {
    setForm((current) => ({
      ...current,
      businessLine: value,
      destination: "",
      budget: ""
    }));
  }

  function setDestination(value: string) {
    setForm((current) => ({
      ...current,
      destination: value,
      budget: current.destination === value ? current.budget : ""
    }));
  }

  function toggleService(value: string) {
    setForm((current) => ({
      ...current,
      selectedServices: current.selectedServices.includes(value)
        ? current.selectedServices.filter((item) => item !== value)
        : [...current.selectedServices, value]
    }));
  }

  function goToStep(nextStep: number) {
    router.push(`/enquire/step/${Math.max(1, Math.min(TOTAL_STEPS, nextStep))}`);
  }

  function validateCurrentStep() {
    switch (step) {
      case 2:
        return Boolean(form.destination.trim());
      case 3:
        return Boolean(form.travelStyle.trim());
      case 4:
        return Boolean(form.startDate.trim());
      case 5:
        return Boolean(form.participantCount.trim());
      case 6:
        return Boolean(form.budget.trim());
      case 8:
        return Boolean(form.fullName.trim() && form.email.trim());
      case 9:
        return Boolean(form.paymentMethod.trim());
      default:
        return true;
    }
  }

  function onNext() {
    if (!validateCurrentStep()) {
      setMessage("Энэ алхмын шаардлагатай мэдээллийг бүрэн оруулна уу.");
      return;
    }

    setMessage(null);
    goToStep(step + 1);
  }

  async function onSubmit() {
    if (!form.fullName.trim() || !form.email.trim()) {
      setMessage("Холбоо барих мэдээллээ бүрэн оруулна уу.");
      goToStep(8);
      return;
    }

    if (!form.paymentMethod.trim()) {
      setMessage("Төлбөрийн хэлбэрээ сонгоно уу.");
      goToStep(9);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      await browserApiFetch("/support-requests", {
        method: "POST",
        headers: token ? authHeaders(token) : undefined,
        body: JSON.stringify({
          type: "support",
          subject: `Захиалгат аяллын хүсэлт - ${form.destination || getBusinessLineLabel(form.businessLine)}`,
          message: buildSummary(form),
          customerName: form.fullName,
          customerEmail: form.email,
          customerPhone: form.phone
        })
      });
      window.localStorage.removeItem(STORAGE_KEY);
      router.push("/message-success");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Хүсэлт илгээхэд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="pageHero">
        <div className="container stackMd">
          <p className="eyebrow">Алхам {step} / {TOTAL_STEPS}</p>
          <h1>Аялал төлөвлөх</h1>
          <p>10 алхмаар аяллын хэрэгцээ, маршрут, төсөв, төлбөрийн хэлбэр, баталгаажуулалтаа шат дараатай илгээнэ үү.</p>
        </div>
      </section>

      <section className="section">
        <div className="container stackLg">
          <div className="wizardStepsBar">
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                className={`wizardStepPill${index + 1 === step ? " current" : ""}`}
                onClick={() => goToStep(index + 1)}
                aria-current={index + 1 === step ? "step" : undefined}
              >
                <span className="wizardStepIndex">{index + 1}</span>
                <span className="wizardStepLabelText">{label}</span>
              </button>
            ))}
          </div>

          <article className="panel stackMd wizardCard">
            <div className="sectionHeading compact">
              <div>
                <p className="eyebrow">Одоогийн алхам</p>
                <h2>{selectedStepLabel}</h2>
              </div>
            </div>

            {step === 1 ? (
              <div className="grid c3">
                {businessLineOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`card optionCard${form.businessLine === item.value ? " selected" : ""}`}
                    onClick={() => setBusinessLine(item.value)}
                  >
                    <div className="content">{item.label}</div>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="stackMd">
                <p className="meta">
                  {isOutbound
                    ? "Гадаад чиглэл сонгосон тул төсөв нь сонгосон улсын валютаар автоматаар шинэчлэгдэнэ."
                    : "Монгол доторх чиглэлүүдийн төсөв төгрөгөөр харагдана."}
                </p>
                <div className="grid c3">
                  {destinationOptions.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      className={`card optionCard${form.destination === item.title ? " selected" : ""}`}
                      onClick={() => setDestination(item.title)}
                    >
                      <div className="content stackSm">
                        <strong>{item.title}</strong>
                        <p className="meta">{item.summary}</p>
                        <span className="eyebrow">Улирал: {item.season} · {item.currencyCode}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="stackSm">
                  <label className="meta" htmlFor="custom-destination">
                    {isOutbound
                      ? "Жагсаалтад байхгүй улс эсвэл хотоо бичиж болно."
                      : "Жагсаалтад байхгүй чиглэлээ бичиж болно."}
                  </label>
                  <input
                    id="custom-destination"
                    value={form.destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder={
                      isOutbound
                        ? "Жишээ нь: Сингапур, Истанбул, Хонконг"
                        : "Жишээ нь: Хөвсгөл нуур, Хамрын хийд, Баян-Өлгий"
                    }
                  />
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid c3">
                {siteData.travelStyles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`card optionCard${form.travelStyle === item ? " selected" : ""}`}
                    onClick={() => setField("travelStyle", item)}
                  >
                    <div className="content">{item}</div>
                  </button>
                ))}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="stackMd">
                <div className="formGrid">
                  <input type="date" value={form.startDate} onChange={(event) => setField("startDate", event.target.value)} />
                  <input type="date" value={form.endDate} onChange={(event) => setField("endDate", event.target.value)} />
                </div>
                <p className="meta">Эхлэх өдөр заавал сонгоно. Дуусах өдөр тодорхой биш бол хоосон үлдээж болно.</p>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="stackMd">
                <input
                  type="number"
                  min="1"
                  value={form.participantCount}
                  onChange={(event) => setField("participantCount", event.target.value)}
                  placeholder="Аялагчийн тоо"
                />
                <TravelerDetailsEditor value={form.travelerDetails} onChange={(items) => setField("travelerDetails", items)} />
              </div>
            ) : null}

            {step === 6 ? (
              <div className="stackMd">
                <p className="meta">
                  {form.destination
                    ? `${form.destination} чиглэлд төсвийг ${budgetContext.currencyLabel} (${budgetContext.currencyCode})-аар харуулж байна.`
                    : `Чиглэл сонгомогц төсөв тухайн улсын валютаар шинэчлэгдэнэ. Одоогоор ${budgetContext.currencyCode}-аар харуулж байна.`}
                </p>
                <div className="grid c3">
                  {budgetContext.options.map((item) => (
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
            ) : null}

            {step === 7 ? (
              <div className="grid c3">
                {siteData.services.map((service) => (
                  <label key={service.id} className={`card optionCard${form.selectedServices.includes(service.title) ? " selected" : ""}`}>
                    <div className="content stackSm">
                      <strong>{service.title}</strong>
                      <p className="meta">{service.desc}</p>
                      <input
                        type="checkbox"
                        checked={form.selectedServices.includes(service.title)}
                        onChange={() => toggleService(service.title)}
                      />
                    </div>
                  </label>
                ))}
              </div>
            ) : null}

            {step === 8 ? (
              <div className="formGrid">
                <input value={form.fullName} onChange={(event) => setField("fullName", event.target.value)} placeholder="Нэр" required />
                <input value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="И-мэйл" type="text" required />
                <input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="Утас / WhatsApp" />
                <textarea
                  className="full"
                  rows={5}
                  value={form.note}
                  onChange={(event) => setField("note", event.target.value)}
                  placeholder="Нэмэлт тайлбар, тусгай хүсэлт, харшил, хоолны сонголт"
                />
              </div>
            ) : null}

            {step === 9 ? (
              <div className="stackMd">
                <p className="meta">
                  Өмнөх вебд байсан төлбөрийн хэлбэрүүдийг энэ алхамд нэгтгэлээ. Сонгосон хэлбэр тань захиалга,
                  төлбөрийн төв, админ удирдлагад ижил нэршлээр харагдана.
                </p>
                <div className="grid c2">
                  {siteData.payment.methods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      className={`card optionCard${form.paymentMethod === method ? " selected" : ""}`}
                      onClick={() => setField("paymentMethod", method)}
                    >
                      <div className="content stackSm">
                        <strong>{method}</strong>
                        <p className="meta">{paymentMethodDescriptions[method] || "Төлбөрийн хэлбэрийг энэ захиалгатай холбоно."}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <article className="panel stackSm">
                  <strong>Төлбөрийн заавар</strong>
                  <p>{siteData.payment.instructions}</p>
                </article>
              </div>
            ) : null}

            {step === 10 ? (
              <div className="stackMd">
                <div className="grid c2">
                  <article className="card slimCard"><div className="content stackSm"><strong>Аяллын чиглэл</strong><p>{getBusinessLineLabel(form.businessLine)}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>Чиглэл</strong><p>{form.destination || "-"}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>Хэв маяг</strong><p>{form.travelStyle || "-"}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>Огноо</strong><p>{form.startDate}{form.endDate ? ` - ${form.endDate}` : ""}</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>Оролцогч</strong><p>{form.participantCount} хүн</p></div></article>
                  <article className="card slimCard"><div className="content stackSm"><strong>Төсөв</strong><p>{form.budget || "-"}</p></div></article>
                </div>
                <article className="panel stackSm">
                  <strong>Нэмэлт үйлчилгээ</strong>
                  <p>{form.selectedServices.join(", ") || "Сонгоогүй"}</p>
                </article>
                <article className="panel stackSm">
                  <strong>Холбоо барих</strong>
                  <p>{form.fullName} - {form.email} - {form.phone || "-"}</p>
                </article>
                <article className="panel stackSm">
                  <strong>Төлбөрийн хэлбэр</strong>
                  <p>{form.paymentMethod || "Сонгоогүй"}</p>
                </article>
                <article className="panel stackSm">
                  <strong>Аялагчдын мэдээлэл</strong>
                  <TravelerDetailsTable travelers={form.travelerDetails} emptyMessage="Нэмэлт аялагчийн мэдээлэл оруулаагүй байна." />
                </article>
                <article className="panel stackSm">
                  <strong>Нэмэлт тайлбар</strong>
                  <p>{form.note || "-"}</p>
                </article>
              </div>
            ) : null}

            {message ? <p className="inlineMessage error">{message}</p> : null}

            <div className="rowActions spread wizardNavActions">
              <div className="rowActions wrapActions">
                {step > 1 ? (
                  <button className="btn secondary" type="button" onClick={() => goToStep(step - 1)}>
                    Буцах
                  </button>
                ) : null}
                <Link className="btn secondary" href="/travel-guide">
                  Гарын авлага
                </Link>
              </div>
              <div className="rowActions wrapActions">
                {step < TOTAL_STEPS ? (
                  <button className="btn primary" type="button" onClick={onNext}>
                    Дараагийн алхам
                  </button>
                ) : (
                  <button className="btn primary" type="button" onClick={() => void onSubmit()} disabled={submitting}>
                    {submitting ? "Хүсэлт илгээж байна..." : "Хүсэлт илгээх"}
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