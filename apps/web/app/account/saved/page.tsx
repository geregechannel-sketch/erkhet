"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TourCard } from "@/components/tours/TourCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import type { Tour } from "@/lib/types";

const copyByLocale = {
  mn: {
    title: "Хадгалсан аяллууд",
    empty: "Одоогоор хадгалсан аялал алга.",
    signIn: "Хадгалсан аяллаа харахын тулд эхлээд нэвтэрнэ үү.",
    login: "Нэвтрэх",
  },
  en: {
    title: "Saved Tours",
    empty: "No saved tours yet.",
    signIn: "Sign in to see the tours you have saved.",
    login: "Sign in",
  },
  ru: {
    title: "Сохраненные туры",
    empty: "Пока нет сохраненных туров.",
    signIn: "Войдите, чтобы увидеть сохраненные туры.",
    login: "Войти",
  },
  zh: {
    title: "已收藏线路",
    empty: "目前还没有收藏的线路。",
    signIn: "请先登录以查看您收藏的线路。",
    login: "登录",
  },
} as const;

export default function SavedToursPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    if (!token) {
      setTours([]);
      return;
    }

    void browserApiFetch<Tour[]>("/me/favorites", {
      headers: authHeaders(token),
    }).then(setTours);
  }, [token]);

  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <h1>{copy.title}</h1>
      </div>

      {!token ? (
        <article className="panel emptyState stackSm">
          <p>{copy.signIn}</p>
          <div>
            <Link className="btn primary" href="/auth/login?redirect=/account/saved">
              {copy.login}
            </Link>
          </div>
        </article>
      ) : tours.length === 0 ? (
        <article className="panel emptyState">{copy.empty}</article>
      ) : (
        <div className="grid c2">
          {tours.map((tour) => (
            <TourCard key={tour.slug} tour={tour} locale={locale} />
          ))}
        </div>
      )}
    </section>
  );
}
