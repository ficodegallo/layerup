import { db } from '@/lib/db'

export interface ZipInfo {
  zip: string
  city: string
  state: string
  lat: number
  lng: number
  timezone: string
}

/**
 * Look up a ZIP code in the database.
 * Returns null if the ZIP is not found (i.e., invalid).
 */
export async function zipToCoords(zip: string): Promise<ZipInfo | null> {
  const normalized = zip.trim().padStart(5, '0').substring(0, 5)

  const row = await db.zipCode.findUnique({
    where: { zip: normalized },
  })

  if (!row) return null

  return {
    zip: row.zip,
    city: row.city,
    state: row.state,
    lat: Number(row.lat),
    lng: Number(row.lng),
    timezone: row.timezone,
  }
}
