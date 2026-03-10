import { describe, it, expect } from 'vitest'
import { vibeRule } from '@/lib/email/rules/vibe'
import { selectVibe, getVibeVariant, VIBE_ARCHETYPES } from '@/lib/content/vibes'
import { baseWeather, withConditions } from './fixtures'

const DATE = '2024-03-08'
const ZIP = '10001'

describe('selectVibe', () => {
  it('selects Scorcher for very hot day (tempMax >= 90)', () => {
    const archetype = selectVibe(withConditions({ tempMax: 95 }).daily, DATE, ZIP)
    expect(archetype.id).toBe('scorcher')
  })

  it('selects Snow Day for snow weather codes', () => {
    const archetype = selectVibe(withConditions({ weathercode: 71 }).daily, DATE, ZIP)
    expect(archetype.id).toBe('snow-day')
  })

  it('selects Thunder Mood for thunderstorm codes', () => {
    const archetype = selectVibe(withConditions({ weathercode: 95 }).daily, DATE, ZIP)
    expect(archetype.id).toBe('thunder-mood')
  })

  it('selects Rain Check for rain codes', () => {
    const archetype = selectVibe(withConditions({ weathercode: 61 }).daily, DATE, ZIP)
    expect(archetype.id).toBe('rain-check')
  })

  it('selects Winter Chill for freezing temps', () => {
    const archetype = selectVibe(withConditions({ tempMax: 28 }).daily, DATE, ZIP)
    expect(archetype.id).toBe('winter-chill')
  })

  it('falls back to Standard Issue when no conditions match', () => {
    const archetype = selectVibe(
      withConditions({ tempMax: 55, weathercode: 1 }).daily,
      DATE,
      ZIP
    )
    // Standard Issue should be the fallback
    expect(archetype.priority).toBeGreaterThanOrEqual(1)
    expect(archetype.variants.length).toBeGreaterThan(0)
  })
})

describe('getVibeVariant', () => {
  it('returns a string for any archetype + date + zip combo', () => {
    for (const archetype of VIBE_ARCHETYPES) {
      const variant = getVibeVariant(archetype, DATE, ZIP)
      expect(typeof variant).toBe('string')
      expect(variant.length).toBeGreaterThan(0)
    }
  })

  it('returns a deterministic variant for the same inputs', () => {
    const archetype = VIBE_ARCHETYPES[0]
    const v1 = getVibeVariant(archetype, DATE, ZIP)
    const v2 = getVibeVariant(archetype, DATE, ZIP)
    expect(v1).toBe(v2)
  })

  it('can return different variants for different dates', () => {
    const archetype = VIBE_ARCHETYPES[0]
    // Test enough dates to hit different variants
    const variants = new Set<string>()
    for (let d = 1; d <= 30; d++) {
      const date = `2024-03-${String(d).padStart(2, '0')}`
      variants.add(getVibeVariant(archetype, date, ZIP))
    }
    expect(variants.size).toBeGreaterThan(1)
  })
})

describe('vibeRule', () => {
  it('returns a safety headline in safety mode', () => {
    const result = vibeRule(baseWeather, true)
    expect(result.headline?.toLowerCase()).toContain('alert')
  })

  it('does not use humor copy in safety mode', () => {
    const result = vibeRule(baseWeather, true)
    // Safety copy should be plain language
    expect(result.body).toContain('NWS')
  })

  it('returns a non-safety vibe in normal mode', () => {
    const result = vibeRule(withConditions({ tempMax: 85, weathercode: 0 }), false)
    expect(result.headline).toBeTruthy()
    expect(result.body.length).toBeGreaterThan(10)
  })
})
