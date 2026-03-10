/**
 * Dev script: send a real test email to yourself.
 *
 * Usage:
 *   npm run test:send -- --zip=10001 --to=you@example.com
 *
 * Requires SENDGRID_API_KEY and SENDGRID_FROM_EMAIL to be set in .env.
 * Note: In development, sandbox mode is enabled by default (email won't actually deliver).
 * Set NODE_ENV=production to send for real (use with caution!).
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
import { sendDailyEmail } from '../lib/email/sendgrid'

// Load .env
import { config } from 'dotenv'
config({ path: '.env.local' })

const db = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const zipArg = args.find((a) => a.startsWith('--zip='))?.split('=')[1]
  const toArg = args.find((a) => a.startsWith('--to='))?.split('=')[1]

  const zip = zipArg ?? '10001'
  const to = toArg

  if (!to) {
    console.error('Usage: npm run test:send -- --zip=10001 --to=you@example.com')
    process.exit(1)
  }

  const zipRow = await db.zipCode.findUnique({ where: { zip } })
  if (!zipRow) {
    console.error(`ZIP code ${zip} not found`)
    process.exit(1)
  }

  const date = new Date().toISOString().slice(0, 10)
  const lat = Number(zipRow.lat)
  const lng = Number(zipRow.lng)

  console.log(`Fetching weather for ${zip} (${zipRow.city}, ${zipRow.state})...`)

  const [weatherData, alerts] = await Promise.all([
    fetchWeather(lat, lng, zipRow.timezone, date),
    fetchNWSAlerts(lat, lng),
  ])

  const weatherWithAlerts = parseWeatherCache(
    { zip, date, timezone: zipRow.timezone, daily: weatherData.daily, hourly: weatherData.hourly },
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

  const subject = safetyMode
    ? `⚠️ Weather Alert — ${zipRow.city} — LayerUp`
    : `${vibe.headline ?? 'Today'} in ${zipRow.city} — LayerUp`

  const { html, errors } = renderDailyEmail({
    subscriberId: 'test',
    email: to,
    zip,
    city: zipRow.city,
    state: zipRow.state,
    unsubscribeToken: 'test-token',
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
    console.warn('[MJML warnings]', errors)
  }

  console.log(`Sending test email to ${to}...`)
  console.log(`(Sandbox mode: ${process.env.NODE_ENV !== 'production'})`)

  await sendDailyEmail({
    to,
    subject,
    html,
    subscriberId: 'test',
    dateFor: date,
  })

  console.log('Done!')
  await db.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
