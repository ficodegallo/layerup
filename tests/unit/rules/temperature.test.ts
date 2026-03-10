import { describe, it, expect } from 'vitest'
import { temperatureRule } from '@/lib/email/rules/temperature'
import { baseWeather, withConditions } from './fixtures'

describe('temperatureRule', () => {
  it('includes high and low temp in output', () => {
    const result = temperatureRule(baseWeather)
    expect(result.body).toContain('55°F')
    expect(result.body).toContain('42°F')
  })

  it('has a Temperature headline', () => {
    expect(temperatureRule(baseWeather).headline).toBe('Temperature')
  })

  it('includes feels-like divergence note when >8°F apart (high)', () => {
    const result = temperatureRule(withConditions({ tempMax: 55, feelsLikeMax: 44 }))
    expect(result.body.toLowerCase()).toContain('feels like')
  })

  it('does not include divergence note when within 8°F', () => {
    const result = temperatureRule(withConditions({ tempMax: 55, feelsLikeMax: 52 }))
    expect(result.body.toLowerCase()).not.toContain('feels like')
  })

  it('handles freezing temperatures', () => {
    const result = temperatureRule(withConditions({ tempMax: 20, tempMin: 5 }))
    expect(result.body).toContain('20°F')
  })
})
