"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLocale } from "@/components/locale/LocaleProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import type { DashboardSummary, User } from "@/lib/types";

const copyByLocale = {
  mn: {
    eyebrow: "Хяналтын самбар",
    title: "Миний мэдээлэл",
    stats: {
      savedTours: "Хадгалсан аялал",
      pendingBookings: "Хүлээгдэж буй захиалга",
      activePayments: "Хүлээгдэж буй төлбөр",
      openSupport: "Нээлттэй хүсэлт",
    },
    profileTitle: "Профайлын мэдээлэл",
    profileBody: "Хувийн мэдээлэл болон хэлний сонголтоо шинэчилнэ.",
    togglePassword: "Нууц үг солих",
    closePassword: "Нууц үг солих хэсгийг хаах",
    fullName: "Нэр",
    phone: "Утас",
    email: "И-мэйл",
    save: "Хадгалах",
    saving: "Хадгалж байна...",
    profileSaved: "Профайл шинэчлэгдлээ.",
    profileFailed: "Профайл шинэчлэхэд алдаа гарлаа.",
    passwordTitle: "Нууц үг солих",
    passwordBody: "Одоогийн нууц үгээ баталгаажуулаад шинэ нууц үг тохируулна.",
    currentPassword: "Одоогийн нууц үг",
    newPassword: "Шинэ нууц үг",
    confirmPassword: "Шинэ нууц үгээ давтах",
    changePassword: "Нууц үг солих",
    changingPassword: "Шинэчилж байна...",
    passwordSaved: "Нууц үг амжилттай шинэчлэгдлээ.",
    passwordFailed: "Нууц үг шинэчлэхэд алдаа гарлаа.",
    passwordRequired: "Одоогийн болон шинэ нууц үгээ оруулна уу.",
    passwordTooShort: "Шинэ нууц үг хамгийн багадаа 8 тэмдэгттэй байна.",
    passwordMismatch: "Шинэ нууц үг давтан оруулсантай таарахгүй байна.",
  },
  en: {
    eyebrow: "Dashboard",
    title: "My profile",
    stats: {
      savedTours: "Saved tours",
      pendingBookings: "Pending bookings",
      activePayments: "Pending payments",
      openSupport: "Open requests",
    },
    profileTitle: "Profile details",
    profileBody: "Update your personal information and language preference.",
    togglePassword: "Change password",
    closePassword: "Hide password form",
    fullName: "Full name",
    phone: "Phone",
    email: "Email",
    save: "Save",
    saving: "Saving...",
    profileSaved: "Profile updated successfully.",
    profileFailed: "Failed to update profile.",
    passwordTitle: "Change password",
    passwordBody: "Confirm your current password and set a new one.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    changePassword: "Update password",
    changingPassword: "Updating...",
    passwordSaved: "Password updated successfully.",
    passwordFailed: "Failed to update password.",
    passwordRequired: "Please enter your current and new password.",
    passwordTooShort: "Your new password must be at least 8 characters long.",
    passwordMismatch: "The new password and confirmation do not match.",
  },
  ru: {
    eyebrow: "Панель управления",
    title: "Мой профиль",
    stats: {
      savedTours: "Сохранённые туры",
      pendingBookings: "Ожидающие бронирования",
      activePayments: "Ожидающие платежи",
      openSupport: "Открытые обращения",
    },
    profileTitle: "Данные профиля",
    profileBody: "Обновите личные данные и предпочитаемый язык.",
    togglePassword: "Сменить пароль",
    closePassword: "Скрыть форму смены пароля",
    fullName: "Имя",
    phone: "Телефон",
    email: "Email",
    save: "Сохранить",
    saving: "Сохраняем...",
    profileSaved: "Профиль успешно обновлён.",
    profileFailed: "Не удалось обновить профиль.",
    passwordTitle: "Смена пароля",
    passwordBody: "Подтвердите текущий пароль и задайте новый.",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    confirmPassword: "Повторите новый пароль",
    changePassword: "Изменить пароль",
    changingPassword: "Обновляем...",
    passwordSaved: "Пароль успешно обновлён.",
    passwordFailed: "Не удалось обновить пароль.",
    passwordRequired: "Введите текущий и новый пароль.",
    passwordTooShort: "Новый пароль должен содержать не менее 8 символов.",
    passwordMismatch: "Новый пароль и подтверждение не совпадают.",
  },
  zh: {
    eyebrow: "账户总览",
    title: "我的资料",
    stats: {
      savedTours: "收藏线路",
      pendingBookings: "待处理预订",
      activePayments: "待处理支付",
      openSupport: "未关闭请求",
    },
    profileTitle: "个人资料",
    profileBody: "更新您的个人信息和语言偏好。",
    togglePassword: "修改密码",
    closePassword: "收起密码表单",
    fullName: "姓名",
    phone: "电话",
    email: "邮箱",
    save: "保存",
    saving: "保存中...",
    profileSaved: "个人资料已更新。",
    profileFailed: "更新个人资料失败。",
    passwordTitle: "修改密码",
    passwordBody: "请确认当前密码并设置新密码。",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认新密码",
    changePassword: "更新密码",
    changingPassword: "更新中...",
    passwordSaved: "密码更新成功。",
    passwordFailed: "密码更新失败。",
    passwordRequired: "请输入当前密码和新密码。",
    passwordTooShort: "新密码至少需要 8 个字符。",
    passwordMismatch: "新密码与确认密码不一致。",
  },
} as const;

