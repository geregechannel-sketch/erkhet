"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { ApiError, browserApiFetch } from "@/lib/api";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setState("error");
      setMessage("Нууц үг болон давтан нууц үг таарахгүй байна.");
      return;
    }

    setState("submitting");
    setMessage(null);
    try {
      await browserApiFetch<{ ok: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: params?.token,
          password
        })
      });
      setState("success");
      setMessage("Нууц үг амжилттай шинэчлэгдлээ. Одоо шинэ нууц үгээрээ нэвтэрнэ үү.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof ApiError ? error.message : "Нууц үг шинэчлэхэд алдаа гарлаа.");
    }
  };

  return (
    <main className="authPage">
      <div className="container authWrap">
        <article className="card authCard authWideCard">
          <div className="content stackMd">
            <p className="eyebrow">Reset password</p>
            <h1>Шинэ нууц үг тохируулах</h1>
            <p className="meta">Энэ холбоос хугацаатай. Хэрэв хугацаа дууссан бол нэвтрэх хуудаснаас дахин сэргээх холбоос үүсгэнэ үү.</p>

            <form className="stackMd" onSubmit={onSubmit}>
              <input name="password" type="password" minLength={8} placeholder="Шинэ нууц үг" required />
              <input name="confirmPassword" type="password" minLength={8} placeholder="Шинэ нууц үг давтах" required />
              <button className="btn primary" type="submit" disabled={state === "submitting"}>
                {state === "submitting" ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
              </button>
            </form>

            {message ? <p className={`inlineMessage ${state === "success" ? "success" : "error"}`}>{message}</p> : null}
            <Link href="/auth/login">Нэвтрэх хуудас руу буцах</Link>
          </div>
        </article>
      </div>
    </main>
  );
}