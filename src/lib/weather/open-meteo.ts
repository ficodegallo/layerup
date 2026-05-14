import { z } from "zod";

import type { ResolvedZipLocation } from "@/lib/location/resolve-zip-code";
import type {
  PrecipitationType,
  WeatherSnapshot,
} from "@/lib/weather/types";

const precipitationCodes = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82, 95]);
const snowCodes = new Set([71, 73, 75, 77, 85, 86]);
const iceCodes = new Set([56, 57, 66, 67]);

const openMeteoResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  daily: z.object({
    time: z.array(z.string()).min(1),
    temperature_2m_max: z.array(z.number()).min(1),
    temperature_2m_min: z.array(z.number()).min(1),
    apparent_temperature_max: z.array(z.number()).min(1),
    apparent_temperature_min: z.array(z.number()).min(1),
    precipitation_probability_max: z.array(z.number()).min(1),
    wind_speed_10m_max: z.array(z.number()).min(1),
    uv_index_max: z.array(z.number()).min(1),
    dew_point_2m_mean: z.array(z.number()).min(1),
    relative_humidity_2m_mean: z.array(z.number()).min(1),
    cloud_cover_mean: z.array(z.number()).min(1),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    precipitation_probability: z.array(z.number()),
    precipitation: z.array(z.number()),
    rain: z.array(z.number()),
    snowfall: z.array(z.number()),
    weather_code: z.array(z.number()),
    snow_depth: z.array(z.number()),
  }),
});

type OpenMeteoHour = {
  time: string;
  precipitationProbability: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  weatherCode: number;
  snowDepth: number;
};

function hasPrecipitationSignal(hour: OpenMeteoHour) {
  return (
    hour.precipitationProbability >= 30 ||
    hour.precipitation > 0.01 ||
    precipitationCodes.has(hour.weatherCode) ||
    snowCodes.has(hour.weatherCode) ||
    iceCodes.has(hour.weatherCode)
  );
}

function derivePrecipitationType(
  hours: OpenMeteoHour[],
  dailyPrecipitationProbability: number,
): PrecipitationType {
  const hasSnow = hours.some(
    (hour) => hour.snowfall > 0.01 || snowCodes.has(hour.weatherCode),
  );
  const hasIce = hours.some((hour) => iceCodes.has(hour.weatherCode));
  const hasRain = hours.some(
    (hour) =>
      hour.rain > 0.01 ||
      hour.precipitation > 0.01 ||
      precipitationCodes.has(hour.weatherCode),
  );

  if (hasIce) {
    return "ice";
  }

  if (hasSnow && hasRain) {
    return "mixed";
  }

  if (hasSnow) {
    return "snow";
  }

  if (hasRain || dailyPrecipitationProbability >= 30) {
    return "rain";
  }

  return "none";
}

function derivePrecipitationWindow(hours: OpenMeteoHour[]) {
  const precipHours = hours.filter(hasPrecipitationSignal);

  if (precipHours.length === 0) {
    return undefined;
  }

  const startHourLocal = Number(precipHours[0].time.slice(11, 13));
  const lastHour = Number(precipHours[precipHours.length - 1].time.slice(11, 13));

  return {
    startHourLocal,
    endHourLocal: Math.min(lastHour + 1, 23),
  };
}

export async function fetchOpenMeteoWeatherSnapshot(
  location: ResolvedZipLocation,
): Promise<WeatherSnapshot> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "uv_index_max",
      "dew_point_2m_mean",
      "relative_humidity_2m_mean",
      "cloud_cover_mean",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    [
      "precipitation_probability",
      "precipitation",
      "rain",
      "snowfall",
      "weather_code",
      "snow_depth",
    ].join(","),
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("timezone", location.timeZone);
  url.searchParams.set("forecast_days", "2");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 60 * 30 },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo forecast request failed with ${response.status}.`);
  }

  const parsed = openMeteoResponseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error("Open-Meteo forecast returned an unexpected response.");
  }

  const daily = parsed.data.daily;
  const forecastDate = daily.time[0];

  const todayHours = parsed.data.hourly.time
    .map<OpenMeteoHour>((time, index) => ({
      time,
      precipitationProbability:
        parsed.data.hourly.precipitation_probability[index] ?? 0,
      precipitation: parsed.data.hourly.precipitation[index] ?? 0,
      rain: parsed.data.hourly.rain[index] ?? 0,
      snowfall: parsed.data.hourly.snowfall[index] ?? 0,
      weatherCode: parsed.data.hourly.weather_code[index] ?? 0,
      snowDepth: parsed.data.hourly.snow_depth[index] ?? 0,
    }))
    .filter((hour) => hour.time.startsWith(forecastDate));

  return {
    zipCode: location.zipCode,
    locationName: location.displayName,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    timeZone: parsed.data.timezone,
    forecastDate,
    temperatureHighF: Math.round(daily.temperature_2m_max[0]),
    temperatureLowF: Math.round(daily.temperature_2m_min[0]),
    feelsLikeHighF: Math.round(daily.apparent_temperature_max[0]),
    feelsLikeLowF: Math.round(daily.apparent_temperature_min[0]),
    precipitationProbability: Math.round(daily.precipitation_probability_max[0]),
    precipitationType: derivePrecipitationType(
      todayHours,
      daily.precipitation_probability_max[0],
    ),
    precipitationWindow: derivePrecipitationWindow(todayHours),
    windMph: Math.round(daily.wind_speed_10m_max[0]),
    uvIndex: Math.round(daily.uv_index_max[0]),
    humidityPercent: Math.round(daily.relative_humidity_2m_mean[0]),
    cloudCoverPercent: Math.round(daily.cloud_cover_mean[0]),
    dewPointF: Math.round(daily.dew_point_2m_mean[0]),
    hasSnowOnGround: todayHours.some(
      (hour) => hour.snowDepth > 0.01 || hour.snowfall > 0.01,
    ),
    nwsAlert: null,
  };
}
