import type { WeatherData } from '@/types/weather'
import type { RuleOutput } from '@/types/email'

interface FootwearRec {
  recommendation: string
  reason: string
}

function selectFootwear(weather: WeatherData): FootwearRec {
  const { snowfallSum, precipProbability, tempMax, tempMin } = weather.daily

  // Precedence ladder — first match wins
  if (snowfallSum >= 1) {
    return {
      recommendation: 'waterproof winter boots',
      reason: `Snow expected (${Math.round(snowfallSum)}" accumulation).`,
    }
  }

  if (precipProbability >= 70) {
    return {
      recommendation: 'rain boots or waterproof shoes',
      reason: `${precipProbability}% chance of rain — waterproof footwear is the call.`,
    }
  }

  if (precipProbability >= 40) {
    return {
      recommendation: 'water-resistant shoes',
      reason: `${precipProbability}% chance of rain. Water-resistant is smart.`,
    }
  }

  if (tempMin < 32) {
    return {
      recommendation: 'insulated boots or warm shoes',
      reason: `Temps dip to ${Math.round(tempMin)}°F — your feet will thank you.`,
    }
  }

  if (tempMax >= 75 && precipProbability < 20) {
    return {
      recommendation: 'sneakers or sandals',
      reason: 'Nice day. Open footwear is fair game.',
    }
  }

  return {
    recommendation: 'everyday sneakers',
    reason: 'Standard conditions. Any reasonable footwear works.',
  }
}

export function footwearRule(weather: WeatherData, safetyMode = false): RuleOutput {
  const rec = selectFootwear(weather)

  if (safetyMode) {
    return {
      headline: 'Footwear',
      body: `Wear ${rec.recommendation}. ${rec.reason}`,
    }
  }

  return {
    headline: 'Footwear',
    body: `${rec.recommendation.charAt(0).toUpperCase() + rec.recommendation.slice(1)}. ${rec.reason}`,
  }
}
