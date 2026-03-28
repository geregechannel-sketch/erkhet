"use client";

import { useLocale } from "@/components/locale/LocaleProvider";
import type { TravelerDetail } from "@/lib/types";

type TravelerLabels = {
  fullName: string;
  age: string;
  gender: string;
  hobby: string;
  diet: string;
  allergy: string;
};

type TravelerPlaceholders = {
  fullName: string;
  age: string;
  gender: string;
  hobby: string;
  diet: string;
  allergy: string;
};

type Props = {
  value: TravelerDetail[];
  onChange: (items: TravelerDetail[]) => void;
  title?: string;
  description?: string;
  addLabel?: string;
  emptyState?: string;
  removeLabel?: string;
  labels?: TravelerLabels;
  placeholders?: TravelerPlaceholders;
};

const copyByLocale = {
  mn: {
    title: "Аялагчийн мэдээлэл",
    description: "Энэ хэсгийг заавал бөглөх албагүй. Аяллыг илүү зөв зохион байгуулахад хэрэгтэй мэдээллээ оруулж болно.",
    addLabel: "Аялагч нэмэх",
    emptyState: "Хамт явах хүмүүсийн нэр, нас, хоолны онцлог, харшлын мэдээллийг энд оруулж болно.",
    removeLabel: "Хасах",
    labels: {
      fullName: "Нэр",
      age: "Нас",
      gender: "Хүйс",
      hobby: "Сонирхол",
      diet: "Хоолны онцлог",
      allergy: "Харшил",
    },
    placeholders: {
      fullName: "Нэр",
      age: "Нас",
      gender: "Эрэгтэй / Эмэгтэй",
      hobby: "Жишээ: Гэрэл зураг",
      diet: "Жишээ: Цагаан хоолтон",
      allergy: "Харшлын мэдээлэл",
    },
  },
  en: {
    title: "Traveler details",
    description: "This section is optional, but it helps us organize the trip better for your group.",
    addLabel: "Add traveler",
    emptyState: "Add names, ages, diet notes, and allergy details for the people traveling with you.",
    removeLabel: "Remove",
    labels: {
      fullName: "Name",
      age: "Age",
      gender: "Gender",
      hobby: "Interest",
      diet: "Diet",
      allergy: "Allergy",
    },
    placeholders: {
      fullName: "Name",
      age: "Age",
      gender: "Male / Female",
      hobby: "Example: Photography",
      diet: "Example: Vegetarian",
      allergy: "Allergy notes",
    },
  },
  ru: {
    title: "Данные путешественников",
    description: "Этот раздел необязателен, но помогает нам лучше подготовить поездку для вашей группы.",
    addLabel: "Добавить путешественника",
    emptyState: "Укажите имена, возраст, особенности питания и аллергии участников поездки.",
    removeLabel: "Удалить",
    labels: {
      fullName: "Имя",
      age: "Возраст",
      gender: "Пол",
      hobby: "Интерес",
      diet: "Питание",
      allergy: "Аллергия",
    },
    placeholders: {
      fullName: "Имя",
      age: "Возраст",
      gender: "Мужчина / Женщина",
      hobby: "Например: Фотография",
      diet: "Например: Вегетарианец",
      allergy: "Информация об аллергии",
    },
  },
  zh: {
    title: "旅客信息",
    description: "此部分不是必填，但会帮助我们更准确地为您的团队安排行程。",
    addLabel: "新增旅客",
    emptyState: "可在此填写同行旅客的姓名、年龄、饮食偏好和过敏信息。",
    removeLabel: "删除",
    labels: {
      fullName: "姓名",
      age: "年龄",
      gender: "性别",
      hobby: "兴趣",
      diet: "饮食偏好",
      allergy: "过敏",
    },
    placeholders: {
      fullName: "姓名",
      age: "年龄",
      gender: "男 / 女",
      hobby: "例如：摄影",
      diet: "例如：素食",
      allergy: "过敏信息",
    },
  },
} as const;

function blankTraveler(): TravelerDetail {
  return {
    fullName: "",
    age: null,
    gender: "",
    hobby: "",
    diet: "",
    allergy: "",
  };
}

export function TravelerDetailsEditor({
  value,
  onChange,
  title,
  description,
  addLabel,
  emptyState,
  removeLabel,
  labels,
  placeholders,
}: Props) {
  const { locale } = useLocale();
  const copy = copyByLocale[locale];
  const resolvedTitle = title ?? copy.title;
  const resolvedDescription = description ?? copy.description;
  const resolvedAddLabel = addLabel ?? copy.addLabel;
  const resolvedEmptyState = emptyState ?? copy.emptyState;
  const resolvedRemoveLabel = removeLabel ?? copy.removeLabel;
  const resolvedLabels = labels ?? copy.labels;
  const resolvedPlaceholders = placeholders ?? copy.placeholders;
  const items = value.length > 0 ? value : [];

  const updateTraveler = <K extends keyof TravelerDetail>(index: number, field: K, nextValue: TravelerDetail[K]) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      [field]: nextValue,
    };
    onChange(next);
  };

  const addTraveler = () => {
    onChange([...items, blankTraveler()]);
  };

  const removeTraveler = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="travelerEditor stackMd">
      <div className="travelerEditorIntro stackSm">
        <div>
          <h3>{resolvedTitle}</h3>
          <p className="meta">{resolvedDescription}</p>
        </div>
        <button className="btn secondary" type="button" onClick={addTraveler}>
          {resolvedAddLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="travelerEmptyState">{resolvedEmptyState}</div>
      ) : (
        <div className="travelerTableWrap">
          <table className="travelerTable">
            <thead>
              <tr>
                <th>{resolvedLabels.fullName}</th>
                <th>{resolvedLabels.age}</th>
                <th>{resolvedLabels.gender}</th>
                <th>{resolvedLabels.hobby}</th>
                <th>{resolvedLabels.diet}</th>
                <th>{resolvedLabels.allergy}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((traveler, index) => (
                <tr key={`traveler-${index}`}>
                  <td>
                    <input
                      value={traveler.fullName}
                      onChange={(event) => updateTraveler(index, "fullName", event.target.value)}
                      placeholder={resolvedPlaceholders.fullName}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.age ?? ""}
                      onChange={(event) =>
                        updateTraveler(index, "age", event.target.value ? Number(event.target.value) : null)
                      }
                      placeholder={resolvedPlaceholders.age}
                      inputMode="numeric"
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.gender}
                      onChange={(event) => updateTraveler(index, "gender", event.target.value)}
                      placeholder={resolvedPlaceholders.gender}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.hobby}
                      onChange={(event) => updateTraveler(index, "hobby", event.target.value)}
                      placeholder={resolvedPlaceholders.hobby}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.diet}
                      onChange={(event) => updateTraveler(index, "diet", event.target.value)}
                      placeholder={resolvedPlaceholders.diet}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.allergy}
                      onChange={(event) => updateTraveler(index, "allergy", event.target.value)}
                      placeholder={resolvedPlaceholders.allergy}
                    />
                  </td>
                  <td>
                    <button className="btn secondary" type="button" onClick={() => removeTraveler(index)}>
                      {resolvedRemoveLabel}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
