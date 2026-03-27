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
};

const defaultLabels: TravelerLabels = {
  fullName: "Нэр",
  age: "Нас",
  gender: "Хүйс",
  hobby: "Сонирхол",
  diet: "Хоолны онцлог",
  allergy: "Харшил",
};

export function TravelerDetailsTable({
  travelers,
  emptyMessage = "Нэмэлт аялагчийн мэдээлэл оруулаагүй байна.",
  labels = defaultLabels,
}: Props) {
  if (!travelers || travelers.length === 0) {
    return <div className="travelerEmptyState">{emptyMessage}</div>;
  }

  return (
    <div className="travelerTableWrap">
      <table className="travelerTable travelerTableReadOnly">
        <thead>
          <tr>
            <th>{labels.fullName}</th>
            <th>{labels.age}</th>
            <th>{labels.gender}</th>
            <th>{labels.hobby}</th>
            <th>{labels.diet}</th>
            <th>{labels.allergy}</th>
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
