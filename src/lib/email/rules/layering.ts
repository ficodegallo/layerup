import type { WeatherData } from '@/types/weather'
import type { RuleOutput } from '@/types/email'
import type { LifestyleMode } from '@/types/subscriber'

interface LayerRec {
  base: string
  mid?: string
  outer?: string
  note?: string
}

function buildOutfit(weather: WeatherData, mode: LifestyleMode): LayerRec {
  const { tempMax, tempMin, precipProbability, windspeedMax, snowfallSum } = weather.daily
  const avgTemp = (tempMax + tempMin) / 2
  const hasRain = precipProbability >= 40
  const hasSnow = snowfallSum >= 0.5
  const isWindy = windspeedMax >= 20

  // Base layer
  let base: string
  if (avgTemp >= 70) base = 'a light t-shirt'
  else if (avgTemp >= 55) base = 'a long-sleeve shirt'
  else if (avgTemp >= 40) base = 'a thermal or heavyweight long-sleeve'
  else base = 'a thermal base layer'

  // Mid layer
  let mid: string | undefined
  if (avgTemp < 55 && avgTemp >= 40) mid = 'a fleece or light sweater'
  else if (avgTemp < 40 && avgTemp >= 25) mid = 'a mid-weight fleece or sweater'
  else if (avgTemp < 25) mid = 'a heavy insulated sweater or down vest'

  // Outer layer
  let outer: string | undefined
  if (hasSnow || avgTemp < 25) {
    outer = 'a heavy winter coat'
  } else if (hasRain && avgTemp < 50) {
    outer = 'a waterproof insulated jacket'
  } else if (hasRain) {
    outer = 'a rain jacket'
  } else if (avgTemp < 40) {
    outer = 'a warm jacket'
  } else if (avgTemp < 55 || isWindy) {
    outer = 'a light jacket or windbreaker'
  } else if (avgTemp < 65) {
    outer = 'a denim jacket or light layer'
  }

  // Mode-specific notes
  let note: string | undefined
  if (mode === 'WALK' && isWindy && !outer) {
    note = 'Wind is notable — a windbreaker is worth it if you\'re outside much.'
  } else if (mode === 'DRIVE' && hasRain) {
    note = 'Driving mode: you\'re mostly covered, but keep something waterproof for the gap between car and building.'
  }

  return { base, mid, outer, note }
}

export function layeringRule(
  weather: WeatherData,
  mode: LifestyleMode = 'WALK',
  safetyMode = false
): RuleOutput {
  const rec = buildOutfit(weather, mode)

  const layers = [rec.base, rec.mid, rec.outer].filter(Boolean)
  const layerStr = layers.length === 1
    ? `Start with ${layers[0]}.`
    : `Layer up: ${layers.slice(0, -1).join(', ')}, and ${layers[layers.length - 1]}.`

  const body = rec.note ? `${layerStr} ${rec.note}` : layerStr

  return {
    headline: 'What to Wear',
    body,
  }
}
