export default function AccountTravelGuidePage() {
  return (
    <section className="stackLg">
      <div className="sectionHeading compact">
        <h1>Аялалын үеийн зөвлөгөө</h1>
      </div>

      <article className="panel stackMd">
        <label
          className="travelAdviceLabel"
          htmlFor="account-travel-advice-field"
        >
          Аялалын үеийн зөвлөгөө
        </label>
        <textarea
          id="account-travel-advice-field"
          className="travelAdviceField"
          readOnly
          value={
            "Ерөнхий зөвлөгөө\nАяллын өмнө бичиг баримт, маршрут, холбоо барих мэдээллээ сайтар шалгаарай.\n\nАнхаарах зүйлс\nЦаг агаар, замын нөхцөл, хувцас хэрэглэл, бэлэн мөнгө болон утасны цэнэгээ урьдчилан бэлдээрэй.\n\nАвах зүйлс\nИргэний үнэмлэх эсвэл паспорт, дулаан хувцас, эмийн хэрэгсэл, ус болон хувийн хэрэглээний зүйлсээ авч явахыг зөвлөж байна."
          }
        />
      </article>
    </section>
  );
}
