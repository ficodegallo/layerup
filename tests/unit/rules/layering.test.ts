import { describe, it, expect } from 'vitest'
import { layeringRule } from '@/lib/email/rules/layering'
import { baseWeather, withConditions } from './fixtures'

describe('layeringRule', () => {
  it('has a What to Wear headline', () => {
    expect(layeringRule(baseWeather).headline).toBe('What to Wear')
  })

  it('recommends t-shirt for hot weather', () => {
    const result = layeringRule(withConditions({ tempMax: 85, tempMin: 72 }))
    expect(result.body.toLowerCase()).toContain('t-shirt')
  })

  it('recommends winter coat for frigid weather', () => {
    const result = layeringRule(withConditions({ tempMax: 15, tempMin: 5 }))
    expect(result.body.toLowerCase()).toContain('coat')
  })

  it('recommends rain jacket when rainy and mild', () => {
    const result = layeringRule(withConditions({ tempMax: 60, tempMin: 50, precipProbability: 70 }))
    expect(result.body.toLowerCase()).toMatch(/rain jacket|waterproof/)
  })

  it('DRIVE mode includes car-specific note on rainy day', () => {
    const result = layeringRule(withConditions({ precipProbability: 70 }), 'DRIVE')
    expect(result.body.toLowerCase()).toContain('driv')
  })

  it('includes multiple layers for cold days', () => {
    const result = layeringRule(withConditions({ tempMax: 35, tempMin: 20 }))
    expect(result.body.toLowerCase()).toMatch(/layer|fleece|thermal/)
  })
})
