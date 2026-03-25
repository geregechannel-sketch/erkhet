import Link from "next/link";

export default function ReviewsPage() {
  return (
    <main>
      <section className="pageHero bookingCenterHero">
        <div className="container bookingCenterHeroGrid">
          <div className="stackMd">
            <p className="eyebrow">Санал хүсэлт</p>
            <h1>Сэтгэгдэл ба санал хүсэлт</h1>
            <p>
              Та бүхний санал хүсэлтийг бид хүлээн авч үйл ажиллагаагаа засан
              сайжруулахад анхаарах учраас таны санал хүсэлт бидэнд хамгийн
              үнэтэй
            </p>
            <div className="rowActions wrapActions">
              <Link className="btn primary" href="/contact">
                Холбоо барих
              </Link>
              <Link className="btn secondary" href="/account/support">
                Санал хүсэлт илгээх
              </Link>
            </div>
          </div>

          <article className="card bookingInfoCard">
            <div className="content stackSm">
              <p className="eyebrow">Бид сонсож байна</p>
              <h3>Таны санал бидэнд чухал</h3>
              <p className="meta">
                Ирсэн санал хүсэлт бүрийг анхааралтай уншиж, үйлчилгээгээ улам
                сайжруулахад ашиглана.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
