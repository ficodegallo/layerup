import type { WeatherData } from '@/types/weather'
import type { RuleOutput } from '@/types/email'
import { tempToLabel, feelsLikeDivergenceNote } from '@/lib/content/colloquial-temps'

export function temperatureRule(weather: WeatherData, safetyMode = false): RuleOutput {
  const { tempMax, tempMin, feelsLikeMax, feelsLikeMin } = weather.daily

  const highLabel = tempToLabel(tempMax)
  const lowLabel = tempToLabel(tempMin)

  const highNote = feelsLikeDivergenceNote(tempMax, feelsLikeMax)
  const lowNote = feelsLikeDivergenceNote(tempMin, feelsLikeMin)

  const highStr = `High of ${Math.round(tempMax)}°F (${highLabel})${highNote ? ', ' + highNote : ''}`
  const lowStr = `low of ${Math.round(tempMin)}°F (${lowLabel})${lowNote ? ', ' + lowNote : ''}`

  return {
    headline: 'Temperature',
    body: `${highStr}. ${lowStr.charAt(0).toUpperCase() + lowStr.slice(1)}.`,
  }
}
