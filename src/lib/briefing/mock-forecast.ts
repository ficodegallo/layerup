import type { WeatherSnapshot } from "@/lib/weather/types";

export const mockForecast: WeatherSnapshot = {
  zipCode: "60618",
  locationName: "Chicago, Illinois",
  latitude: 41.938786,
  longitude: -87.714,
  timeZone: "America/Chicago",
  forecastDate: "2026-03-11",
  temperatureHighF: 31,
  temperatureLowF: 23,
  feelsLikeHighF: 22,
  feelsLikeLowF: 15,
  precipitationProbability: 55,
  precipitationType: "snow",
  precipitationWindow: {
    startHourLocal: 15,
    endHourLocal: 19,
  },
  windMph: 17,
  uvIndex: 4,
  humidityPercent: 58,
  cloudCoverPercent: 46,
  dewPointF: 26,
  hasSnowOnGround: true,
  nwsAlert: null,
};
