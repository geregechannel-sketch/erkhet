"use client";

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

const defaultLabels: TravelerLabels = {
  fullName: "Нэр",
  age: "Нас",
  gender: "Хүйс",
  hobby: "Сонирхол",
  diet: "Хоолны онцлог",
  allergy: "Харшил",
};

const defaultPlaceholders: TravelerPlaceholders = {
  fullName: "Нэр",
  age: "Нас",
  gender: "Эрэгтэй / Эмэгтэй",
  hobby: "Жишээ: Гэрэл зураг",
  diet: "Жишээ: Цагаан хоолтон",
  allergy: "Харшлын мэдээлэл",
};

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
  title = "Аялагчийн мэдээлэл",
  description = "Энэ хэсгийг заавал бөглөх албагүй. Аяллыг илүү зөв зохион байгуулахад хэрэгтэй мэдээллээ оруулж болно.",
  addLabel = "Аялагч нэмэх",
  emptyState = "Хамт явах хүмүүсийн нэр, нас, хоолны онцлог, харшлын мэдээллийг энд оруулж болно.",
  removeLabel = "Хасах",
  labels = defaultLabels,
  placeholders = defaultPlaceholders,
}: Props) {
  const items = value.length > 0 ? value : [];

  const updateTraveler = <K extends keyof TravelerDetail>(
    index: number,
    field: K,
    nextValue: TravelerDetail[K],
  ) => {
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
          <h3>{title}</h3>
          <p className="meta">{description}</p>
        </div>
        <button className="btn secondary" type="button" onClick={addTraveler}>
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="travelerEmptyState">{emptyState}</div>
      ) : (
        <div className="travelerTableWrap">
          <table className="travelerTable">
            <thead>
              <tr>
                <th>{labels.fullName}</th>
                <th>{labels.age}</th>
                <th>{labels.gender}</th>
                <th>{labels.hobby}</th>
                <th>{labels.diet}</th>
                <th>{labels.allergy}</th>
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
                      placeholder={placeholders.fullName}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={traveler.age ?? ""}
                      onChange={(event) =>
                        updateTraveler(index, "age", event.target.value ? Number(event.target.value) : null)
                      }
                      placeholder={placeholders.age}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.gender}
                      onChange={(event) => updateTraveler(index, "gender", event.target.value)}
                      placeholder={placeholders.gender}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.hobby}
                      onChange={(event) => updateTraveler(index, "hobby", event.target.value)}
                      placeholder={placeholders.hobby}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.diet}
                      onChange={(event) => updateTraveler(index, "diet", event.target.value)}
                      placeholder={placeholders.diet}
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.allergy}
                      onChange={(event) => updateTraveler(index, "allergy", event.target.value)}
                      placeholder={placeholders.allergy}
                    />
                  </td>
                  <td>
                    <button className="travelerRemoveButton" type="button" onClick={() => removeTraveler(index)}>
                      {removeLabel}
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
