import type { Locale } from "@/lib/i18n";
import type { TravelerDetail } from "@/lib/types";

type TravelerLabels = {
  fullName: string;
  age: string;
  gender: string;
  hobby: string;
  diet: string;
  allergy: string;
};

type Props = {
  travelers: TravelerDetail[];
  emptyMessage?: string;
  labels?: TravelerLabels;
  locale?: Locale;
};

const labelsByLocale: Record<Locale, TravelerLabels> = {
  mn: {
    fullName: "Нэр",
    age: "Нас",
    gender: "Хүйс",
    hobby: "Сонирхол",
    diet: "Хоолны онцлог",
    allergy: "Харшил",
  },
  en: {
    fullName: "Full name",
    age: "Age",
    gender: "Gender",
    hobby: "Interest",
    diet: "Diet",
    allergy: "Allergy",
  },
  ru: {
    fullName: "Имя",
    age: "Возраст",
    gender: "Пол",
    hobby: "Интерес",
    diet: "Питание",
    allergy: "Аллергия",
  },
  zh: {
    fullName: "姓名",
    age: "年龄",
    gender: "性别",
    hobby: "兴趣",
    diet: "饮食偏好",
    allergy: "过敏信息",
  },
};

const emptyMessageByLocale: Record<Locale, string> = {
  mn: "Нэмэлт аялагчийн мэдээлэл оруулаагүй байна.",
  en: "No additional traveler details were provided.",
  ru: "Дополнительные данные путешественников не указаны.",
  zh: "暂未填写其他旅客信息。",
};

export function TravelerDetailsTable({
  travelers,
  emptyMessage,
  labels,
  locale = "mn",
}: Props) {
  const resolvedLabels = labels || labelsByLocale[locale];
  const resolvedEmptyMessage = emptyMessage || emptyMessageByLocale[locale];

  if (!travelers || travelers.length === 0) {
    return <div className="travelerEmptyState">{resolvedEmptyMessage}</div>;
  }

  return (
    <div className="travelerTableWrap">
      <table className="travelerTable travelerTableReadOnly">
        <thead>
          <tr>
            <th>{resolvedLabels.fullName}</th>
            <th>{resolvedLabels.age}</th>
            <th>{resolvedLabels.gender}</th>
            <th>{resolvedLabels.hobby}</th>
            <th>{resolvedLabels.diet}</th>
            <th>{resolvedLabels.allergy}</th>
          </tr>
        </thead>
        <tbody>
          {travelers.map((traveler, index) => (
            <tr key={`traveler-view-${index}`}>
              <td>{traveler.fullName || "—"}</td>
              <td>{traveler.age ?? "—"}</td>
              <td>{traveler.gender || "—"}</td>
              <td>{traveler.hobby || "—"}</td>
              <td>{traveler.diet || "—"}</td>
              <td>{traveler.allergy || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
