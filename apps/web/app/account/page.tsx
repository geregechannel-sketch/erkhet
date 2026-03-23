"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import type { DashboardSummary, User } from "@/lib/types";

export default function AccountPage() {
  const { user, token, refreshUser } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState(false);
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
      setProfileMessage("Профайл шинэчлэгдлээ.");
    } catch (error) {
      setProfileMessage(error instanceof ApiError ? error.message : "Профайл шинэчлэхэд алдаа гарлаа.");
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
    setPasswordError(false);

    if (!currentPassword || !newPassword) {
      setPasswordError(true);
      setPasswordMessage("Одоогийн болон шинэ нууц үгээ оруулна уу.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(true);
      setPasswordMessage("Шинэ нууц үг хамгийн багадаа 8 тэмдэгттэй байна.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(true);
      setPasswordMessage("Шинэ нууц үг давтан оруулсантай таарахгүй байна.");
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
      setPasswordError(false);
      setPasswordMessage("Нууц үг амжилттай шинэчлэгдлээ.");
    } catch (error) {
      setPasswordError(true);
      setPasswordMessage(error instanceof ApiError ? error.message : "Нууц үг шинэчлэхэд алдаа гарлаа.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="stackLg">
      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <p className="eyebrow">Хяналтын самбар</p>
            <h1>Миний мэдээлэл</h1>
          </div>
        </div>
        <div className="grid c4 statsGrid">
          <article className="statCard"><strong>{summary?.savedTours ?? 0}</strong><span>Хадгалсан аялал</span></article>
          <article className="statCard"><strong>{summary?.pendingBookings ?? 0}</strong><span>Хүлээгдэж буй захиалга</span></article>
          <article className="statCard"><strong>{summary?.activePayments ?? 0}</strong><span>Хүлээгдэж буй төлбөр</span></article>
          <article className="statCard"><strong>{summary?.openSupport ?? 0}</strong><span>Нээлттэй хүсэлт</span></article>
        </div>
      </section>

      <section className="panel stackMd">
        <div className="sectionHeading compact">
          <div>
            <h2>Профайлын мэдээлэл</h2>
            <p className="meta">Хувийн мэдээлэл болон хэлний сонголтоо шинэчилнэ.</p>
          </div>
          <button className="btn secondary" type="button" onClick={() => setShowPasswordForm((current) => !current)}>
            {showPasswordForm ? "Нууц үг солих хэсгийг хаах" : "Нууц үг солих"}
          </button>
        </div>

        <form className="formGrid" onSubmit={onProfileSubmit}>
          <input name="fullName" defaultValue={user?.fullName || ""} placeholder="Нэр" required />
          <input name="phone" defaultValue={user?.phone || ""} placeholder="Утас" />
          <input className="full" value={user?.email || ""} readOnly aria-label="И-мэйл" />
          <select name="preferredLanguage" defaultValue={user?.preferredLanguage || "mn"}>
            <option value="mn">Монгол</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
          </select>
          <button className="btn primary" type="submit" disabled={savingProfile}>
            {savingProfile ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </form>
        {profileMessage ? <p className="inlineMessage success">{profileMessage}</p> : null}

        {showPasswordForm ? (
          <div className="panel stackMd" style={{ padding: 20 }}>
            <div>
              <h3>Нууц үг солих</h3>
              <p className="meta">Одоогийн нууц үгээ баталгаажуулаад шинэ нууц үг тохируулна.</p>
            </div>
            <form className="formGrid" onSubmit={onPasswordSubmit}>
              <input name="currentPassword" type="password" placeholder="Одоогийн нууц үг" autoComplete="current-password" required />
              <input name="newPassword" type="password" placeholder="Шинэ нууц үг" autoComplete="new-password" required />
              <input className="full" name="confirmPassword" type="password" placeholder="Шинэ нууц үгээ давтах" autoComplete="new-password" required />
              <button className="btn primary" type="submit" disabled={changingPassword}>
                {changingPassword ? "Шинэчилж байна..." : "Нууц үг солих"}
              </button>
            </form>
            {passwordMessage ? <p className={`inlineMessage ${passwordError ? "error" : "success"}`}>{passwordMessage}</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
