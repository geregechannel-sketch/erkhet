import { siteData } from "@/lib/siteData";

export default function AboutPage() {
  return (
    <main>
      <section className="pageHero"><div className="container"><h1>Бидний тухай</h1><p>Итгэл даах, аюулгүй, хариуцлагатай аяллын түнш.</p></div></section>
      <section className="section"><div className="container grid c3">
        <article className="card"><div className="content"><h3>Үүсгэн байгуулагдсан он</h3><p>{siteData.company.founded}</p></div></article>
        <article className="card"><div className="content"><h3>Үйл ажиллагааны чиглэл</h3><ul className="list">{siteData.businessDirections.map((item) => <li key={item}>{item}</li>)}</ul></div></article>
        <article className="card"><div className="content"><h3>Зорилго</h3><p>{"Монгол орны байгаль, түүх, соёлыг мэргэжлийн түвшинд танилцуулсан аюулгүй, сэтгэл ханамж өндөр аяллын үйлчилгээг хүргэх."}</p></div></article>
      </div></section>
      <section className="section alt"><div className="container"><h2>Үнэт зүйлс</h2><div className="grid c5">{siteData.values.map((value) => <article key={value} className="card"><div className="content">{value}</div></article>)}</div></div></section>
    </main>
  );
}
