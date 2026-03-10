import { describe, it, expect } from 'vitest'
import { footwearRule } from '@/lib/email/rules/footwear'
import { baseWeather, withConditions } from './fixtures'

describe('footwearRule', () => {
  it('recommends everyday sneakers for standard conditions', () => {
    const result = footwearRule(baseWeather)
    expect(result.body.toLowerCase()).toContain('sneaker')
  })

  it('recommends rain boots when precip probability >= 70', () => {
    const result = footwearRule(withConditions({ precipProbability: 70 }))
    expect(result.body.toLowerCase()).toMatch(/rain boots|waterproof/)
  })

  it('recommends water-resistant shoes at exactly 40% precip probability', () => {
    const result = footwearRule(withConditions({ precipProbability: 40 }))
    expect(result.body.toLowerCase()).toContain('water-resistant')
  })

  it('recommends waterproof winter boots when snowfall >= 1 inch', () => {
    const result = footwearRule(withConditions({ snowfallSum: 1 }))
    expect(result.body.toLowerCase()).toMatch(/winter boot|waterproof/)
  })

  it('prioritizes snow over rain', () => {
    const result = footwearRule(withConditions({ snowfallSum: 2, precipProbability: 80 }))
    expect(result.body.toLowerCase()).toContain('winter boot')
  })

  it('recommends insulated boots when tempMin < 32', () => {
    const result = footwearRule(withConditions({ tempMin: 30, precipProbability: 5 }))
    expect(result.body.toLowerCase()).toMatch(/insulated|boot/)
  })

  it('recommends sandals/sneakers on hot dry day', () => {
    const result = footwearRule(withConditions({ tempMax: 85, precipProbability: 5 }))
    expect(result.body.toLowerCase()).toMatch(/sneaker|sandal/)
  })

  it('has a headline', () => {
    expect(footwearRule(baseWeather).headline).toBe('Footwear')
  })
})
