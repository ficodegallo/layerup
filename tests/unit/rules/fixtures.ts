import type { WeatherData } from '@/types/weather'

export const baseWeather: WeatherData = {
  zip: '10001',
  date: '2024-03-08',
  timezone: 'America/New_York',
  daily: {
    tempMax: 55,
    tempMin: 42,
    feelsLikeMax: 52,
    feelsLikeMin: 39,
    precipProbability: 10,
    precipSum: 0,
    snowfallSum: 0,
    weathercode: 1,
    windspeedMax: 8,
    uvIndexMax: 3,
  },
  hourly: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    precipitation: 0,
    snowfall: 0,
    windspeed: 8,
    relativeHumidity: 55,
  })),
}

export function withConditions(
  overrides: Partial<typeof baseWeather['daily']>
): WeatherData {
  return {
    ...baseWeather,
    daily: { ...baseWeather.daily, ...overrides },
  }
}
