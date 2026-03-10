import { db } from '@/lib/db'
import { getWeatherCache, parseWeatherCache } from '@/lib/weather/weather-cache'
import { safetyRule } from './rules/safety'
import { vibeRule } from './rules/vibe'
import { temperatureRule } from './rules/temperature'
import { footwearRule } from './rules/footwear'
import { accessoriesRule } from './rules/accessories'
import { layeringRule } from './rules/layering'
import { renderDailyEmail, assertNoUnreplacedVars } from './renderer'
import { sendDailyEmail } from './sendgrid'
import type { EmailPayload } from '@/types/email'
import type { LifestyleMode, Tone, Units } from '@/types/subscriber'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function buildSubjectLine(payload: Omit<EmailPayload, 'subject'>): string {
  if (payload.safetyMode) {
    return `⚠️ Weather Alert — ${payload.city} — LayerUp`
  }
  const vibeHead = payload.vibe.headline ?? 'Your weather'
  return `${vibeHead} in ${payload.city} — LayerUp`
}

interface EngineResult {
  success: boolean
  sendgridMsgId?: string
  error?: string
}

/**
 * Central orchestrator: load subscriber + weather → run rules → render → send.
 * Returns a result object so the cron can log success/failure without crashing.
 */
export async function processAndSendEmail(
  subscriberId: string,
  dateFor: string
): Promise<EngineResult> {
  // 1. Load subscriber + preferences
  const subscriber = await db.subscriber.findUnique({
    where: { id: subscriberId },
    include: { preferences: true },
  })

  if (!subscriber || subscriber.status !== 'ACTIVE') {
    return { success: false, error: 'Subscriber not found or not active' }
  }

  // 2. Load zip info
  const zipRow = await db.zipCode.findUnique({ where: { zip: subscriber.zip } })
  if (!zipRow) {
    return { success: false, error: `ZIP code ${subscriber.zip} not found` }
  }

  // 3. Load weather cache
  const cached = await getWeatherCache(subscriber.zip, dateFor)
  if (!cached) {
    return { success: false, error: `No weather cache for ${subscriber.zip} on ${dateFor}` }
  }

  // 4. Parse weather + alerts
  const weatherWithAlerts = parseWeatherCache(cached.rawJson, cached.nwsAlertsJson)

  // 5. Get preferences (use defaults if no preferences row)
  const prefs = subscriber.preferences
  const tone: Tone = (prefs?.tone as Tone) ?? 'MILD'
  const lifestyleMode: LifestyleMode = (prefs?.lifestyleMode as LifestyleMode) ?? 'WALK'
  const units: Units = (prefs?.units as Units) ?? 'F'

  // 6. Run rules
  const { safetyMode, output: safetyOutput } = safetyRule(weatherWithAlerts.alerts)
  const vibe = vibeRule(weatherWithAlerts, safetyMode)
  const temperature = temperatureRule(weatherWithAlerts, safetyMode)
  const footwear = footwearRule(weatherWithAlerts, safetyMode)
  const accessories = accessoriesRule(weatherWithAlerts, safetyMode)
  const layering = layeringRule(weatherWithAlerts, lifestyleMode, safetyMode)

  // 7. Assemble payload (without subject first)
  const payloadBase: Omit<EmailPayload, 'subject'> = {
    subscriberId: subscriber.id,
    email: subscriber.email,
    name: subscriber.name,
    zip: subscriber.zip,
    city: zipRow.city,
    state: zipRow.state,
    unsubscribeToken: subscriber.unsubscribeToken,
    preferencesToken: subscriber.magicToken,
    tone,
    lifestyleMode,
    units,
    dateFor,
    formattedDate: formatDate(dateFor),
    safetyMode,
    safetyBanner: safetyOutput?.body,
    vibe,
    temperature,
    footwear,
    accessories,
    layering,
    deliveryHour: subscriber.deliveryHour,
  }

  const payload: EmailPayload = {
    ...payloadBase,
    subject: buildSubjectLine(payloadBase),
  }

  // 8. Render
  const { html, errors: renderErrors } = renderDailyEmail(payload)

  if (renderErrors.length > 0) {
    console.warn('[engine] MJML render warnings:', renderErrors)
  }

  try {
    assertNoUnreplacedVars(html)
  } catch (err) {
    return { success: false, error: String(err) }
  }

  // 9. Send via SendGrid
  const msgId = await sendDailyEmail({
    to: subscriber.email,
    subject: payload.subject,
    html,
    subscriberId: subscriber.id,
    dateFor,
  })

  return { success: true, sendgridMsgId: msgId ?? undefined }
}
