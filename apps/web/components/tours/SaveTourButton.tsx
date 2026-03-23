"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";

export function SaveTourButton({ slug }: { slug: string }) {
  const router = useRouter();
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
      const nextMessage = error instanceof ApiError ? error.message : "Хадгалах үйлдэл амжилтгүй боллоо.";
      setMessage(nextMessage);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="saveAction">
      <button className={`saveButton${saved ? " active" : ""}`} type="button" onClick={onClick} disabled={pending}>
        {pending ? "..." : saved ? "Хадгалсан" : "Хадгалах"}
      </button>
      {message ? <p className="inlineMessage error">{message}</p> : null}
    </div>
  );
}