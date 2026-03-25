import { repairText } from "@/lib/text";
import type { Tour } from "@/lib/types";

type TourAudienceTarget = Pick<Tour, "businessLine" | "slug" | "title" | "route">;

const foreignOnlySlugs = new Set(["ub-4d", "gobi-5d", "gobi-2d", "khangai-7d"]);
const foreignOnlyKeywords = [
  "улаанбаатар орчим",
  "улаанбаатар орчмын аялал",
  "уб орчмын аялал",
  "уб хот орчмын аялал",
  "говийн аялал",
  "хангайн аялал",
];

function includesKeyword(value: string | undefined, keyword: string) {
  return repairText(value || "").toLowerCase().includes(keyword);
}

export function isForeignOnlyTour(tour: TourAudienceTarget) {
  if (foreignOnlySlugs.has(tour.slug)) {
    return true;
  }

  return foreignOnlyKeywords.some(
    (keyword) => includesKeyword(tour.title, keyword) || includesKeyword(tour.route, keyword),
  );
}

export function getPublicBusinessLine(tour: TourAudienceTarget): Tour["businessLine"] {
  return isForeignOnlyTour(tour) ? "outbound" : tour.businessLine;
}
