import { resolveZipCode } from "@/lib/location/resolve-zip-code";
import { fetchNwsActiveAlert } from "@/lib/weather/nws";
import { fetchOpenMeteoWeatherSnapshot } from "@/lib/weather/open-meteo";

export async function getLiveWeatherSnapshot(zipCode: string) {
  const location = await resolveZipCode(zipCode);
  const [forecastSnapshot, nwsAlert] = await Promise.all([
    fetchOpenMeteoWeatherSnapshot(location),
    fetchNwsActiveAlert(location).catch(() => null),
  ]);

  return {
    ...forecastSnapshot,
    nwsAlert,
  };
}
