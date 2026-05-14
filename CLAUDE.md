@AGENTS.md

# Layer Up — Project Context

## What this product is

Layer Up is a daily weather email newsletter that translates raw forecast data into plain-language, personality-driven outfit guidance. Where weather apps give you a number (58°F), Layer Up tells you what to do with it: what to wear, what to bring, and what quirks of the day to plan around.

The product voice is warm, wry, and opinionated — like a smart, slightly sleep-deprived friend who checked the weather so you didn't have to. It pokes fun at the weather, never at the reader. Max 300 words per email.

Full product requirements: `requirements/LayerUp_PRD_v1.0.md`

---

## Tech stack

- **Framework:** Next.js + TypeScript + Tailwind CSS
- **Database:** PostgreSQL via Prisma (`prisma/schema.prisma`)
- **Email rendering:** MJML → HTML via `mjml2html`, delivered through SendGrid
- **Weather:** Open-Meteo (primary) + NWS (fallback)
- **Key email pipeline:** `src/lib/email/email-design-library.ts` → `render-daily-brief-email.ts` → `send-daily-brief.ts`

---

## Brand design system

**Colors (CSS variables in `src/app/globals.css`):**
- `--background: #f4ecdd` — warm beige, the primary brand surface
- `--storm: #5f7088` — steel blue-gray
- `--sun: #f1b35e` — warm golden amber
- `--moss: #6b8f75` — sage green
- `--sand: #e7d4af` — warm sand
- `--rose: #bb6e62` — muted rose

**Typography:**
- Display / headings: Fraunces (Google Fonts, optical-size serif)
- Body: Manrope (Google Fonts, geometric sans)

**Visual language:** Rounded cards (28–34px radius), subtle shadows, semi-transparent layered surfaces, warm beige backgrounds. The UI has a "morning paper" warmth — not clinical, not playful-loud.

---

## Email design system

### Existing templates (v1) — `src/lib/email/email-design-library.ts`

Six MJML-based variants, each a named export in `EmailDesignVariant`:

| ID | Name | Character |
|----|------|-----------|
| `classic` | Classic Bulletin | Safe default. Beige/tan, Trebuchet MS. Current production base. |
| `sunrise` | Sunrise Brief | Warm orange/peach tones, Georgia serif. Morning ritual feel. |
| `field-guide` | Field Guide | Grounded greens, utility/outdoors aesthetic. |
| `city-poster` | City Poster | High contrast dark hero (#1F2940), Arial Black. Bold editorial. |
| `weekend-pop` | Weekend Pop | Bright multi-color, pill accessories. Most playful. |
| `thermal` | Thermal | **Selected final design — see below.** |

All templates share builder helpers: `buildSplitCardsSection`, `buildSafetyBanner`, `escapeHtml`, `getGreeting`, `getLocationLine`, `wrapEmailDocument`. New templates must use these.

### Selected design: Thermal (`thermal`)

The approved production template. Key features:

1. **Temperature-reactive hero** — the hero gradient and page background shift based on `weatherSnapshot.temperatureHighF`. Five ranges: ≤32°F navy blue → 33–50°F slate → 51–65°F sage green → 66–80°F amber → 81°F+ orange. The `getHeroTheme(tempF)` helper returns all color tokens for a given temperature.

2. **Giant temperature number** — `temperatureHighF` at ~96px font-size is the first thing the eye lands on. The feels-like callout sits directly below it in the hero.

3. **Feels-like alert banner** — a conditional amber banner rendered only when `Math.abs(brief.temperatureTranslation.feelsLikeGap) >= 8`. Uses `brief.temperatureTranslation.summary` as body copy. Sits between the hero and the footwear card. Suppress it when `brief.safetyMode.active === true`.

4. **Tabular accessory rows ("Before You Leave")** — each `AccessoryItem` is a bold-label + description row with thin horizontal dividers. Label min-width 100px for alignment. Use `buildAccessoryRows()` helper. For Outlook compatibility, fall back to a two-column nested table inside `mj-raw` if `min-width` on inline spans causes wrapping.

5. **No vibe/conditions card** — the vibe text lives inside the hero as the subject line's companion sentence. There is no separate vibe card in this template.

**Implementation spec:** `designs/thermal-implementation-spec.md`
**Visual reference:** `designs/thermal-email.html`
**Gradient MJML note:** Use `mj-html-attributes` to apply the CSS gradient to the hero `<td>` for modern clients; `bgcolor` on `mj-column` serves as the Outlook solid fallback.

### Design review files (not production code)

`designs/email-designs-v2.html` — side-by-side browser gallery of all five v2 design explorations (Night Dispatch, Broadsheet, Thermal, Studio Clean, Forecast Report). For design review only.

---

## Content data types

```ts
// src/lib/briefing/types.ts
type DailyBrief = {
  subjectLine: string;
  previewText: string;
  vibe: string;
  temperatureTranslation: { label: string; feelsLikeGap: number; summary: string; };
  layers: { walking: LayerRecommendation; errands: LayerRecommendation; };
  footwear: { recommendation: string; summary: string; };
  accessories: { items: AccessoryItem[]; };
  safetyMode: { active: boolean; headline?: string; instruction?: string; };
};

// src/lib/weather/types.ts — key fields for email templates
type WeatherSnapshot = {
  temperatureHighF: number;
  temperatureLowF: number;
  feelsLikeHighF: number;
  feelsLikeLowF: number;
  zipCode: string;
  locationName: string;
  // ...full type in types.ts
};
```

---

## Dev routes

| Route | Purpose |
|-------|---------|
| `/dev/email-designs` | Live gallery of all email variants rendered with real or mock data |
| `/dev/email-preview` | Single email preview |
| `/api/dev/run-daily-brief` | Trigger brief generation manually |
| `/api/dev/send-daily-brief` | Trigger send manually |
