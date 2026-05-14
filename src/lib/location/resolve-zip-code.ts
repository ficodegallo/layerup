import { z } from "zod";

const geocodingResultSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  admin1: z.string().optional(),
  postcodes: z.array(z.string()).optional(),
});

const geocodingResponseSchema = z.object({
  results: z.array(geocodingResultSchema).min(1),
});

export type ResolvedZipLocation = {
  zipCode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  displayName: string;
};

export async function resolveZipCode(
  zipCode: string,
): Promise<ResolvedZipLocation> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", zipCode);
  url.searchParams.set("count", "10");
  url.searchParams.set("countryCode", "US");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 24 * 30 },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo geocoding request failed with ${response.status}.`);
  }

  const parsed = geocodingResponseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error("Open-Meteo geocoding returned an unexpected response.");
  }

  const match =
    parsed.data.results.find((result) => result.postcodes?.includes(zipCode)) ??
    parsed.data.results[0];

  const state = match.admin1 ?? "Unknown";

  return {
    zipCode,
    city: match.name,
    state,
    latitude: match.latitude,
    longitude: match.longitude,
    timeZone: match.timezone,
    displayName: `${match.name}, ${state}`,
  };
}
