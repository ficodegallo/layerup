import type { WeatherData } from '@/types/weather'
import type { RuleOutput } from '@/types/email'
import { getAccessoryComment } from '@/lib/content/accessory-comments'

interface AccessoryTrigger {
  item: string
  trigger: string
  condition: (w: WeatherData) => boolean
}

const ACCESSORY_TRIGGERS: AccessoryTrigger[] = [
  {
    item: 'umbrella',
    trigger: 'rain',
    condition: (w) => w.daily.precipProbability >= 40,
  },
  {
    item: 'sunglasses',
    trigger: 'sun',
    condition: (w) => w.daily.uvIndexMax >= 3 && w.daily.precipProbability < 50,
  },
  {
    item: 'sunscreen',
    trigger: 'sun',
    condition: (w) => w.daily.uvIndexMax >= 6,
  },
  {
    item: 'gloves',
    trigger: 'cold',
    condition: (w) => w.daily.tempMin < 35,
  },
  {
    item: 'hat',
    trigger: 'cold',
    condition: (w) => w.daily.tempMin < 32 || w.daily.windspeedMax >= 20,
  },
  {
    item: 'scarf',
    trigger: 'wind',
    condition: (w) => w.daily.windspeedMax >= 25 || w.daily.tempMax < 28,
  },
]

export function accessoriesRule(weather: WeatherData, safetyMode = false): RuleOutput {
  const triggered = ACCESSORY_TRIGGERS.filter((t) => t.condition(weather))

  if (triggered.length === 0) {
    return {
      headline: 'Accessories',
      body: 'Nothing special needed today. Go as-is.',
    }
  }

  const lines = triggered.map((t) =>
    getAccessoryComment(t.item, t.trigger, weather.date, weather.zip)
  )

  return {
    headline: 'Accessories',
    body: lines.join(' '),
  }
}
