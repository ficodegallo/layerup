export interface WeatherDaily {
  tempMax: number          // Celsius or Fahrenheit depending on unit param
  tempMin: number
  feelsLikeMax: number
  feelsLikeMin: number
  precipProbability: number  // 0-100 %
  precipSum: number          // mm
  snowfallSum: number        // cm
  weathercode: number        // WMO code
  windspeedMax: number       // km/h
  uvIndexMax: number
}

export interface WeatherHourly {
  hour: number               // 0-23 local time
  precipitation: number      // mm
  snowfall: number           // cm
  windspeed: number          // km/h
  relativeHumidity: number   // %
}

export interface WeatherData {
  zip: string
  date: string               // YYYY-MM-DD, the day this data is FOR
  timezone: string           // IANA timezone
  daily: WeatherDaily
  hourly: WeatherHourly[]    // 24 entries
}

export interface NWSAlert {
  id: string
  event: string
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'
  headline: string
  description: string
  instruction?: string
  onset?: string
  expires?: string
}

export interface WeatherWithAlerts extends WeatherData {
  alerts: NWSAlert[]
}
