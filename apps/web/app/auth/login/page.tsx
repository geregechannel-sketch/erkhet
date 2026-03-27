"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, browserApiFetch } from "@/lib/api";
import { repairDeep } from "@/lib/text";
import type { PasswordResetResponse } from "@/lib/types";

type DemoAccount = {
  identifier: string;
  password: string;
  label: string;
  description: string;
  redirect: string;
};

const rawDemoAccountsByLocale = {
  mn: [
    {
      identifier: "user2",
      password: "ErkhetUser2!2026",
      label: "user2",
      description: "Бүртгэлтэй хэрэглэгчийн хэсэг, хадгалсан аялал, захиалга, төлбөрийн туршилтын эрх.",
      redirect: "/account",
    },
    {
      identifier: "user3",
      password: "ErkhetAdmin3!2026",
      label: "user3",
      description: "Админ самбар, хэрэглэгч, захиалга, төлбөрийн удирдлагыг шалгах туршилтын эрх.",
      redirect: "/admin",
    },
  ],
  en: [
    {
      identifier: "user2",
      password: "ErkhetUser2!2026",
      label: "user2",
      description: "Registered customer access with saved tours, bookings, and payments.",
      redirect: "/account",
    },
    {
      identifier: "user3",
      password: "ErkhetAdmin3!2026",
      label: "user3",
      description: "Admin access for users, bookings, payments, and support workflows.",
      redirect: "/admin",
    },
  ],
  ru: [
    {
      identifier: "user2",
      password: "ErkhetUser2!2026",
      label: "user2",
      description: "Доступ зарегистрированного клиента с сохраненными турами, бронированиями и платежами.",
      redirect: "/account",
    },
    {
      identifier: "user3",
      password: "ErkhetAdmin3!2026",
      label: "user3",
      description: "Доступ администратора для пользователей, бронирований, платежей и поддержки.",
      redirect: "/admin",
    },
  ],
  zh: [
    {
      identifier: "user2",
      password: "ErkhetUser2!2026",
      label: "user2",
      description: "注册用户演示账号，可查看收藏线路、预订和支付。",
      redirect: "/account",
    },
    {
      identifier: "user3",
      password: "ErkhetAdmin3!2026",
      label: "user3",
      description: "管理员演示账号，可管理用户、预订、支付和支持请求。",
      redirect: "/admin",
    },
  ],
} as const;

const demoAccountsByLocale = repairDeep(rawDemoAccountsByLocale) as typeof rawDemoAccountsByLocale;

