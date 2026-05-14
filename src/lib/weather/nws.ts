import { z } from "zod";

import type { ResolvedZipLocation } from "@/lib/location/resolve-zip-code";
import type { WeatherAlert } from "@/lib/weather/types";

const nwsAlertsResponseSchema = z.object({
  features: z
    .array(
      z.object({
        properties: z.object({
          event: z.string(),
          severity: z.string().nullable().optional(),
          headline: z.string().optional(),
          description: z.string().optional(),
          instruction: z.string().nullable().optional(),
        }),
      }),
    )
    .default([]),
});

const severityRank: Record<string, number> = {
  extreme: 4,
  severe: 3,
  moderate: 2,
  minor: 1,
  unknown: 0,
};

export async function fetchNwsActiveAlert(
  location: ResolvedZipLocation,
): Promise<WeatherAlert | null> {
  const url = new URL("https://api.weather.gov/alerts/active");
  url.searchParams.set("point", `${location.latitude},${location.longitude}`);

  const response = await fetch(url, {
    headers: {
      Accept: "application/geo+json",
      "User-Agent":
        process.env.NWS_API_USER_AGENT ?? "LayerUp/0.1 (local development)",
    },
    next: { revalidate: 60 * 5 },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`NWS alerts request failed with ${response.status}.`);
  }

  const parsed = nwsAlertsResponseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error("NWS alerts returned an unexpected response.");
  }

  const bestMatch = [...parsed.data.features].sort((left, right) => {
    const leftSeverity =
      severityRank[left.properties.severity?.toLowerCase() ?? "unknown"] ?? 0;
    const rightSeverity =
      severityRank[right.properties.severity?.toLowerCase() ?? "unknown"] ?? 0;

    return rightSeverity - leftSeverity;
  })[0];

  if (!bestMatch) {
    return null;
  }

  return {
    event: bestMatch.properties.event,
    severity: bestMatch.properties.severity ?? "Unknown",
    headline:
      bestMatch.properties.headline ??
      bestMatch.properties.description ??
      bestMatch.properties.event,
    instruction: bestMatch.properties.instruction,
  };
}
