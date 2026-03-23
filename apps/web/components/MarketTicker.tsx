"use client";

import { useEffect, useMemo, useState } from "react";
import { useChromeMessages, useLocale } from "@/components/locale/LocaleProvider";
import { buildFallbackSnapshot, localeTag, type MarketSnapshotItem } from "@/lib/market";

type MarketSnapshotResponse = {
  updatedAt: string;
  items: MarketSnapshotItem[];
};

export function MarketTicker() {
  const { locale } = useLocale();
  const messages = useChromeMessages();
  const [items, setItems] = useState<MarketSnapshotItem[]>(() => buildFallbackSnapshot(locale));

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/market-snapshot?locale=${locale}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Market snapshot failed with ${response.status}`);
        }
        const payload = (await response.json()) as MarketSnapshotResponse;
        if (payload.items?.length) {
          setItems(payload.items);
          return;
        }
        setItems(buildFallbackSnapshot(locale));
      } catch {
        if (!controller.signal.aborted) {
          setItems(buildFallbackSnapshot(locale));
        }
      }
    };

    setItems(buildFallbackSnapshot(locale));
    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 20 * 60 * 1000);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [locale]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(localeTag(locale), {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const repeatedItems = items.length ? [...items, ...items] : [];

  return (
    <div className="marketTicker" role="status" aria-live="polite">
      {repeatedItems.length ? (
        <div className="marketTickerTrack">
          {repeatedItems.map((item, index) => (
            <div className="marketTickerItem" key={`${item.code}-${index}`}>
              <strong className="marketTickerCity">
                <span className="marketTickerFlag" aria-hidden="true">{item.flag}</span>
                <span>{item.city}</span>
              </strong>
              <span>{item.localTime}</span>
              <span>{Math.round(item.temperatureC)}°C</span>
              <span>{item.weatherText}</span>
              <span>
                USD/{item.quoteCurrency} {formatter.format(item.rate)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <span className="marketTickerFallback">{messages.utility.marketFallback}</span>
      )}
    </div>
  );
}
