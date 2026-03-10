import type { NWSAlert } from '@/types/weather'

export async function fetchNWSAlerts(
  lat: number,
  lng: number
): Promise<NWSAlert[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(
      `https://api.weather.gov/alerts/active?point=${lat},${lng}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'LayerUp/1.0 (hello@layerup.email)',
          Accept: 'application/geo+json',
        },
        next: { revalidate: 0 },
      } as RequestInit
    )

    if (!res.ok) {
      console.error(`NWS alerts responded ${res.status} for ${lat},${lng}`)
      return []
    }

    const json = await res.json()

    if (!json.features || !Array.isArray(json.features)) {
      return []
    }

    return json.features.map((f: any) => {
      const p = f.properties
      return {
        id: f.id ?? p.id ?? '',
        event: p.event ?? '',
        severity: p.severity ?? 'Unknown',
        headline: p.headline ?? '',
        description: p.description ?? '',
        instruction: p.instruction ?? undefined,
        onset: p.onset ?? undefined,
        expires: p.expires ?? undefined,
      } satisfies NWSAlert
    })
  } catch (err) {
    console.error(`Failed to fetch NWS alerts for ${lat},${lng}:`, err)
    return []
  } finally {
    clearTimeout(timeout)
  }
}