type MessageTone = "success" | "error";

export default function AccountPage() {
  const { user, token, refreshUser } = useAuth();
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileMessageTone, setProfileMessageTone] = useState<MessageTone>("success");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordMessageTone, setPasswordMessageTone] = useState<MessageTone>("success");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }
    void browserApiFetch<{ user: User; summary: DashboardSummary }>("/me/dashboard", {
      headers: authHeaders(token),
    }).then((response) => setSummary(response.summary));
  }, [token]);

  const onProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setSavingProfile(true);
    setProfileMessage(null);
    const formData = new FormData(event.currentTarget);

    try {
      await browserApiFetch<User>("/me/profile", {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          preferredLanguage: formData.get("preferredLanguage"),
        }),
      });
      await refreshUser();
      setProfileMessageTone("success");
      setProfileMessage(copy.profileSaved);
    } catch (error) {
      setProfileMessageTone("error");
      setProfileMessage(error instanceof ApiError ? error.message : copy.profileFailed);
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") || "").trim();
    const newPassword = String(formData.get("newPassword") || "").trim();
    const confirmPassword = String(formData.get("confirmPassword") || "").trim();

    setPasswordMessage(null);
    setPasswordMessageTone("error");

    if (!currentPassword || !newPassword) {
      setPasswordMessage(copy.passwordRequired);
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage(copy.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage(copy.passwordMismatch);
      return;
    }

    setChangingPassword(true);
    try {
      await browserApiFetch<{ ok: boolean }>("/auth/change-password", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      form.reset();
      setShowPasswordForm(false);
      setPasswordMessageTone("success");
      setPasswordMessage(copy.passwordSaved);
    } catch (error) {
      setPasswordMessageTone("error");
      setPasswordMessage(error instanceof ApiError ? error.message : copy.passwordFailed);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="stackLg">
      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
          </div>
        </div>
        <div className="grid c4 statsGrid">
          <article className="statCard"><strong>{summary?.savedTours ?? 0}</strong><span>{copy.stats.savedTours}</span></article>
          <article className="statCard"><strong>{summary?.pendingBookings ?? 0}</strong><span>{copy.stats.pendingBookings}</span></article>
          <article className="statCard"><strong>{summary?.activePayments ?? 0}</strong><span>{copy.stats.activePayments}</span></article>
          <article className="statCard"><strong>{summary?.openSupport ?? 0}</strong><span>{copy.stats.openSupport}</span></article>
        </div>
      </section>

      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>{copy.profileTitle}</h2>
            <p className="meta">{copy.profileBody}</p>
          </div>
          <button className="btn secondary" type="button" onClick={() => setShowPasswordForm((current) => !current)}>
            {showPasswordForm ? copy.closePassword : copy.togglePassword}
          </button>
        </div>

        <form className="formGrid" onSubmit={onProfileSubmit}>
          <input name="fullName" defaultValue={user?.fullName || ""} placeholder={copy.fullName} required />
          <input name="phone" defaultValue={user?.phone || ""} placeholder={copy.phone} />
          <input className="full" value={user?.email || ""} readOnly aria-label={copy.email} />
          <select name="preferredLanguage" defaultValue={user?.preferredLanguage || "mn"}>
            <option value="mn">Монгол</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
          </select>
          <button className="btn primary" type="submit" disabled={savingProfile}>
            {savingProfile ? copy.saving : copy.save}
          </button>
        </form>
        {profileMessage ? <p className={`inlineMessage ${profileMessageTone}`}>{profileMessage}</p> : null}

        {showPasswordForm ? (
          <div className="panel stackMd" style={{ padding: 20 }}>
            <div>
              <h3>{copy.passwordTitle}</h3>
              <p className="meta">{copy.passwordBody}</p>
            </div>
            <form className="formGrid" onSubmit={onPasswordSubmit}>
              <input name="currentPassword" type="password" placeholder={copy.currentPassword} autoComplete="current-password" required />
              <input name="newPassword" type="password" placeholder={copy.newPassword} autoComplete="new-password" required />
              <input className="full" name="confirmPassword" type="password" placeholder={copy.confirmPassword} autoComplete="new-password" required />
              <button className="btn primary" type="submit" disabled={changingPassword}>
                {changingPassword ? copy.changingPassword : copy.changePassword}
              </button>
            </form>
            {passwordMessage ? <p className={`inlineMessage ${passwordMessageTone}`}>{passwordMessage}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
