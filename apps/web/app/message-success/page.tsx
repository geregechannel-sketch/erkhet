import Link from "next/link";
import { getRequestLocale } from "@/lib/request-locale";
import { getSupportAutoReply, parseSupportType } from "@/lib/support-copy";

const copyByLocale = {
  mn: {
    eyebrow: "Амжилттай",
    title: "Таны хүсэлт амжилттай бүртгэгдлээ",
    body: "Таны илгээсэн мэдээлэл бидэнд амжилттай хүрлээ. Манай баг удахгүй эргэн холбогдоно.",
    autoReplyTitle: "Автомат хариу",
    referenceLabel: "Лавлагааны дугаар",
    account: "Миний хэсэг",
    tours: "Аяллууд үзэх",
  },
  en: {
    eyebrow: "Success",
    title: "Your request has been received",
    body: "Your information has been sent successfully. Our team will contact you soon.",
    autoReplyTitle: "Automatic reply",
    referenceLabel: "Reference",
    account: "My account",
    tours: "Browse tours",
  },
  ru: {
    eyebrow: "Успешно",
    title: "Ваш запрос успешно получен",
    body: "Мы успешно получили вашу информацию. Наша команда свяжется с вами в ближайшее время.",
    autoReplyTitle: "Автоответ",
    referenceLabel: "Номер обращения",
    account: "Мой кабинет",
    tours: "Смотреть туры",
  },
  zh: {
    eyebrow: "提交成功",
    title: "您的请求已成功发送",
    body: "我们已成功收到您的信息，团队会尽快与您联系。",
    autoReplyTitle: "自动回复",
    referenceLabel: "请求编号",
    account: "我的账户",
    tours: "查看线路",
  },
} as const;

export default async function MessageSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getRequestLocale();
  const copy = copyByLocale[locale];
  const params = await searchParams;
  const supportType = parseSupportType(params.type);
  const reference = typeof params.reference === "string" ? params.reference.trim() : "";
  const autoReply = supportType ? getSupportAutoReply(locale, supportType) : null;

  return (
    <main>
      <section className="pageHero">
        <div className="container stackMd">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          {autoReply ? (
            <article className="panel stackSm">
              <p className="eyebrow">{copy.autoReplyTitle}</p>
              {reference ? (
                <p className="meta">
                  <strong>{copy.referenceLabel}:</strong> {reference}
                </p>
              ) : null}
              <p>{autoReply}</p>
            </article>
          ) : null}
          <div className="rowActions">
            <Link className="btn primary" href="/account">
              {copy.account}
            </Link>
            <Link className="btn secondary" href="/tours">
              {copy.tours}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
