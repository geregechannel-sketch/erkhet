import Link from "next/link";
import { notFound } from "next/navigation";
import { siteData } from "@/lib/siteData";

export function generateStaticParams() {
  return siteData.tours.map((tour) => ({ id: tour.id }));
}

export default async function TourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = siteData.tours.find((item) => item.id === id);
  if (!tour) {
    notFound();
  }

  return (
    <main>
      <section className="pageHero"><div className="container"><h1>{tour.title}</h1><p>{tour.overview}</p></div></section>
      <section className="section"><div className="container row2">
        <article className="card"><img className="cover" src={tour.image} alt={tour.title} /><div className="content"><h3>Хөтөлбөр</h3><div className="grid">{tour.itinerary.map((item, idx) => <div key={item + idx} className="card"><div className="content">{item}</div></div>)}</div></div></article>
        <article className="card"><div className="content"><p><strong>Хугацаа:</strong> {tour.duration}</p>{tour.price ? <p><strong>Үнэ:</strong> {tour.price}</p> : null}<p><strong>Чиглэл:</strong> {tour.route}</p><h4>Үүнд багтсан</h4><ul className="list"><li>Guide service</li><li>Transport within itinerary</li><li>Basic support coordination</li></ul><h4>Үүнд багтаагүй</h4><ul className="list"><li>Personal expenses</li><li>Optional activities</li></ul><p><Link className="btn primary" href="/contact">Энэ аяллаар лавлагаа илгээх</Link></p></div></article>
      </div></section>
    </main>
  );
}
