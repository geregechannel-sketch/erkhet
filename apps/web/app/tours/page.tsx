import Link from "next/link";
import { siteData } from "@/lib/siteData";

export default function ToursPage() {
  const multi = siteData.tours.filter((t) => t.category === "multi");
  const short = siteData.tours.filter((t) => t.category === "short");

  return (
    <main>
      <section className="pageHero"><div className="container"><h1>Аяллууд</h1><p>Олон өдрийн болон дотоодын богино аяллууд.</p></div></section>

      <section className="section"><div className="container"><h2>Олон өдрийн аяллууд</h2><div className="grid c3">{multi.map((tour) => <article key={tour.id} className="card"><img className="cover" src={tour.image} alt={tour.title} /><div className="content"><span className="badge">{tour.duration}</span><h3>{tour.title}</h3><p className="meta">{tour.route}</p>{tour.price ? <p className="price">{tour.price}</p> : null}<Link href={`/tours/${tour.id}`}>Дэлгэрэнгүй</Link></div></article>)}</div></div></section>

      <section className="section alt"><div className="container"><h2>Дотоодын богино аяллууд</h2><div className="grid c3">{short.map((tour) => <article key={tour.id} className="card"><img className="cover" src={tour.image} alt={tour.title} /><div className="content"><span className="badge">{tour.duration}</span><h3>{tour.title}</h3><p className="meta">{tour.route}</p><Link href={`/tours/${tour.id}`}>Дэлгэрэнгүй</Link></div></article>)}</div></div></section>
    </main>
  );
}
