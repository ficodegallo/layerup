import tzlookup from 'tz-lookup'

/**
 * Resolve IANA timezone from lat/lng coordinates.
 * Falls back to 'America/New_York' if lookup fails.
 */
export function coordsToTimezone(lat: number, lng: number): string {
  try {
    return tzlookup(lat, lng)
  } catch {
    return 'America/New_York'
  }
}
