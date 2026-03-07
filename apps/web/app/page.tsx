import Link from "next/link";
import { siteData } from "@/lib/siteData";

export default function HomePage() {
  const featured = siteData.tours.slice(0, 5);
  const regions = Object.entries(siteData.destinations);
  return (
    <main>
      <section className="hero">
        <div className="container">
          <p>2016 оноос хойш</p>
          <h1>Монгол орноор аюулгүй, тав тухтай, дурсамжтай аялаарай</h1>
          <p>Эрхэт Солар Турс ХХК нь Монгол орны байгаль, түүх, соёлыг мэргэжлийн түвшинд танилцуулсан аюулгүй, сэтгэл ханамж өндөр аяллын үйлчилгээг санал болгож байна.</p>
          <div className="btns">
            <Link className="btn primary" href="/tours">Аяллууд үзэх</Link>
            <Link className="btn ghost" href="/contact">Аяллаа төлөвлөх</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Бидний тухай</h2>
          <div className="card"><div className="content">
            <p>Эрхэт Солар Турс ХХК нь 2016 оноос эхлэн inbound, outbound, domestic чиглэлээр аялал зохион байгуулж байна.</p>
            <Link href="/about">Дэлгэрэнгүй</Link>
          </div></div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Үйлчилгээ</h2>
          <div className="grid c4">
            {siteData.services.slice(0, 4).map((service) => (
              <article key={service.title} className="card"><div className="content"><h3>{service.title}</h3><p className="meta">{service.desc}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Онцлох аяллууд</h2>
          <div className="grid c3">
            {featured.map((tour) => (
              <article key={tour.id} className="card">
                <img className="cover" src={tour.image} alt={tour.title} />
                <div className="content">
                  <span className="badge">{tour.duration}</span>
                  <h3>{tour.title}</h3>
                  <p className="meta">{tour.route}</p>
                  {tour.price ? <p className="price">{tour.price}</p> : null}
                  <Link href={`/tours/${tour.id}`}>Дэлгэрэнгүй</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>Аяллын бүсүүд</h2>
          <div className="grid c3">
            {regions.map(([region, items]) => (
              <article key={region} className="card"><div className="content"><h3>{region}</h3><ul className="list">{items.slice(0,5).map((item) => <li key={item}>{item}</li>)}</ul><Link href="/destinations">Дэлгэрэнгүй</Link></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Яагаад биднийг сонгох вэ</h2>
          <div className="grid c5">{siteData.values.map((value) => <article key={value} className="card"><div className="content">{value}</div></article>)}</div>
        </div>
      </section>
    </main>
  );
}
