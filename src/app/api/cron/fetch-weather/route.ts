import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { fetchWeather } from '@/lib/weather/open-meteo'
import { fetchNWSAlerts } from '@/lib/weather/nws-alerts'
import { upsertWeatherCache } from '@/lib/weather/weather-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Authenticate
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = new Date().toISOString().slice(0, 10)

  // Get distinct ZIPs from active subscribers
  const zipRows = await db.subscriber.findMany({
    where: { status: 'ACTIVE' },
    select: { zip: true },
    distinct: ['zip'],
  })

  const uniqueZips = zipRows.map((r: { zip: string }) => r.zip)
  let processed = 0
  const errors: string[] = []

  // Process in batches of 10
  for (let i = 0; i < uniqueZips.length; i += 10) {
    const batch = uniqueZips.slice(i, i + 10)

    const results = await Promise.allSettled(
      batch.map(async (zip: string) => {
        // Look up coordinates
        const zipRow = await db.zipCode.findUnique({ where: { zip } })
        if (!zipRow) {
          console.warn(`ZIP ${zip} not found in zip_codes table`)
          return
        }

        const lat = Number(zipRow.lat)
        const lng = Number(zipRow.lng)
        const timezone = zipRow.timezone

        // Fetch weather + alerts in parallel
        const [weatherResult, alerts] = await Promise.all([
          fetchWeather(lat, lng, timezone, date),
          fetchNWSAlerts(lat, lng),
        ])

        // Store as WeatherData-shaped JSON for easy reconstruction
        const rawJson = {
          zip,
          date,
          timezone,
          daily: weatherResult.daily,
          hourly: weatherResult.hourly,
        }

        await upsertWeatherCache(zip, date, rawJson, alerts.length > 0 ? alerts : null)
        processed++
      })
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Batch item failed:', result.reason)
        errors.push(String(result.reason))
      }
    }

    // Small delay between batches to avoid rate limits
    if (i + 10 < uniqueZips.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return NextResponse.json({
    processed,
    total: uniqueZips.length,
    errors: errors.length,
    date,
  })
}
