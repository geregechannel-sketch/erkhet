import type { TravelerDetail } from "@/lib/types";

type Props = {
  travelers: TravelerDetail[];
  emptyMessage?: string;
};

export function TravelerDetailsTable({
  travelers,
  emptyMessage = "Нэмэлт аялагчийн мэдээлэл бөглөгдөөгүй байна."
}: Props) {
  if (!travelers || travelers.length === 0) {
    return <div className="travelerEmptyState">{emptyMessage}</div>;
  }

  return (
    <div className="travelerTableWrap">
      <table className="travelerTable travelerTableReadOnly">
        <thead>
          <tr>
            <th>Нэр</th>
            <th>Нас</th>
            <th>Хүйс</th>
            <th>Хобби</th>
            <th>Хоолны онцлог</th>
            <th>Харшил</th>
          </tr>
        </thead>
        <tbody>
          {travelers.map((traveler, index) => (
            <tr key={`traveler-view-${index}`}>
              <td>{traveler.fullName || "-"}</td>
              <td>{traveler.age ?? "-"}</td>
              <td>{traveler.gender || "-"}</td>
              <td>{traveler.hobby || "-"}</td>
              <td>{traveler.diet || "-"}</td>
              <td>{traveler.allergy || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}