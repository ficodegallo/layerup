import mjml from 'mjml'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { EmailPayload } from '@/types/email'

const TEMPLATES_DIR = join(process.cwd(), 'src', 'templates')

function loadTemplate(name: string): string {
  return readFileSync(join(TEMPLATES_DIR, name), 'utf-8')
}

/**
 * Simple {{variable}} substitution. Handles {{#if bool}}...{{/if}}
 * and {{#unless bool}}...{{/unless}} blocks.
 */
function injectVariables(template: string, vars: Record<string, string | boolean | number>): string {
  let result = template

  // Handle {{#if var}}...{{/if}} blocks
  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
    return vars[key] ? content : ''
  })

  // Handle {{#unless var}}...{{/unless}} blocks
  result = result.replace(/\{\{#unless (\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (_, key, content) => {
    return !vars[key] ? content : ''
  })

  // Handle simple {{variable}} substitutions
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key]
    if (val === undefined || val === null) return ''
    return String(val)
  })

  return result
}

export interface RenderResult {
  html: string
  errors: string[]
}

export function renderDailyEmail(payload: EmailPayload): RenderResult {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://layerup.email'

  const vars: Record<string, string | boolean | number> = {
    formattedDate: payload.formattedDate,
    city: payload.city,
    state: payload.state,
    zip: payload.zip,
    deliveryHour: payload.deliveryHour,

    // Vibe
    vibeHeadline: payload.vibe.headline ?? '',
    vibeBody: payload.vibe.body,

    // Safety
    safetyMode: payload.safetyMode,
    safetyBanner: payload.safetyBanner ?? '',

    // Temperature
    temperatureBody: payload.temperature.body,

    // Footwear
    footwearBody: payload.footwear.body,

    // Layering
    layeringBody: payload.layering.body,

    // Accessories
    accessoriesBody: payload.accessories.body,

    // Footer links
    unsubscribeUrl: `${baseUrl}/unsubscribe/${payload.unsubscribeToken}`,
    baseUrl,
  }

  const template = loadTemplate('daily-email.mjml')
  const populated = injectVariables(template, vars)

  const { html, errors } = mjml(populated, {
    validationLevel: 'soft',
    minify: false,
  })

  return {
    html,
    errors: errors.map((e) => e.formattedMessage ?? String(e)),
  }
}

export function renderConfirmEmail(vars: {
  name?: string | null
  confirmUrl: string
  baseUrl?: string
}): RenderResult {
  const baseUrl = vars.baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'https://layerup.email'

  const template = loadTemplate('confirm-email.mjml')
  const populated = injectVariables(template, {
    name: vars.name ?? 'there',
    confirmUrl: vars.confirmUrl,
    baseUrl,
  })

  const { html, errors } = mjml(populated, {
    validationLevel: 'soft',
    minify: false,
  })

  return {
    html,
    errors: errors.map((e) => e.formattedMessage ?? String(e)),
  }
}

/** Guard: assert no un-replaced placeholders remain in the HTML */
export function assertNoUnreplacedVars(html: string): void {
  const match = html.match(/\{\{[^}]+\}\}/)
  if (match) {
    throw new Error(`Unreplaced template variable: ${match[0]}`)
  }
}
