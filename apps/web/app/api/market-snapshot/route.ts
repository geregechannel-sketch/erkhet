import { NextRequest, NextResponse } from "next/server";
import { resolveLocale } from "@/lib/i18n";
import {
  buildFallbackSnapshot,
  fallbackRates,
  localeTag,
  marketCities,
  weatherLabel,
  type MarketSnapshotItem,
} from "@/lib/market";

async function fetchRates() {
  const symbols = marketCities.map((city) => city.quoteCurrency).join(",");
  try {
    const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${symbols}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Rates request failed with ${response.status}`);
    }
    const payload = (await response.json()) as { rates?: Record<string, number> };
    return payload.rates ?? fallbackRates;
  } catch {
    return fallbackRates;
  }
}

async function fetchWeather(city: (typeof marketCities)[number]) {
  const params = new URLSearchParams({
    latitude: city.lat.toString(),
    longitude: city.lon.toString(),
    current: "temperature_2m,weather_code",
    timezone: city.timezone,
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Weather request failed with ${response.status}`);
  }

  const payload = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
    };
  };

  return {
    temperatureC: payload.current?.temperature_2m,
    weatherCode: payload.current?.weather_code,
  };
}

export async function GET(request: NextRequest) {
  const locale = resolveLocale(request.nextUrl.searchParams.get("locale"));
  const fallback = buildFallbackSnapshot(locale);
  const now = new Date();

  try {
    const [rates, weatherResults] = await Promise.all([
      fetchRates(),
      Promise.allSettled(marketCities.map((city) => fetchWeather(city))),
    ]);

    const items: MarketSnapshotItem[] = marketCities.map((city, index) => {
      const fallbackItem = fallback[index];
      const weatherResult = weatherResults[index];
      const liveWeather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
      const weatherCode = liveWeather?.weatherCode ?? fallbackItem.weatherCode;

      return {
        code: city.code,
        city: city.city[locale],
        flag: city.flag,
        quoteCurrency: city.quoteCurrency,
        localTime: new Intl.DateTimeFormat(localeTag(locale), {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: city.timezone,
        }).format(now),
        rate: rates[city.quoteCurrency] ?? fallbackItem.rate,
        temperatureC: liveWeather?.temperatureC ?? fallbackItem.temperatureC,
        weatherCode,
        weatherText: weatherLabel(weatherCode, locale),
      };
    });

    return NextResponse.json(
      {
        updatedAt: now.toISOString(),
        items,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        updatedAt: now.toISOString(),
        items: fallback,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
        },
      },
    );
  }
}
