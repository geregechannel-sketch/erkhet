"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { siteData } from "@/lib/siteData";

const copyByLocale = {
  mn: {
    eyebrow: "Холбоо барих",
    title: "Холбоо барих",
    body: "Та бүхэн бидэнтэй бүх сувгаар дамжуулан холбогдох боломжтой. Бид тантай эргэн хурдан хугацаанд холбогдох болно",
    flowEyebrow: "Хурдан холбоо",
    flowTitle: "Бидэнтэй холбогдох сувгууд",
    flowItems: ["Утас болон и-мэйлээр шууд холбогдоно.", "Facebook хуудсаар мессеж үлдээнэ.", "Вичат QR ашиглан шууд холбогдоно."],
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
    success: "Таны хүсэлт амжилттай илгээгдлээ. Бид тантай аль болох хурдан эргэн холбогдоно.",
    error: "Хүсэлт илгээхэд алдаа гарлаа.",
    contactTitle: "Албан ёсны холбоо барих мэдээлэл",
    qrTitle: "Вичат холбоос",
  },
  en: {
    eyebrow: "Contact",
    title: "Contact",
    body: "You can reach us through all available channels. We will get back to you as soon as possible.",
    flowEyebrow: "Quick contact",
    flowTitle: "Ways to reach us",
    flowItems: ["Call or email us directly.", "Leave a message on Facebook.", "Scan the WeChat QR to connect instantly."],
    formTitle: "Send a request",
    typeSupport: "Support",
    typeFeedback: "Feedback",
    typeComplaint: "Complaint",
    subject: "Subject",
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    submitting: "Sending...",
    submit: "Send",
    success: "Your request has been submitted. We will contact you as soon as possible.",
    error: "Failed to send request.",
    contactTitle: "Official contact details",
    qrTitle: "WeChat QR",
  },
  ru: {
    eyebrow: "Контакты",
    title: "Связаться с нами",
    body: "Вы можете связаться с нами по всем доступным каналам. Мы постараемся ответить как можно быстрее.",
    flowEyebrow: "Быстрая связь",
    flowTitle: "Как с нами связаться",
    flowItems: ["Позвоните или напишите на email.", "Оставьте сообщение на Facebook.", "Подключитесь через QR-код WeChat."],
    formTitle: "Отправить запрос",
    typeSupport: "Поддержка",
    typeFeedback: "Отзыв",
    typeComplaint: "Жалоба",
    subject: "Тема",
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    message: "Сообщение",
    submitting: "Отправка...",
    submit: "Отправить",
    success: "Запрос отправлен. Мы свяжемся с вами как можно скорее.",
    error: "Не удалось отправить запрос.",
    contactTitle: "Официальные контакты",
    qrTitle: "WeChat QR",
  },
  zh: {
    eyebrow: "联系",
    title: "联系我们",
    body: "您可以通过所有公开渠道与我们联系，我们会尽快回复您。",
    flowEyebrow: "快速联系",
    flowTitle: "联系方式",
    flowItems: ["可直接电话或邮件联系。", "可在 Facebook 留言。", "可扫描 WeChat 二维码快速沟通。"],
    formTitle: "提交请求",
    typeSupport: "咨询支持",
    typeFeedback: "意见反馈",
    typeComplaint: "投诉",
    subject: "主题",
    name: "姓名",
    email: "邮箱",
    phone: "电话",
    message: "说明",
    submitting: "发送中...",
    submit: "发送",
    success: "请求已提交，我们会尽快与您联系。",
    error: "发送请求失败。",
    contactTitle: "官方联系方式",
    qrTitle: "微信二维码",
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
                    <img src={siteData.contacts.wechatQr} alt="WeChat QR" />
                    <figcaption>
                      {locale === "mn" ? "Вичат" : locale === "ru" ? "Вичат" : locale === "zh" ? "微信" : "WeChat"}
                    </figcaption>
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
