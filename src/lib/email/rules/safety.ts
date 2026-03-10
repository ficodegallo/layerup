import type { NWSAlert } from '@/types/weather'
import type { RuleOutput } from '@/types/email'

const SEVERE_SEVERITIES = new Set(['Extreme', 'Severe'])

/**
 * Check NWS alerts for Extreme or Severe conditions.
 * Returns safetyMode=true if any severe alert is active, with a plain-language banner.
 */
export function safetyRule(alerts: NWSAlert[]): {
  safetyMode: boolean
  output: RuleOutput | null
} {
  const severeAlerts = alerts.filter((a) => SEVERE_SEVERITIES.has(a.severity))

  if (severeAlerts.length === 0) {
    return { safetyMode: false, output: null }
  }

  const primary = severeAlerts[0]
  const others = severeAlerts.slice(1)

  let body = `⚠️ ${primary.severity.toUpperCase()} WEATHER ALERT: ${primary.event}. ${primary.headline}`

  if (primary.instruction) {
    body += ` ${primary.instruction}`
  }

  if (others.length > 0) {
    body += ` There ${others.length === 1 ? 'is' : 'are'} ${others.length} additional alert${others.length > 1 ? 's' : ''} in effect.`
  }

  body += ' Check weather.gov for full details and follow official guidance.'

  return {
    safetyMode: true,
    output: {
      headline: 'Safety Alert',
      body,
    },
  }
}
