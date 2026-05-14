export type PrecipitationType = "none" | "rain" | "snow" | "ice" | "mixed";

export type WeatherAlert = {
  event: string;
  severity: string;
  headline: string;
  instruction?: string | null;
};

export type WeatherSnapshot = {
  zipCode: string;
  locationName: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  forecastDate: string;
  temperatureHighF: number;
  temperatureLowF: number;
  feelsLikeHighF: number;
  feelsLikeLowF: number;
  precipitationProbability: number;
  precipitationType: PrecipitationType;
  precipitationWindow?: {
    startHourLocal: number;
    endHourLocal: number;
  };
  windMph: number;
  uvIndex: number;
  humidityPercent: number;
  cloudCoverPercent: number;
  dewPointF: number;
  hasSnowOnGround: boolean;
  nwsAlert?: WeatherAlert | null;
};
