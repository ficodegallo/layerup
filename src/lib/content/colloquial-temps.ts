export function tempToLabel(tempF: number): string {
  if (tempF < 20) return 'freezing'
  if (tempF < 32) return 'brutally cold'
  if (tempF < 45) return 'cold'
  if (tempF < 55) return 'chilly'
  if (tempF < 65) return 'cool'
  if (tempF < 75) return 'mild'
  if (tempF < 85) return 'warm'
  if (tempF < 95) return 'hot'
  return 'scorching'
}

export function feelsLikeDivergenceNote(actualF: number, feelsLikeF: number): string | null {
  const diff = feelsLikeF - actualF

  if (Math.abs(diff) <= 8) {
    return null
  }

  if (diff < 0) {
    return `but feels like ${Math.round(feelsLikeF)}°F with the wind chill`
  }

  return `but feels like ${Math.round(feelsLikeF)}°F with humidity`
}
