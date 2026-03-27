import { getRequestLocale } from "@/lib/request-locale";
import { travelAdviceByLocale } from "@/lib/travel-advice";

export default async function TravelGuidePage() {
  const locale = await getRequestLocale();
  const copy = travelAdviceByLocale[locale];

  return (
    <main>
      <section className="pageHero">
        <div className="container stackLg">
          <div className="stackMd">
            <p className="eyebrow">{copy.title}</p>
            <h1>{copy.title}</h1>
            <p>{copy.body}</p>
          </div>

          <article className="card travelAdviceCard">
            <div className="content stackMd">
              <label className="travelAdviceLabel" htmlFor="travel-advice-field">
                {copy.label}
              </label>
              <textarea id="travel-advice-field" className="travelAdviceField" readOnly value={copy.fieldValue} />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
