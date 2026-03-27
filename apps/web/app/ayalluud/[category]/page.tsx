import { notFound } from "next/navigation";
import ToursPage from "@/app/tours/page";

const categoryToBusinessLine = {
  inbound: "inbound",
  outbound: "outbound",
  domestic: "domestic",
} as const;

export default async function AyalluudCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const businessLine = categoryToBusinessLine[category as keyof typeof categoryToBusinessLine];

  if (!businessLine) {
    notFound();
  }

  return <ToursPage searchParams={Promise.resolve({ businessLine })} />;
}
