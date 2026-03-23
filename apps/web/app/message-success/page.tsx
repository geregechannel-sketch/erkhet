import Link from "next/link";

export default function MessageSuccessPage() {
  return (
    <main>
      <section className="pageHero">
        <div className="container stackMd">
          <p className="eyebrow">Success</p>
          <h1>Таны хүсэлт амжилттай бүртгэгдлээ</h1>
          <p>
            Хүсэлт, захиалга, эсвэл төлөвлөлтийн мэдээлэл манай системд хадгалагдлаа. Манай баг
            дараагийн алхмыг баталгаажуулаад тантай холбогдоно.
          </p>
          <div className="rowActions">
            <Link className="btn primary" href="/dashboard">Хэрэглэгчийн самбар</Link>
            <Link className="btn secondary" href="/tours">Аяллууд үзэх</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
