import { describe, it, expect } from 'vitest'
import { safetyRule } from '@/lib/email/rules/safety'
import type { NWSAlert } from '@/types/weather'

const makeAlert = (severity: NWSAlert['severity'], event = 'Severe Thunderstorm'): NWSAlert => ({
  id: 'test-alert-1',
  event,
  severity,
  headline: `${severity} ${event} Warning`,
  description: 'A severe storm is approaching.',
  instruction: 'Seek shelter immediately.',
})

describe('safetyRule', () => {
  it('returns safetyMode=false with no alerts', () => {
    const result = safetyRule([])
    expect(result.safetyMode).toBe(false)
    expect(result.output).toBeNull()
  })

  it('returns safetyMode=false for Minor alerts', () => {
    const result = safetyRule([makeAlert('Minor')])
    expect(result.safetyMode).toBe(false)
  })

  it('returns safetyMode=false for Moderate alerts', () => {
    const result = safetyRule([makeAlert('Moderate')])
    expect(result.safetyMode).toBe(false)
  })

  it('returns safetyMode=true for Severe alerts', () => {
    const result = safetyRule([makeAlert('Severe')])
    expect(result.safetyMode).toBe(true)
    expect(result.output).not.toBeNull()
  })

  it('returns safetyMode=true for Extreme alerts', () => {
    const result = safetyRule([makeAlert('Extreme')])
    expect(result.safetyMode).toBe(true)
  })

  it('includes event name and instruction in body', () => {
    const result = safetyRule([makeAlert('Severe', 'Tornado')])
    expect(result.output!.body).toContain('Tornado')
    expect(result.output!.body).toContain('Seek shelter')
  })

  it('mentions additional alerts when multiple severe alerts exist', () => {
    const result = safetyRule([
      makeAlert('Severe', 'Thunderstorm'),
      makeAlert('Extreme', 'Tornado'),
    ])
    expect(result.output!.body).toContain('additional')
  })

  it('includes weather.gov reference', () => {
    const result = safetyRule([makeAlert('Severe')])
    expect(result.output!.body).toContain('weather.gov')
  })
})
