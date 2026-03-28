"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import { formatUserRole, formatUserStatus } from "@/lib/format";
import type { User } from "@/lib/types";

const copyByLocale = {
  mn: {
    title: "Хэрэглэгчид",
    updated: "Хэрэглэгч шинэчлэгдлээ.",
    updateFailed: "Хэрэглэгч шинэчлэхэд алдаа гарлаа.",
  },
  en: {
    title: "Users",
    updated: "User updated.",
    updateFailed: "Failed to update user.",
  },
  ru: {
    title: "Пользователи",
    updated: "Пользователь обновлён.",
    updateFailed: "Не удалось обновить пользователя.",
  },
  zh: {
    title: "用户列表",
    updated: "用户已更新。",
    updateFailed: "更新用户失败。",
  },
} as const;

type MessageTone = "success" | "error";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("success");

  const loadUsers = async () => {
    if (!token) return;
    const nextUsers = await browserApiFetch<User[]>("/admin/users", {
      headers: authHeaders(token),
    });
    setUsers(nextUsers);
  };

  useEffect(() => {
    void loadUsers();
  }, [token]);

  const updateUser = async (id: number, role: string, status: string) => {
    if (!token) return;
    try {
      await browserApiFetch(`/admin/users/${id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ role, status }),
      });
      setMessageTone("success");
      setMessage(copy.updated);
      await loadUsers();
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : copy.updateFailed);
    }
  };

  return (
    <div className="stackLg">
      <div className="sectionHeading compact"><h1>{copy.title}</h1></div>
      {message ? <p className={`inlineMessage ${messageTone}`}>{message}</p> : null}
      <section className="panel stackMd">
        {users.map((user) => (
          <article key={user.id} className="listRow alignStart">
            <div>
              <Link href={`/admin/users/${user.id}`}><strong>{user.fullName}</strong></Link>
              <p className="meta">{user.email}</p>
            </div>
            <div className="rowActions stretchControls">
              <select defaultValue={user.role} onChange={(event) => void updateUser(user.id, event.target.value, user.status)}>
                <option value="customer">{formatUserRole("customer", locale)}</option>
                <option value="super_admin">{formatUserRole("super_admin", locale)}</option>
                <option value="booking_manager">{formatUserRole("booking_manager", locale)}</option>
                <option value="finance">{formatUserRole("finance", locale)}</option>
                <option value="support">{formatUserRole("support", locale)}</option>
              </select>
              <select defaultValue={user.status} onChange={(event) => void updateUser(user.id, user.role, event.target.value)}>
                <option value="active">{formatUserStatus("active", locale)}</option>
                <option value="inactive">{formatUserStatus("inactive", locale)}</option>
                <option value="blocked">{formatUserStatus("blocked", locale)}</option>
              </select>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
