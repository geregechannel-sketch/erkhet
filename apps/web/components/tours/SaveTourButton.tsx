"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError } from "@/lib/api";

const copyByLocale = {
  mn: {
    save: "Хадгалах",
    saved: "Хадгалсан",
    error: "Хадгалах үйлдэл амжилтгүй боллоо.",
  },
  en: {
    save: "Save",
    saved: "Saved",
    error: "Saving the tour failed.",
  },
  ru: {
    save: "Сохранить",
    saved: "Сохранено",
    error: "Не удалось сохранить тур.",
  },
  zh: {
    save: "收藏",
    saved: "已收藏",
    error: "收藏线路失败。",
  },
} as const;

export function SaveTourButton({ slug }: { slug: string }) {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const { user, isSaved, saveTour, unsaveTour } = useAuth();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const saved = isSaved(slug);

  const onClick = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/tours/${slug}`);
      return;
    }

    setPending(true);
    setMessage(null);
    try {
      if (saved) {
        await unsaveTour(slug);
      } else {
        await saveTour(slug);
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : copy.error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="saveAction">
      <button className={`saveButton${saved ? " active" : ""}`} type="button" onClick={onClick} disabled={pending}>
        {pending ? "..." : saved ? copy.saved : copy.save}
      </button>
      {message ? <p className="inlineMessage error">{message}</p> : null}
    </div>
  );
}
