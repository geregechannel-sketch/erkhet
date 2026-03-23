"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";

const copyByLocale = {
  mn: {
    eyebrow: "Бүртгүүлэх",
    title: "Шинэ бүртгэл үүсгэх",
    body: "Нэг бүртгэлээр хадгалсан аялал, захиалга, төлбөр, үйлчилгээний хүсэлт, дэмжлэгийн түүхээ удирдана.",
    fullName: "Овог нэр",
    email: "И-мэйл",
    phone: "Утас",
    password: "Нууц үг (8+ тэмдэгт)",
    confirm: "Нууц үг давтах",
    submit: "Бүртгүүлэх",
    submitting: "Бүртгэж байна...",
    mismatch: "Нууц үг болон давтан оруулсан нууц үг таарахгүй байна.",
    error: "Бүртгэл үүсгэхэд алдаа гарлаа.",
    haveAccount: "Бүртгэлтэй юу?",
    login: "Нэвтрэх",
  },
  en: {
    eyebrow: "Register",
    title: "Create an account",
    body: "Manage saved tours, bookings, payments, service requests, and support history with one account.",
    fullName: "Full name",
    email: "Email",
    phone: "Phone",
    password: "Password (8+ characters)",
    confirm: "Confirm password",
    submit: "Register",
    submitting: "Creating account...",
    mismatch: "Password and confirmation do not match.",
    error: "Failed to create account.",
    haveAccount: "Already have an account?",
    login: "Sign in",
  },
  ru: {
    eyebrow: "Регистрация",
    title: "Создать учетную запись",
    body: "Управляйте сохраненными турами, бронированиями, платежами и поддержкой через один аккаунт.",
    fullName: "Полное имя",
    email: "Email",
    phone: "Телефон",
    password: "Пароль (8+ символов)",
    confirm: "Повторите пароль",
    submit: "Регистрация",
    submitting: "Создаем аккаунт...",
    mismatch: "Пароль и подтверждение не совпадают.",
    error: "Не удалось создать аккаунт.",
    haveAccount: "Уже есть аккаунт?",
    login: "Войти",
  },
  zh: {
    eyebrow: "注册",
    title: "创建账户",
    body: "使用一个账户即可管理收藏线路、预订、支付、服务请求和支持记录。",
    fullName: "姓名",
    email: "邮箱",
    phone: "电话",
    password: "密码（至少 8 位）",
    confirm: "确认密码",
    submit: "注册",
    submitting: "正在创建账户...",
    mismatch: "密码和确认密码不一致。",
    error: "创建账户失败。",
    haveAccount: "已有账户？",
    login: "登录",
  },
} as const;

export default function RegisterPage() {
  const router = useRouter();
  const { user, register } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [redirect, setRedirect] = useState("/account");

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
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    if (password !== confirmPassword) {
      setMessage(copy.mismatch);
      return;
    }

    setState("submitting");
    setMessage(null);

    try {
      await register({
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        password,
      });
      router.replace(redirect);
    } catch (error) {
      setState("error");
      setMessage(error instanceof ApiError ? error.message : copy.error);
    } finally {
      setState("idle");
    }
  };

  return (
    <main className="authPage">
      <div className="container authWrap">
        <article className="card authCard authWideCard">
          <div className="content stackMd">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="meta">{copy.body}</p>
            <form className="formGrid" onSubmit={onSubmit}>
              <input name="fullName" placeholder={copy.fullName} required />
              <input name="email" type="email" placeholder={copy.email} required />
              <input name="phone" placeholder={copy.phone} />
              <input name="password" type="password" minLength={8} placeholder={copy.password} required />
              <input className="full" name="confirmPassword" type="password" minLength={8} placeholder={copy.confirm} required />
              <button className="btn primary" type="submit" disabled={state === "submitting"}>
                {state === "submitting" ? copy.submitting : copy.submit}
              </button>
            </form>
            {message ? <p className="inlineMessage error">{message}</p> : null}
            <p className="meta">
              {copy.haveAccount} <Link href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}>{copy.login}</Link>
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
