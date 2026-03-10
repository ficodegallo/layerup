import { db } from '@/lib/db'
import type { WeatherWithAlerts, WeatherDaily, WeatherHourly, NWSAlert } from '@/types/weather'

export async function upsertWeatherCache(
  zip: string,
  date: string,
  rawJson: object,
  nwsAlertsJson?: object | null
): Promise<void> {
  const fetchedForDate = new Date(date + 'T00:00:00Z')

  await db.weatherCache.upsert({
    where: {
      zip_fetchedForDate: { zip, fetchedForDate },
    },
    create: {
      zip,
      fetchedForDate,
      rawJson: rawJson as any,
      nwsAlertsJson: nwsAlertsJson as any ?? undefined,
    },
    update: {
      rawJson: rawJson as any,
      nwsAlertsJson: nwsAlertsJson as any ?? undefined,
      fetchedAt: new Date(),
    },
  })
}

export async function getWeatherCache(
  zip: string,
  date: string
): Promise<{ rawJson: any; nwsAlertsJson: any } | null> {
  const fetchedForDate = new Date(date + 'T00:00:00Z')

  const row = await db.weatherCache.findUnique({
    where: {
      zip_fetchedForDate: { zip, fetchedForDate },
    },
  })

  if (!row) return null

  return {
    rawJson: row.rawJson,
    nwsAlertsJson: row.nwsAlertsJson,
  }
}

export function parseWeatherCache(
  rawJson: any,
  nwsAlertsJson: any
): WeatherWithAlerts {
  const data = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson

  const daily: WeatherDaily = {
    tempMax: data.daily.tempMax,
    tempMin: data.daily.tempMin,
    feelsLikeMax: data.daily.feelsLikeMax,
    feelsLikeMin: data.daily.feelsLikeMin,
    precipProbability: data.daily.precipProbability,
    precipSum: data.daily.precipSum,
    snowfallSum: data.daily.snowfallSum,
    weathercode: data.daily.weathercode,
    windspeedMax: data.daily.windspeedMax,
    uvIndexMax: data.daily.uvIndexMax,
  }

  const hourly: WeatherHourly[] = (data.hourly as any[]).map((h: any) => ({
    hour: h.hour,
    precipitation: h.precipitation,
    snowfall: h.snowfall,
    windspeed: h.windspeed,
    relativeHumidity: h.relativeHumidity,
  }))

  const alerts: NWSAlert[] = nwsAlertsJson
    ? (Array.isArray(nwsAlertsJson) ? nwsAlertsJson : []).map((a: any) => ({
        id: a.id,
        event: a.event,
        severity: a.severity,
        headline: a.headline,
        description: a.description,
        instruction: a.instruction,
        onset: a.onset,
        expires: a.expires,
      }))
    : []

  return {
    zip: data.zip,
    date: data.date,
    timezone: data.timezone,
    daily,
    hourly,
    alerts,
  }
}
