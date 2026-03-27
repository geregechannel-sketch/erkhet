import type { Locale } from "@/lib/i18n";

export const travelAdviceByLocale: Record<
  Locale,
  { title: string; body: string; label: string; fieldValue: string }
> = {
  mn: {
    title: "Аялалын үеийн зөвлөгөө",
    body: "Аяллын өмнө болон аяллын үеэр хэрэг болох хамгийн чухал зөвлөгөөг нэг дороос хараарай.",
    label: "Аялалын үеийн зөвлөгөө",
    fieldValue:
      "Ерөнхий зөвлөгөө\nАялалд гарахаасаа өмнө бичиг баримт, маршрут, буудаллах мэдээлэл, холбоо барих дугаараа дахин шалгаарай.\n\nАнхаарах зүйлс\nЦаг агаар, замын нөхцөл, хувцас, уух ус, утасны цэнэгээ урьдчилан бэлдээрэй.\n\nАвах зүйлс\nИргэний үнэмлэх эсвэл паспорт, дулаан хувцас, эмийн хэрэгсэл, ус болон хувийн хэрэглээний зүйлсээ авч явахыг зөвлөж байна.",
  },
  en: {
    title: "Travel Advice",
    body: "See the most useful advice for before and during your trip in one place.",
    label: "Travel Advice",
    fieldValue:
      "General advice\nBefore departure, check your documents, route details, accommodation information, and contact numbers one more time.\n\nThings to keep in mind\nPrepare for the weather, road conditions, clothing, drinking water, and phone charge in advance.\n\nWhat to bring\nPlease carry your passport or ID, warm clothes, personal medicine, water, and daily essentials.",
  },
  ru: {
    title: "Советы во время поездки",
    body: "Здесь собраны самые важные советы, которые пригодятся до поездки и во время путешествия.",
    label: "Советы во время поездки",
    fieldValue:
      "Общие советы\nПеред поездкой ещё раз проверьте документы, маршрут, место проживания и контактные номера.\n\nНа что обратить внимание\nЗаранее подготовьте одежду по погоде, воду, заряд телефона и всё необходимое в дороге.\n\nЧто взять с собой\nРекомендуем взять паспорт или удостоверение личности, тёплую одежду, лекарства, воду и личные вещи.",
  },
  zh: {
    title: "旅行建议",
    body: "把出发前和旅途中最重要的提示集中在一个页面查看。",
    label: "旅行建议",
    fieldValue:
      "一般建议\n出发前请再次确认您的证件、行程安排、住宿信息和联系方式。\n\n注意事项\n请提前准备适合天气的衣物、饮用水、手机充电设备和途中需要的用品。\n\n建议携带\n建议携带护照或身份证、保暖衣物、常用药、水和个人用品。",
  },
};
