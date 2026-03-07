"use client";

import { FormEvent } from "react";
import { siteData } from "@/lib/siteData";

export default function ContactPage() {
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      interested_tour: formData.get("tour"),
      people_count: Number(formData.get("people") || 0),
      days_count: Number(formData.get("days") || 0),
      note: formData.get("note")
    };

    try {
      await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/inquiries` : "/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (_) {
      // Keep UX simple if backend is not connected yet.
    }

    window.open(siteData.contacts.facebook, "_blank");
    alert("Лавлагаа илгээгдлээ.");
    form.reset();
  };

  return (
    <main>
      <section className="pageHero"><div className="container"><h1>Холбоо барих / Лавлагаа</h1><p>Албан ёсны мэдээллээр шууд холбогдож, хүсэлтээ илгээнэ үү.</p></div></section>
      <section className="section"><div className="container row2">
        <article className="card"><div className="content"><h3>Лавлагааны форм</h3><form className="formGrid" onSubmit={onSubmit}><input name="name" placeholder="Нэр" required /><input name="phone" placeholder="Утасны дугаар" required /><input name="email" type="email" placeholder="И-мэйл" /><input name="tour" placeholder="Сонирхож буй аялал" /><input name="people" type="number" min="1" placeholder="Хэдэн хүн" /><input name="days" type="number" min="1" placeholder="Хэдэн өдөр" /><textarea className="full" name="note" placeholder="Нэмэлт тайлбар" /><button className="btn primary full" type="submit">Илгээх</button></form></div></article>
        <div className="grid">
          <article className="card"><div className="content"><h3>Албан ёсны холбоо барих мэдээлэл</h3><p><strong>Утас:</strong> <a href={`tel:${siteData.company.phone}`}>{siteData.company.phone}</a></p><p><strong>Email:</strong> <a href={`mailto:${siteData.company.email}`}>{siteData.company.email}</a></p>{siteData.company.address ? <p><strong>Хаяг:</strong> {siteData.company.address}</p> : null}<p><strong>Facebook:</strong> <a href={siteData.contacts.facebook} target="_blank">{siteData.contacts.facebook}</a></p></div></article>
          <article className="card"><div className="content"><h3>Төлбөрийн мэдээлэл</h3><p><strong>Аргууд:</strong> {siteData.payment.methods.join(", ")}</p>{siteData.payment.instructions ? <p>{siteData.payment.instructions}</p> : <p className="meta">Нэмэлт зааврыг админ талбарт оруулах боломжтой.</p>}</div></article>
          <article className="card"><div className="content"><h3>QR холбоос</h3><div style={{display:"flex",gap:12,flexWrap:"wrap"}}><figure style={{margin:0,textAlign:"center"}}><img src={siteData.contacts.telegramQr} alt="Telegram QR" style={{width:140,height:140,objectFit:"cover"}} /><figcaption>Telegram</figcaption></figure><figure style={{margin:0,textAlign:"center"}}><img src={siteData.contacts.wechatQr} alt="WeChat QR" style={{width:140,height:140,objectFit:"cover"}} /><figcaption>WeChat</figcaption></figure></div></div></article>
        </div>
      </div></section>
    </main>
  );
}
