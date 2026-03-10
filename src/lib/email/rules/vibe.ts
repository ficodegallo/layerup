import type { WeatherData } from '@/types/weather'
import type { RuleOutput } from '@/types/email'
import { VIBE_ARCHETYPES, selectVibe, getVibeVariant } from '@/lib/content/vibes'

export function vibeRule(weather: WeatherData, safetyMode = false): RuleOutput {
  if (safetyMode) {
    return {
      headline: 'Severe Weather Alert',
      body: 'There are active severe weather alerts in your area. Check the NWS for the latest updates before heading out.',
    }
  }

  const archetype = selectVibe(weather.daily, weather.date, weather.zip)
  const variant = getVibeVariant(archetype, weather.date, weather.zip)

  return {
    headline: archetype.label,
    body: variant,
  }
}