const rawCopyByLocale = {
  mn: {
    eyebrow: "Нэвтрэх",
    title: "Хэрэглэгчийн эрхээр нэвтрэх",
    body: "Хадгалсан аялал, захиалга, төлбөр, дэмжлэгийн хүсэлтээ нэг дороос хянахын тулд нэвтэрнэ үү.",
    demoEyebrow: "Туршилтын хандалт",
    demoTitle: "Туршилтын эрхүүд",
    demoBody: "Нийтийн сайтад нууц үгийг шууд харуулахгүй. Хөгжүүлэлтийн орчинд доорх туршилтын эрхүүдийг ашиглаж болно.",
    identifierPlaceholder: "И-мэйл эсвэл хэрэглэгчийн нэр",
    passwordPlaceholder: "Нууц үг",
    submitting: "Нэвтэрч байна...",
    submit: "Нэвтрэх",
    forgot: "Нууц үг мартсан уу?",
    forgotEyebrow: "Сэргээх",
    forgotTitle: "Нууц үг сэргээх",
    forgotBody: "И-мэйл хаягаа оруулснаар нууц үг сэргээх холбоос үүсгэнэ.",
    forgotButton: "Сэргээх цонх нээх",
    forgotSubmitting: "Илгээж байна...",
    forgotSubmit: "Сэргээх холбоос үүсгэх",
    forgotPlaceholder: "Бүртгэлтэй и-мэйл",
    forgotSuccess: "Хэрэв энэ и-мэйл бүртгэлтэй бол сэргээх холбоос илгээхэд бэлэн боллоо.",
    forgotError: "Нууц үг сэргээх хүсэлт илгээхэд алдаа гарлаа.",
    previewTitle: "Local preview холбоос",
    loginError: "Нэвтрэхэд алдаа гарлаа.",
    newUser: "Шинэ хэрэглэгч үү?",
    register: "Бүртгүүлэх",
  },
  en: {
    eyebrow: "Sign In",
    title: "Sign in to your account",
    body: "Sign in to track saved tours, bookings, payments, and support requests in one place.",
    demoEyebrow: "Demo access",
    demoTitle: "Demo accounts",
    demoBody: "For security, demo passwords are hidden on the public site. Use these shortcuts only in development.",
    identifierPlaceholder: "Email or username",
    passwordPlaceholder: "Password",
    submitting: "Signing in...",
    submit: "Sign In",
    forgot: "Forgot password?",
    forgotEyebrow: "Recovery",
    forgotTitle: "Reset password",
    forgotBody: "Enter your email address to generate a secure password reset link.",
    forgotButton: "Open recovery form",
    forgotSubmitting: "Sending...",
    forgotSubmit: "Create reset link",
    forgotPlaceholder: "Registered email",
    forgotSuccess: "If the email exists, a reset link is ready.",
    forgotError: "Failed to create reset request.",
    previewTitle: "Local preview link",
    loginError: "Sign in failed.",
    newUser: "New user?",
    register: "Register",
  },
  ru: {
    eyebrow: "Войти",
    title: "Вход в учетную запись",
    body: "Войдите, чтобы отслеживать сохраненные туры, бронирования, платежи и запросы в поддержку в одном месте.",
    demoEyebrow: "Демо-доступ",
    demoTitle: "Демо-аккаунты",
    demoBody: "Из соображений безопасности демо-пароли скрыты на публичном сайте. Используйте их только в среде разработки.",
    identifierPlaceholder: "Email или имя пользователя",
    passwordPlaceholder: "Пароль",
    submitting: "Выполняется вход...",
    submit: "Войти",
    forgot: "Забыли пароль?",
    forgotEyebrow: "Восстановление",
    forgotTitle: "Сброс пароля",
    forgotBody: "Введите email, чтобы создать безопасную ссылку для сброса пароля.",
    forgotButton: "Открыть форму восстановления",
    forgotSubmitting: "Отправка...",
    forgotSubmit: "Создать ссылку",
    forgotPlaceholder: "Зарегистрированный email",
    forgotSuccess: "Если email существует, ссылка для сброса уже готова.",
    forgotError: "Не удалось создать запрос на сброс пароля.",
    previewTitle: "Локальная ссылка",
    loginError: "Не удалось войти.",
    newUser: "Новый пользователь?",
    register: "Регистрация",
  },
  zh: {
    eyebrow: "登录",
    title: "登录您的账户",
    body: "登录后即可在一个地方查看收藏线路、预订、支付和支持请求。",
    demoEyebrow: "演示入口",
    demoTitle: "演示账号",
    demoBody: "出于安全原因，公开网站不会直接显示演示密码，仅在开发环境中可用。",
    identifierPlaceholder: "邮箱或用户名",
    passwordPlaceholder: "密码",
    submitting: "正在登录...",
    submit: "登录",
    forgot: "忘记密码？",
    forgotEyebrow: "恢复",
    forgotTitle: "重置密码",
    forgotBody: "输入邮箱地址以生成安全的密码重置链接。",
    forgotButton: "打开恢复表单",
    forgotSubmitting: "发送中...",
    forgotSubmit: "生成重置链接",
    forgotPlaceholder: "已注册邮箱",
    forgotSuccess: "如果邮箱存在，系统已准备好重置链接。",
    forgotError: "创建重置请求失败。",
    previewTitle: "本地预览链接",
    loginError: "登录失败。",
    newUser: "新用户？",
    register: "注册",
  },
} as const;

