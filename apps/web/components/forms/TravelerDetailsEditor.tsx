"use client";

import type { TravelerDetail } from "@/lib/types";

type Props = {
  value: TravelerDetail[];
  onChange: (items: TravelerDetail[]) => void;
  title?: string;
  description?: string;
};

function blankTraveler(): TravelerDetail {
  return {
    fullName: "",
    age: null,
    gender: "",
    hobby: "",
    diet: "",
    allergy: ""
  };
}

export function TravelerDetailsEditor({
  value,
  onChange,
  title = "Аялагчдын нэмэлт мэдээлэл",
  description = "Энэ хүснэгт нь заавал бөглөх талбар биш. Аялал зохион байгуулалт, хоолны сонголт, аюулгүй байдлыг хангах зорилгоор л ашиглагдана."
}: Props) {
  const items = value.length > 0 ? value : [];

  const updateTraveler = <K extends keyof TravelerDetail>(index: number, field: K, nextValue: TravelerDetail[K]) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      [field]: nextValue
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
          Аялагч нэмэх
        </button>
      </div>

      {items.length === 0 ? (
        <div className="travelerEmptyState">
          Хүсвэл хамт явах хүмүүсийн нэр, нас, хоолны онцлог, харшлын мэдээллийг энд оруулж болно.
        </div>
      ) : (
        <div className="travelerTableWrap">
          <table className="travelerTable">
            <thead>
              <tr>
                <th>Нэр</th>
                <th>Нас</th>
                <th>Хүйс</th>
                <th>Хобби</th>
                <th>Хоолны онцлог</th>
                <th>Харшил</th>
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
                      placeholder="Нэр"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={traveler.age ?? ""}
                      onChange={(event) => updateTraveler(index, "age", event.target.value ? Number(event.target.value) : null)}
                      placeholder="Нас"
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.gender}
                      onChange={(event) => updateTraveler(index, "gender", event.target.value)}
                      placeholder="Эрэгтэй / Эмэгтэй"
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.hobby}
                      onChange={(event) => updateTraveler(index, "hobby", event.target.value)}
                      placeholder="Жишээ: Фото"
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.diet}
                      onChange={(event) => updateTraveler(index, "diet", event.target.value)}
                      placeholder="Веган, халал..."
                    />
                  </td>
                  <td>
                    <input
                      value={traveler.allergy}
                      onChange={(event) => updateTraveler(index, "allergy", event.target.value)}
                      placeholder="Харшлын мэдээлэл"
                    />
                  </td>
                  <td>
                    <button className="travelerRemoveButton" type="button" onClick={() => removeTraveler(index)}>
                      Хасах
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