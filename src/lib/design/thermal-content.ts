import type { DailyBrief } from "@/lib/briefing/types";
import type { WeatherSnapshot } from "@/lib/weather/types";

function sentenceCase(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function ensureTerminalPunctuation(value: string) {
  if (!value) {
    return value;
  }

  return /[.!?]$/.test(value) ? value : `${value}.`;
}

export function getThermalHeroHeading(brief: DailyBrief) {
  if (brief.safetyMode.active) {
    return brief.safetyMode.headline ?? "Weather alert in effect.";
  }

  return ensureTerminalPunctuation(sentenceCase(brief.temperatureTranslation.label));
}

export function getThermalFeelsLikeLabel(
  brief: DailyBrief,
  weatherSnapshot: WeatherSnapshot,
) {
  const gap = Math.abs(brief.temperatureTranslation.feelsLikeGap);

  if (gap >= 8 || weatherSnapshot.windMph >= 14) {
    return `FEELS LIKE ${weatherSnapshot.feelsLikeHighF}°F WITH WIND`;
  }

  return `FEELS LIKE ${weatherSnapshot.feelsLikeHighF}°F`;
}
