"use client";

import { useEffect, useState } from "react";
import { TourCard } from "@/components/tours/TourCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { authHeaders, browserApiFetch } from "@/lib/api";
import type { Tour } from "@/lib/types";

export default function SavedToursPage() {
  const { token } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void browserApiFetch<Tour[]>("/me/favorites", {
      headers: authHeaders(token)
    }).then(setTours);
  }, [token]);

  return (
    <section className="stackLg">
      <div className="sectionHeading compact"><h1>Saved Tours</h1></div>
      {tours.length === 0 ? <article className="panel emptyState">Одоогоор хадгалсан аялал алга.</article> : <div className="grid c2">{tours.map((tour) => <TourCard key={tour.slug} tour={tour} />)}</div>}
    </section>
  );
}