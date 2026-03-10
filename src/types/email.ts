import type { Tone, LifestyleMode, Units } from './subscriber'

export interface RuleOutput {
  headline?: string
  body: string
  safeMode?: boolean    // forces plain-language copy, no humor
}

export interface EmailPayload {
  // Subscriber context
  subscriberId: string
  email: string
  name?: string | null
  zip: string
  city: string
  state: string
  unsubscribeToken: string
  preferencesToken?: string | null

  // Preferences
  tone: Tone
  lifestyleMode: LifestyleMode
  units: Units

  // Date
  dateFor: string           // YYYY-MM-DD
  formattedDate: string     // e.g. "Monday, March 8"

  // Safety mode
  safetyMode: boolean
  safetyBanner?: string     // shown when safetyMode=true

  // Rule outputs
  vibe: RuleOutput
  temperature: RuleOutput
  footwear: RuleOutput
  accessories: RuleOutput
  layering: RuleOutput

  // Delivery
  deliveryHour: number

  // Weather summary (for email subject line)
  subject: string
}
