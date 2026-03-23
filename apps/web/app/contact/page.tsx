"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { siteData } from "@/lib/siteData";

const copyByLocale = {
  mn: {
    eyebrow: "Contact & Support",
    title: "Холбоо барих / Дэмжлэг",
    body: "Public contact form нь хэрэглэгчийн account болон admin support history-тэй шууд холбогддог. Иймээс таны хүсэлт замдаа алдагдахгүй, статус нь дотоод систем дээр хянагдана.",
    flowEyebrow: "Response flow",
    flowTitle: "Хүсэлтийн дараах дараалал",
    flowItems: ["Support reference үүснэ", "Admin талд шинэ хүсэлтээр орж ирнэ", "Төлөв, тэмдэглэл, шийдвэрлэлтийг шат дараатай хөтөлнө"],
    formTitle: "Хүсэлт илгээх",
    typeSupport: "Дэмжлэгийн хүсэлт",
    typeFeedback: "Санал хүсэлт",
    typeComplaint: "Гомдол",
    subject: "Гарчиг",
    name: "Нэр",
    email: "И-мэйл",
    phone: "Утас",
    message: "Тайлбар",
    submitting: "Илгээж байна...",
    submit: "Илгээх",
    success: "Таны хүсэлт амжилттай илгээгдлээ. Систем автоматаар хариу үүсгэж, admin support history дээр бүртгэлээ.",
    error: "Хүсэлт илгээхэд алдаа гарлаа.",
    contactTitle: "Албан ёсны холбоо барих мэдээлэл",
    qrTitle: "QR холбоос",
  },
  en: {
    eyebrow: "Contact & Support",
    title: "Contact / Support",
    body: "The public contact form is linked directly to the customer account and admin support history so requests stay traceable.",
    flowEyebrow: "Response flow",
    flowTitle: "What happens after submission",
    flowItems: ["A support reference is created", "The request appears in admin support history", "Status and notes are updated through the workflow"],
    formTitle: "Send a request",
    typeSupport: "Support request",
    typeFeedback: "Feedback",
    typeComplaint: "Complaint",
    subject: "Subject",
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    submitting: "Sending...",
    submit: "Send",
    success: "Your request has been submitted. The system also created an automatic support reply.",
    error: "Failed to send request.",
    contactTitle: "Official contact details",
    qrTitle: "QR links",
  },
  ru: {
    eyebrow: "Contact & Support",
    title: "Связь / Поддержка",
    body: "Публичная contact form напрямую связана с кабинетом клиента и admin support history, поэтому запросы не теряются.",
    flowEyebrow: "Response flow",
    flowTitle: "Что происходит после отправки",
    flowItems: ["Создается support reference", "Запрос появляется в admin support history", "Статус и заметки обновляются по workflow"],
    formTitle: "Отправить запрос",
    typeSupport: "Support request",
    typeFeedback: "Feedback",
    typeComplaint: "Complaint",
    subject: "Тема",
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    message: "Сообщение",
    submitting: "Отправка...",
    submit: "Отправить",
    success: "Запрос отправлен. Система также создала автоматический ответ в истории поддержки.",
    error: "Не удалось отправить запрос.",
    contactTitle: "Официальные контакты",
    qrTitle: "QR ссылки",
  },
  zh: {
    eyebrow: "Contact & Support",
    title: "联系 / 支持",
    body: "公开 contact form 会直接关联用户账户与 admin support history，因此请求不会丢失。",
    flowEyebrow: "Response flow",
    flowTitle: "提交后的流程",
    flowItems: ["生成 support reference", "请求进入 admin support history", "系统按 workflow 更新状态与备注"],
    formTitle: "提交请求",
    typeSupport: "Support request",
    typeFeedback: "Feedback",
    typeComplaint: "Complaint",
    subject: "主题",
    name: "姓名",
    email: "邮箱",
    phone: "电话",
    message: "说明",
    submitting: "发送中...",
    submit: "发送",
    success: "请求已提交，系统同时生成了自动支持回复。",
    error: "发送请求失败。",
    contactTitle: "官方联系方式",
    qrTitle: "QR 链接",
  },
} as const;

export default function ContactPage() {
  const { user, token } = useAuth();
  const { locale } = useLocale();
  const copy = useMemo(() => copyByLocale[locale], [locale]);
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setState("submitting");
    setMessage(null);

    try {
      await browserApiFetch("/support-requests", {
        method: "POST",
        headers: token ? authHeaders(token) : undefined,
        body: JSON.stringify({
          type: formData.get("type"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          customerName: formData.get("customerName"),
          customerEmail: formData.get("customerEmail"),
          customerPhone: formData.get("customerPhone"),
        }),
      });
      form.reset();
      setState("success");
      setMessage(copy.success);
    } catch (error) {
      setState("error");
      setMessage(error instanceof ApiError ? error.message : copy.error);
    }
  };

  return (
    <main>
      <section className="pageHero bookingCenterHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
          </div>

          <article className="guideSpotlight card">
            <img className="cover" src={siteData.destinations[3]?.image} alt="Support" />
            <div className="content stackSm">
              <p className="eyebrow">{copy.flowEyebrow}</p>
              <h3>{copy.flowTitle}</h3>
              <ul className="guideActionList">
                {copy.flowItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container detailLayout">
          <article className="card">
            <div className="content stackMd">
              <h3>{copy.formTitle}</h3>
              <form className="formGrid" onSubmit={onSubmit}>
                <select name="type" defaultValue="support" required>
                  <option value="support">{copy.typeSupport}</option>
                  <option value="feedback">{copy.typeFeedback}</option>
                  <option value="complaint">{copy.typeComplaint}</option>
                </select>
                <input name="subject" placeholder={copy.subject} required />
                <input name="customerName" placeholder={copy.name} defaultValue={user?.fullName || ""} required={!user} />
                <input name="customerEmail" type="email" placeholder={copy.email} defaultValue={user?.email || ""} />
                <input name="customerPhone" placeholder={copy.phone} defaultValue={user?.phone || ""} />
                <textarea className="full" name="message" placeholder={copy.message} required />
                <button className="btn primary full" type="submit" disabled={state === "submitting"}>
                  {state === "submitting" ? copy.submitting : copy.submit}
                </button>
              </form>
              {message ? <p className={`inlineMessage ${state === "error" ? "error" : "success"}`}>{message}</p> : null}
            </div>
          </article>

          <div className="stackMd">
            <article className="card policyCard">
              <div className="content stackSm">
                <h3>{copy.contactTitle}</h3>
                <p><strong>{copy.phone}:</strong> <a href={`tel:${siteData.company.phone}`}>{siteData.company.phone}</a></p>
                <p><strong>{copy.email}:</strong> <a href={`mailto:${siteData.company.email}`}>{siteData.company.email}</a></p>
                <p><strong>Facebook:</strong> <a href={siteData.contacts.facebook} target="_blank" rel="noreferrer">{siteData.contacts.facebook}</a></p>
              </div>
            </article>
            <article className="card policyCard">
              <div className="content stackSm">
                <h3>{copy.qrTitle}</h3>
                <div className="qrGrid">
                  <figure>
                    <img src={siteData.contacts.telegramQr} alt="Telegram QR" />
                    <figcaption>Telegram</figcaption>
                  </figure>
                  <figure>
                    <img src={siteData.contacts.wechatQr} alt="WeChat QR" />
                    <figcaption>WeChat</figcaption>
                  </figure>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
