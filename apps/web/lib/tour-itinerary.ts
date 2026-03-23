import type { Tour } from "@/lib/types";
import { repairText } from "@/lib/text";

export type TourItineraryItem = {
  time: string;
  duration: string;
  program: string;
};

export type TourItineraryDay = {
  day: string;
  title: string;
  items: TourItineraryItem[];
};

const ub4dItineraryData: TourItineraryDay[] = [
  {
    day: "1 өдөр",
    title: "Замын-Үүд – Сайншанд – Хамрын хийд – Улаанбаатар",
    items: [
      { time: "10:00-13:00", duration: "3 цаг", program: "Хилээр автобусаар гарч, Сайншанд сум руу явна." },
      { time: "13:00-14:00", duration: "1 цаг", program: "Өдрийн хоолыг өөрсдөө төлж иднэ." },
      { time: "14:00-17:00", duration: "3 цаг", program: "Хамрын хийд үзнэ." },
      { time: "17:00-19:00", duration: "2 цаг", program: "Улаанбаатар хот руу хөдөлнө." },
      { time: "19:00-20:00", duration: "1 цаг", program: "Оройн хоолыг замдаа иднэ." },
      { time: "20:00-22:00", duration: "2 цаг", program: "Замдаа үргэлжлүүлэн явж, Улаанбаатар хотод ирнэ." },
      { time: "22:00", duration: "", program: "Зочид буудалдаа орж амарна." },
    ],
  },
  {
    day: "2 өдөр",
    title: "Улаанбаатар хотын аялал",
    items: [
      { time: "08:00-09:00", duration: "1 цаг", program: "Өглөөний цайгаа буудалдаа ууна." },
      { time: "09:00-10:00", duration: "1 цаг", program: "Улаанбаатар хотын төв талбайд зочилж, зураг даруулна." },
      { time: "10:00-14:00", duration: "4 цаг", program: "Музей үзнэ." },
      { time: "14:00-15:00", duration: "1 цаг", program: "Өдрийн хоолыг өөрсдөө төлж иднэ." },
      { time: "15:00-18:00", duration: "3 цаг", program: "Жанрайсагт мөргөж, Гандан хийдээр орно. Дараа нь чөлөөт цаг, дэлгүүр хэснэ." },
      { time: "18:00-19:00", duration: "1 цаг", program: "Оройн хоол иднэ." },
      { time: "19:00", duration: "", program: "Буудалдаа очиж амарна." },
    ],
  },
  {
    day: "3 өдөр",
    title: "Монгол ахуйтай танилцах аялал – Mongol Nomadic",
    items: [
      { time: "Өглөө", duration: "", program: "Өглөөний цайгаа буудалдаа ууна." },
      { time: "Өдөр", duration: "", program: "22-ын товчооны цаана байрлах Mongol Nomadic руу гарч, Монгол ёс заншилтай танилцах хээрийн аялал хийнэ." },
      { time: "Өдөр", duration: "", program: "Өдрийн хоолыг аяллын хөтөлбөрөөс өгнө." },
      { time: "Орой", duration: "", program: "Улаанбаатар хотод буцаж ирэн, буудалдаа оройн хоол идэж амарна." },
    ],
  },
  {
    day: "4 өдөр",
    title: "Цонжин Болдог – Чингис хааны морьт хөшөөт цогцолбор – Буцах",
    items: [
      { time: "08:00-09:00", duration: "1 цаг", program: "Өглөөний цайгаа уугаад Цонжин Болдог руу хөдөлнө." },
      { time: "09:00-10:30", duration: "1 цаг 30 мин", program: "Замд явна." },
      { time: "10:30-12:00", duration: "1 цаг 30 мин", program: "Цонжин Болдогт хүрч, Чингис хааны морьт хөшөөт цогцолборыг үзнэ." },
      { time: "12:00-16:30", duration: "4 цаг 30 мин", program: "Хот руу буцаж, замдаа өдрийн хоол иднэ." },
      { time: "16:30", duration: "", program: "Вагонд сууж буцна." },
    ],
  },
];

function createFallbackDay(rawItem: string, index: number): TourItineraryDay {
  const repaired = repairText(rawItem).trim();
  const [left, right] = repaired.split(/:\s*/, 2);
  const day = (right ? left : "").trim() || `${index + 1} өдөр`;
  const title = (right || repaired).trim() || `Хөтөлбөр ${index + 1}`;

  return {
    day,
    title,
    items: [
      {
        time: "—",
        duration: "",
        program: title,
      },
    ],
  };
}

export function getStructuredItinerary(tour: Tour): TourItineraryDay[] {
  if (tour.slug === "ub-4d") {
    return ub4dItineraryData;
  }

  return tour.itinerary.map((item, index) => createFallbackDay(item, index));
}

export function displayItineraryValue(value?: string | null) {
  const repaired = repairText(value || "").trim();
  return repaired || "—";
}
