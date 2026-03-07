import { siteData } from "@/lib/siteData";

export default function ServicesPage() {
  return (
    <main>
      <section className="pageHero"><div className="container"><h1>Үйлчилгээ</h1><p>Таны зорилгод тохирсон аяллын шийдлүүд.</p></div></section>
      <section className="section"><div className="container"><div className="grid c3">{siteData.services.map((service) => <article key={service.title} className="card"><div className="content"><h3>{service.title}</h3><p className="meta">{service.desc}</p></div></article>)}</div></div></section>
    </main>
  );
}
