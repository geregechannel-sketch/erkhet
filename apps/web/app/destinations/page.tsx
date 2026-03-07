import { siteData } from "@/lib/siteData";

export default function DestinationsPage() {
  return (
    <main>
      <section className="pageHero"><div className="container"><h1>Чиглэлүүд</h1><p>Монгол орны аяллын бүсүүдээр ангилсан чиглэлүүд.</p></div></section>
      <section className="section"><div className="container"><div className="grid c3">{Object.entries(siteData.destinations).map(([region, items]) => <article key={region} className="card"><div className="content"><h3>{region}</h3><ul className="list">{items.map((item) => <li key={item}>{item}</li>)}</ul></div></article>)}</div></div></section>
    </main>
  );
}
