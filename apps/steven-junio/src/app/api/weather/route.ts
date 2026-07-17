import { NextResponse } from "next/server";
import {
  buildWeatherSnapshot,
  FALLBACK_WEATHER,
  type NwsGridData,
  type NwsObservation,
} from "../../components/skyScene/weather";
import { PORTFOLIO_COORDINATES } from "../../components/skyScene/location";

const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent":
    "stevenjunio.com weather scene (https://www.stevenjunio.com/contact)",
};

type NwsFeature<T = Record<string, unknown>> = {
  properties?: T;
};

type NwsPointMetadata = {
  forecastGridData?: string;
  observationStations?: string;
};

type NwsStationMetadata = {
  stationIdentifier?: string;
};

type NwsFeatureCollection<T> = {
  features?: Array<NwsFeature<T>>;
};

async function fetchNwsJson<T>(
  url: string,
  revalidate: number,
): Promise<T> {
  const response = await fetch(url, {
    headers: NWS_HEADERS,
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`NWS request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function GET() {
  try {
    const point = await fetchNwsJson<NwsFeature<NwsPointMetadata>>(
      `https://api.weather.gov/points/${PORTFOLIO_COORDINATES}`,
      86_400,
    );
    const forecastGridData = point.properties?.forecastGridData;
    const observationStations = point.properties?.observationStations;

    if (
      typeof forecastGridData !== "string" ||
      typeof observationStations !== "string"
    ) {
      throw new Error("NWS point metadata is incomplete.");
    }

    const stations = await fetchNwsJson<
      NwsFeatureCollection<NwsStationMetadata>
    >(observationStations, 86_400);
    const stationFeatures = stations.features;
    const stationId = stationFeatures?.[0]?.properties?.stationIdentifier;

    if (typeof stationId !== "string") {
      throw new Error("NWS observation station is unavailable.");
    }

    const [observationResult, gridResult] = await Promise.allSettled([
      fetchNwsJson<NwsFeature<NwsObservation>>(
        `https://api.weather.gov/stations/${stationId}/observations/latest`,
        300,
      ),
      fetchNwsJson<NwsFeature<NwsGridData>>(forecastGridData, 3_600),
    ]);
    const observation: NwsObservation | null =
      observationResult.status === "fulfilled"
        ? observationResult.value.properties ?? null
        : null;
    const grid: NwsGridData | null =
      gridResult.status === "fulfilled"
        ? gridResult.value.properties ?? null
        : null;

    if (!observation && !grid) {
      throw new Error("NWS weather data is unavailable.");
    }

    return NextResponse.json(buildWeatherSnapshot(observation, grid), {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    });
  } catch {
    return NextResponse.json(FALLBACK_WEATHER, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600",
      },
    });
  }
}
