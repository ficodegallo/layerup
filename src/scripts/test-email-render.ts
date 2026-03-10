/**
 * Dev script: render the daily email for any ZIP and output HTML to stdout.
 *
 * Usage:
 *   npm run test:render -- --zip=10001 --date=2024-03-08
 *
 * Then pipe to a file and open in browser:
 *   npm run test:render -- --zip=10001 > /tmp/email-preview.html && open /tmp/email-preview.html
 */

import { PrismaClient } from '@prisma/client'
import { fetchWeather } from '../lib/weather/open-meteo'
import { fetchNWSAlerts } from '../lib/weather/nws-alerts'
import { parseWeatherCache } from '../lib/weather/weather-cache'
import { safetyRule } from '../lib/email/rules/safety'
import { vibeRule } from '../lib/email/rules/vibe'
import { temperatureRule } from '../lib/email/rules/temperature'
import { footwearRule } from '../lib/email/rules/footwear'
import { accessoriesRule } from '../lib/email/rules/accessories'
import { layeringRule } from '../lib/email/rules/layering'
import { renderDailyEmail } from '../lib/email/renderer'

const db = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const zipArg = args.find((a) => a.startsWith('--zip='))?.split('=')[1]
  const dateArg = args.find((a) => a.startsWith('--date='))?.split('=')[1]

  const zip = zipArg ?? '10001'
  const date = dateArg ?? new Date().toISOString().slice(0, 10)

  const zipRow = await db.zipCode.findUnique({ where: { zip } })
  if (!zipRow) {
    console.error(`ZIP code ${zip} not found in database`)
    process.exit(1)
  }

  console.error(`Fetching weather for ${zip} (${zipRow.city}, ${zipRow.state}) on ${date}...`)

  const lat = Number(zipRow.lat)
  const lng = Number(zipRow.lng)

  const [weatherData, alerts] = await Promise.all([
    fetchWeather(lat, lng, zipRow.timezone, date),
    fetchNWSAlerts(lat, lng),
  ])

  const weatherWithAlerts = parseWeatherCache(
    {
      zip,
      date,
      timezone: zipRow.timezone,
      daily: weatherData.daily,
      hourly: weatherData.hourly,
    },
    { alerts }
  )

  const { safetyMode, output: safetyOutput } = safetyRule(weatherWithAlerts.alerts)
  const vibe = vibeRule(weatherWithAlerts, safetyMode)
  const temperature = temperatureRule(weatherWithAlerts, safetyMode)
  const footwear = footwearRule(weatherWithAlerts, safetyMode)
  const accessories = accessoriesRule(weatherWithAlerts, safetyMode)
  const layering = layeringRule(weatherWithAlerts, 'WALK', safetyMode)

  const formattedDate = new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const vibeHeadline = vibe.headline ?? 'Today'
  const subject = safetyMode
    ? `⚠️ Weather Alert — ${zipRow.city} — LayerUp`
    : `${vibeHeadline} in ${zipRow.city} — LayerUp`

  const { html, errors } = renderDailyEmail({
    subscriberId: 'preview',
    email: 'preview@example.com',
    zip,
    city: zipRow.city,
    state: zipRow.state,
    unsubscribeToken: 'preview-token',
    tone: 'MILD',
    lifestyleMode: 'WALK',
    units: 'F',
    dateFor: date,
    formattedDate,
    safetyMode,
    safetyBanner: safetyOutput?.body,
    vibe,
    temperature,
    footwear,
    accessories,
    layering,
    deliveryHour: 7,
    subject,
  })

  if (errors.length > 0) {
    console.error('[MJML warnings]', errors)
  }

  // Output HTML to stdout
  process.stdout.write(html)

  await db.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
