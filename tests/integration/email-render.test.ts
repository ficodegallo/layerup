import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EmailPayload } from '@/types/email'

// Mock MJML to avoid filesystem reads in tests
vi.mock('mjml', () => ({
  default: (template: string) => ({
    html: template.replace(/\{\{[^}]+\}\}/g, '[VAR]'),
    errors: [],
  }),
}))

// Mock fs to provide template content
vi.mock('fs', () => ({
  readFileSync: () => `
    <mjml>
      <mj-body>
        {{#if safetyMode}}<div>SAFETY: {{safetyBanner}}</div>{{/if}}
        {{#unless safetyMode}}<div>VIBE: {{vibeBody}}</div>{{/unless}}
        <div>TEMP: {{temperatureBody}}</div>
        <div>FOOT: {{footwearBody}}</div>
        <div>LAYER: {{layeringBody}}</div>
        <div>ACC: {{accessoriesBody}}</div>
        <div><a href="{{unsubscribeUrl}}">Unsubscribe</a></div>
      </mj-body>
    </mjml>
  `,
}))

const basePayload: EmailPayload = {
  subscriberId: 'test-sub-id',
  email: 'test@example.com',
  name: 'Test User',
  zip: '10001',
  city: 'New York',
  state: 'NY',
  unsubscribeToken: 'unsub-token-123',
  tone: 'MILD',
  lifestyleMode: 'WALK',
  units: 'F',
  dateFor: '2024-03-08',
  formattedDate: 'Friday, March 8',
  safetyMode: false,
  vibe: { headline: 'Perfect Day', body: 'Great weather today.' },
  temperature: { headline: 'Temperature', body: 'High 65°F, low 50°F.' },
  footwear: { headline: 'Footwear', body: 'Everyday sneakers.' },
  accessories: { headline: 'Accessories', body: 'Nothing special needed.' },
  layering: { headline: 'What to Wear', body: 'Light jacket optional.' },
  deliveryHour: 7,
  subject: 'Perfect Day in New York — LayerUp',
}

describe('renderDailyEmail', () => {
  it('renders without error for normal conditions', async () => {
    const { renderDailyEmail } = await import('@/lib/email/renderer')
    const { html, errors } = renderDailyEmail(basePayload)
    expect(html).toBeTruthy()
    expect(errors).toHaveLength(0)
  })

  it('includes vibe content when not in safety mode', async () => {
    const { renderDailyEmail } = await import('@/lib/email/renderer')
    const { html } = renderDailyEmail(basePayload)
    expect(html).toContain('Great weather today.')
  })

  it('shows safety banner when safetyMode=true', async () => {
    const { renderDailyEmail } = await import('@/lib/email/renderer')
    const safePayload: EmailPayload = {
      ...basePayload,
      safetyMode: true,
      safetyBanner: 'SEVERE STORM WARNING in effect.',
    }
    const { html } = renderDailyEmail(safePayload)
    expect(html).toContain('SEVERE STORM WARNING')
  })

  it('hides vibe block in safety mode', async () => {
    const { renderDailyEmail } = await import('@/lib/email/renderer')
    const safePayload: EmailPayload = {
      ...basePayload,
      safetyMode: true,
      safetyBanner: 'Storm warning.',
    }
    const { html } = renderDailyEmail(safePayload)
    // In safety mode, vibe block (vibeBody) should not appear
    expect(html).not.toContain('VIBE: Great weather today.')
  })

  it('includes unsubscribe URL in footer', async () => {
    const { renderDailyEmail } = await import('@/lib/email/renderer')
    const { html } = renderDailyEmail(basePayload)
    expect(html).toContain('unsub-token-123')
  })
})

describe('assertNoUnreplacedVars', () => {
  it('passes when no {{}} remain', async () => {
    const { assertNoUnreplacedVars } = await import('@/lib/email/renderer')
    expect(() => assertNoUnreplacedVars('<p>Hello world</p>')).not.toThrow()
  })

  it('throws when unreplaced vars exist', async () => {
    const { assertNoUnreplacedVars } = await import('@/lib/email/renderer')
    expect(() => assertNoUnreplacedVars('<p>{{unreplacedVar}}</p>')).toThrow(/unreplacedVar/)
  })
})
