import type { WeatherDaily, WeatherHourly } from '@/types/weather'

export async function fetchWeather(
  lat: number,
  lng: number,
  timezone: string,
  date: string // YYYY-MM-DD
): Promise<{ daily: WeatherDaily; hourly: WeatherHourly[] }> {
  const nextDay = new Date(date + 'T00:00:00Z')
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  const endDate = nextDay.toISOString().slice(0, 10)

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    timezone,
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'snowfall_sum',
      'weathercode',
      'windspeed_10m_max',
      'uv_index_max',
    ].join(','),
    hourly: [
      'precipitation',
      'snowfall',
      'windspeed_10m',
      'relativehumidity_2m',
    ].join(','),
    temperature_unit: 'fahrenheit',
    windspeed_unit: 'mph',
    precipitation_unit: 'inch',
    forecast_days: '2',
    start_date: date,
    end_date: endDate,
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`,
      { signal: controller.signal, next: { revalidate: 0 } } as RequestInit
    )

    if (!res.ok) {
      throw new Error(`Open-Meteo responded ${res.status}: ${await res.text()}`)
    }

    const json = await res.json()

    const daily: WeatherDaily = {
      tempMax: json.daily.temperature_2m_max[0],
      tempMin: json.daily.temperature_2m_min[0],
      feelsLikeMax: json.daily.apparent_temperature_max[0],
      feelsLikeMin: json.daily.apparent_temperature_min[0],
      precipProbability: json.daily.precipitation_probability_max[0],
      precipSum: json.daily.precipitation_sum[0],
      snowfallSum: json.daily.snowfall_sum[0],
      weathercode: json.daily.weathercode[0],
      windspeedMax: json.daily.windspeed_10m_max[0],
      uvIndexMax: json.daily.uv_index_max[0],
    }

    // Extract today's 24 hours (indices 0-23)
    const hourly: WeatherHourly[] = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      precipitation: json.hourly.precipitation[i],
      snowfall: json.hourly.snowfall[i],
      windspeed: json.hourly.windspeed_10m[i],
      relativeHumidity: json.hourly.relativehumidity_2m[i],
    }))

    return { daily, hourly }
  } finally {
    clearTimeout(timeout)
  }
}