const copyByLocale = repairDeep(rawCopyByLocale) as typeof rawCopyByLocale;

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const demoAccounts = useMemo(() => demoAccountsByLocale[locale], [locale]);
  const showDemoAccess = process.env.NODE_ENV !== "production";
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [forgotState, setForgotState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);
  const [redirect, setRedirect] = useState("/account");
  const [showForgot, setShowForgot] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get("redirect") || "/account");
  }, []);

  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [redirect, router, user]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("submitting");
    setMessage(null);

    try {
      await login({
        email: identifier,
        password,
      });
      router.replace(redirect);
    } catch (error) {
      setState("error");
      setMessage(error instanceof ApiError ? error.message : copy.loginError);
    } finally {
      setState("idle");
    }
  };

  const onForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setForgotState("submitting");
    setForgotMessage(null);
    setPreviewLink(null);

    try {
      const response = await browserApiFetch<PasswordResetResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: String(formData.get("email") || ""),
        }),
      });
      setForgotState("success");
      setForgotMessage(copy.forgotSuccess);
      setPreviewLink(response.previewResetLink || null);
    } catch (error) {
      setForgotState("error");
      setForgotMessage(error instanceof ApiError ? error.message : copy.forgotError);
    }
  };

  const useDemoAccount = (account: DemoAccount) => {
    setIdentifier(account.identifier);
    setPassword(account.password);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("redirect")) {
        setRedirect(account.redirect);
      }
    }
    setMessage(null);
  };

  return (
    <main className="authPage">
      <div className="container authWrap authSplitWrap">
        <article className="card authCard authWideCard">
          <div className="content stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="meta">{copy.body}</p>

            {showDemoAccess ? (
              <div className="demoAccessCard softAccentCard stackMd">
                <div>
                  <p className="eyebrow">{copy.demoEyebrow}</p>
                  <h2>{copy.demoTitle}</h2>
                  <p className="meta">{copy.demoBody}</p>
                </div>
                <div className="demoAccessGrid">
                  {demoAccounts.map((account) => (
                    <button key={account.identifier} type="button" className="demoAccessItem" onClick={() => useDemoAccount(account)}>
                      <strong>{account.label}</strong>
                      <span>{account.description}</span>
                      <small>{account.password}</small>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <form className="stackMd" onSubmit={onSubmit}>
              <input
                name="email"
                type="text"
                placeholder={copy.identifierPlaceholder}
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
              <input
                name="password"
                type="password"
                placeholder={copy.passwordPlaceholder}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button className="btn primary" type="submit" disabled={state === "submitting"}>
                {state === "submitting" ? copy.submitting : copy.submit}
              </button>
            </form>
            {message ? <p className="inlineMessage error">{message}</p> : null}
            <div className="authHelperLinks">
              <button className="linkButton" type="button" onClick={() => setShowForgot((current) => !current)}>
                {copy.forgot}
              </button>
              <p className="meta">
                {copy.newUser} <Link href={`/auth/register?redirect=${encodeURIComponent(redirect)}`}>{copy.register}</Link>
              </p>
            </div>
          </div>
        </article>

        <article className="card authCard authSecondaryCard">
          <div className="content stackMd">
            <p className="eyebrow">{copy.forgotEyebrow}</p>
            <h2>{copy.forgotTitle}</h2>
            <p className="meta">{copy.forgotBody}</p>

            {showForgot ? (
              <form className="stackMd" onSubmit={onForgotSubmit}>
                <input name="email" type="email" placeholder={copy.forgotPlaceholder} required />
                <button className="btn secondary" type="submit" disabled={forgotState === "submitting"}>
                  {forgotState === "submitting" ? copy.forgotSubmitting : copy.forgotSubmit}
                </button>
              </form>
            ) : (
              <button className="btn secondary" type="button" onClick={() => setShowForgot(true)}>
                {copy.forgotButton}
              </button>
            )}

            {forgotMessage ? <p className={`inlineMessage ${forgotState === "error" ? "error" : "success"}`}>{forgotMessage}</p> : null}

            {previewLink ? (
              <div className="resetPreviewCard">
                <strong>{copy.previewTitle}</strong>
                <a href={previewLink}>{previewLink}</a>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}
