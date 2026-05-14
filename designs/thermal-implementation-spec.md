# Thermal Email Template — Implementation Spec

Visual reference: `designs/thermal-email.html`

---

## What this is

A new `"thermal"` variant for the Layer Up daily email. The defining features are:

1. **Temperature-reactive hero** — the hero card gradient and page background color shift based on `temperatureHighF`. Cold days are deep blue; warm days shift through sage to amber to orange. This is the design's signature — the email literally looks different in winter vs. summer.
2. **Giant temperature number** — `temperatureHighF` is displayed at ~96px as the primary visual element. The feels-like callout sits directly below it.
3. **Feels-like alert banner** — a conditional amber banner shown only when `feelsLikeGap >= 8`. It surfaces the PRD's "significant divergence" rule (§2.1.2) as a visual element rather than burying it in prose.
4. **Tabular accessory rows** — "Before You Leave" replaces the pill/paragraph pattern. Each item is a bold-label + description row separated by thin rules.

---

## Files to change

| File | Change |
|------|--------|
| `src/lib/email/email-design-library.ts` | Add `"thermal"` to `EmailDesignVariant` union; add entry to `EMAIL_DESIGN_VARIANTS`; add `renderThermalTemplate` function; add `buildAccessoryRows` helper; add `getHeroTheme` helper; wire into `buildDailyBriefEmailMjml` switch |
| `src/lib/email/render-daily-brief-email.ts` | Update `renderPlainText` section label from "Grab Before You Go" → "Before You Leave" when variant is `"thermal"` (or keep generic — plain text is not variant-aware today, so this is optional) |
| `src/app/dev/email-designs/page.tsx` | No changes required — it reads `EMAIL_DESIGN_VARIANTS` dynamically |

---

## Step 1 — Extend the variant type

In `email-design-library.ts`, update the union:

```ts
export type EmailDesignVariant =
  | "classic"
  | "sunrise"
  | "field-guide"
  | "city-poster"
  | "weekend-pop"
  | "thermal";          // ← add this
```

---

## Step 2 — Add metadata to EMAIL_DESIGN_VARIANTS

Append to the `EMAIL_DESIGN_VARIANTS` array:

```ts
{
  id: "thermal",
  name: "Thermal",
  summary:
    "A temperature-reactive hero that shifts color with the forecast. The giant °F number leads every email — data is the visual hero, copy plays backup.",
  creativity: "High",
  pros: [
    "Immediately scannable — you know the day in under a second.",
    "Hero color changes with actual temperature, making every email feel live and specific.",
    "Feels-like alert banner surfaces the most actionable data point with visual weight.",
    "Clean blue-white card system is inbox-safe across all major clients.",
  ],
  cons: [
    "CSS gradients in the hero degrade to a solid flat color in Outlook.",
    "Cool blue palette reads slightly clinical — copy warmth is essential to balance it.",
    "Data-first hierarchy can compete with the brand voice if subject lines are short.",
  ],
  tradeoffs: [
    "The temperature-reactive hero is the most technically distinctive feature in either design set — worth the Outlook tradeoff.",
    "On mild-weather days (small feels-like gap, no alert banner) the template has less visual interest — consider a secondary hook for those days.",
    "Best paired with a data-confident copy tone. The wry humor needs to earn its place alongside the big numbers.",
  ],
},
```

---

## Step 3 — Add getHeroTheme helper

This function maps `temperatureHighF` to the gradient colors, page background, and card accent colors. All other sections inherit from the returned theme — only the hero gradient needs to change.

```ts
type HeroTheme = {
  // Hero gradient — three stop colors for linear-gradient(145deg, stop1, stop2, stop3)
  gradientStops: [string, string, string];
  // Solid fallback for Outlook (use stop2 — the midpoint)
  gradientFallback: string;
  // Outer page background
  pageBg: string;
  // Eyebrow / label color used across all cards
  accentColor: string;
  // Card border color
  cardBorder: string;
  // Secondary text color (descriptions, location line)
  secondaryText: string;
  // Errand card background (slightly off-white tinted to page bg)
  errandCardBg: string;
  // Errand card border
  errandCardBorder: string;
};

function getHeroTheme(tempF: number): HeroTheme {
  if (tempF <= 32) {
    // Deep freeze — navy blue
    return {
      gradientStops: ["#1B3A5E", "#1E4B7A", "#1A5580"],
      gradientFallback: "#1E4B7A",
      pageBg: "#EBF0F6",
      accentColor: "#2E6BA8",
      cardBorder: "#D4E0EE",
      secondaryText: "#5A7A98",
      errandCardBg: "#EBF0F6",
      errandCardBorder: "#C8D8E8",
    };
  }
  if (tempF <= 50) {
    // Cold — slate blue
    return {
      gradientStops: ["#2C5282", "#3A6B9A", "#2E7AAA"],
      gradientFallback: "#3A6B9A",
      pageBg: "#EDF1F8",
      accentColor: "#3468A0",
      cardBorder: "#D0DDED",
      secondaryText: "#5878A0",
      errandCardBg: "#EDF1F8",
      errandCardBorder: "#C4D4E6",
    };
  }
  if (tempF <= 65) {
    // Cool-mild — slate-green
    return {
      gradientStops: ["#1F4D3A", "#2D6B52", "#257A5E"],
      gradientFallback: "#2D6B52",
      pageBg: "#EBF2EE",
      accentColor: "#2A7A56",
      cardBorder: "#C8DDD4",
      secondaryText: "#4A7A64",
      errandCardBg: "#EBF2EE",
      errandCardBorder: "#BDD4C8",
    };
  }
  if (tempF <= 80) {
    // Warm — amber
    return {
      gradientStops: ["#7A4500", "#A85E00", "#906800"],
      gradientFallback: "#A85E00",
      pageBg: "#F7F0E4",
      accentColor: "#9A6000",
      cardBorder: "#E8D8B0",
      secondaryText: "#8A6840",
      errandCardBg: "#F7F0E4",
      errandCardBorder: "#DEC898",
    };
  }
  // Hot — deep orange
  return {
    gradientStops: ["#8B2500", "#B83C00", "#A03000"],
    gradientFallback: "#B83C00",
    pageBg: "#F7EAE0",
    accentColor: "#B04000",
    cardBorder: "#E8C8B0",
    secondaryText: "#965840",
    errandCardBg: "#F7EAE0",
    errandCardBorder: "#DEB898",
  };
}
```

---

## Step 4 — Add buildAccessoryRows helper

New helper — replaces pills and paragraph patterns for this template. Each item is a row: bold-colored label + description, separated by thin horizontal rules after the first row.

```ts
function buildAccessoryRows(
  brief: DailyBrief,
  accentColor: string,
  secondaryText: string,
  dividerColor: string,
): string {
  if (brief.accessories.items.length === 0) {
    return `
      <mj-text font-size="14px" line-height="22px" color="${secondaryText}" padding-top="10px">
        No extra gear required. The weather filed its paperwork correctly today.
      </mj-text>
    `;
  }

  return brief.accessories.items
    .map((item, index) => {
      const topBorder =
        index > 0
          ? `border-top: 1px solid ${dividerColor}; padding-top: 8px;`
          : "";
      return `
        <mj-text
          font-size="13px"
          line-height="20px"
          color="${secondaryText}"
          padding-top="${index > 0 ? "0" : "4px"}"
          padding-bottom="0"
        >
          <span style="${topBorder} display:block;">
            <span style="font-weight:700; color:${accentColor}; display:inline-block; min-width:100px;">
              ${escapeHtml(item.name)}
            </span>${escapeHtml(item.comment)}
          </span>
        </mj-text>
      `;
    })
    .join("");
}
```

> **Note on min-width in MJML/email:** The `min-width:100px` on the label span creates the two-column label/description alignment seen in the design. This renders correctly in Gmail, Apple Mail, and Outlook. Test Outlook specifically — it may need a `&nbsp;` pad or a nested table approach if the label text wraps. See MJML note in §7 below.

---

## Step 5 — Add renderThermalTemplate function

Full function. Insert before the `buildDailyBriefEmailMjml` export at the bottom of the file.

```ts
function renderThermalTemplate({
  brief,
  subscriberFirstName,
  weatherSnapshot,
}: EmailTemplateContext) {
  const greeting = getGreeting(subscriberFirstName);
  const theme = getHeroTheme(weatherSnapshot.temperatureHighF);
  const feelsLikeGap = brief.temperatureTranslation.feelsLikeGap;
  const showFeelsLikeAlert = Math.abs(feelsLikeGap) >= 8;

  // Hero gradient as inline CSS — falls back to gradientFallback in Outlook
  const heroGradient = `linear-gradient(145deg, ${theme.gradientStops[0]} 0%, ${theme.gradientStops[1]} 50%, ${theme.gradientStops[2]} 100%)`;

  return wrapEmailDocument({
    backgroundColor: theme.pageBg,
    previewText: brief.previewText,
    defaultTextColor: "#1E3055",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    body: `

      <!-- Logo bar -->
      <mj-section padding="20px 24px 10px">
        <mj-column>
          <mj-text font-size="11px" font-weight="700" letter-spacing="0.20em" text-transform="uppercase" color="#2E5E8A" padding="0">
            Layer Up
          </mj-text>
        </mj-column>
        <mj-column>
          <mj-text font-size="11px" color="#8AA0B8" letter-spacing="0.04em" align="right" padding="0">
            ${escapeHtml(getLocationLine(weatherSnapshot))}
          </mj-text>
        </mj-column>
      </mj-section>

      <!-- Hero — temperature reactive gradient -->
      <mj-section padding="0 16px 18px">
        <mj-column
          background-color="${theme.gradientFallback}"
          border-radius="28px"
          padding="32px 28px 28px"
        >
          <!--[if !mso]><!-->
          <mj-html-attributes>
            <mj-selector path=".thermal-hero td">
              <mj-html-attribute name="style" override>
                background: ${heroGradient}; border-radius: 28px;
              </mj-html-attribute>
            </mj-selector>
          </mj-html-attributes>
          <!--<![endif]-->

          <mj-text padding="0 0 14px" font-size="11px" font-weight="700" letter-spacing="0.22em" text-transform="uppercase" color="rgba(255,255,255,0.5)">
            ${greeting}
          </mj-text>

          <!-- Giant temperature number -->
          <mj-text padding="0 0 6px" font-size="96px" font-weight="800" color="#FFFFFF" line-height="1" letter-spacing="-4px">
            ${weatherSnapshot.temperatureHighF}<span style="font-size:36px; font-weight:400; color:rgba(255,255,255,0.6); vertical-align:top; margin-top:14px; display:inline-block;">°F</span>
          </mj-text>

          <mj-text padding="0 0 16px" font-size="13px" font-weight="500" letter-spacing="0.04em" color="rgba(255,255,255,0.55)">
            FEELS LIKE <span style="color:#FFD080; font-weight:700;">${weatherSnapshot.feelsLikeHighF}°F</span> WITH WIND
          </mj-text>

          <mj-divider padding="0 0 16px" border-color="rgba(255,255,255,0.12)" />

          <mj-text padding="0 0 8px" font-size="22px" font-weight="600" color="#FFFFFF" line-height="28px">
            ${escapeHtml(brief.subjectLine)}
          </mj-text>
          <mj-text padding="0" font-size="14px" line-height="22px" color="rgba(255,255,255,0.7)">
            ${escapeHtml(brief.vibe)}
          </mj-text>

        </mj-column>
      </mj-section>

      <!-- Safety Mode (overrides normal content when active) -->
      ${buildSafetyBanner(brief, {
        backgroundColor: "#FFDED1",
        borderColor: "#F59E82",
        eyebrowColor: "#B14E3E",
        bodyColor: "#1F2940",
      })}

      <!-- Feels-like alert banner (conditional — only when gap ≥ 8°F) -->
      ${showFeelsLikeAlert ? `
        <mj-section padding="0 16px 14px">
          <mj-column
            background-color="#FFF3E0"
            border="1px solid #FFD080"
            border-left="4px solid #F0A830"
            border-radius="16px"
            padding="14px 18px"
          >
            <mj-text padding="0 0 4px" font-size="12px" font-weight="700" letter-spacing="0.08em" color="#8B5E20">
              FEELS-LIKE ALERT — ${Math.abs(feelsLikeGap)}° GAP
            </mj-text>
            <mj-text padding="0" font-size="13px" line-height="20px" color="#6B4416">
              ${escapeHtml(brief.temperatureTranslation.summary)}
            </mj-text>
          </mj-column>
        </mj-section>
      ` : ""}

      <!-- Footwear -->
      <mj-section padding="0 16px 14px">
        <mj-column
          background-color="#FFFFFF"
          border="1px solid ${theme.cardBorder}"
          border-radius="22px"
          padding="20px 22px"
        >
          <mj-text padding="0 0 8px" font-size="10px" font-weight="700" text-transform="uppercase" letter-spacing="0.22em" color="${theme.accentColor}">
            Footwear
          </mj-text>
          <mj-text padding="0" font-size="15px" line-height="24px" color="#1E3055">
            ${escapeHtml(brief.footwear.summary)}
          </mj-text>
        </mj-column>
      </mj-section>

      <!-- Outdoor + Errands (split) -->
      <mj-section padding="0 16px 14px">
        <mj-column
          width="50%"
          padding="0 6px 0 0"
          background-color="#FFFFFF"
          border="1px solid ${theme.cardBorder}"
          border-radius="22px"
        >
          <mj-text padding="18px 20px 8px" font-size="10px" font-weight="700" text-transform="uppercase" letter-spacing="0.20em" color="${theme.accentColor}">
            Outdoor
          </mj-text>
          <mj-text padding="0 20px 18px" font-size="14px" line-height="22px" color="#1E3055">
            ${escapeHtml(brief.layers.walking.summary)}
          </mj-text>
        </mj-column>
        <mj-column
          width="50%"
          padding="0 0 0 6px"
          background-color="${theme.errandCardBg}"
          border="1px solid ${theme.errandCardBorder}"
          border-radius="22px"
        >
          <mj-text padding="18px 20px 8px" font-size="10px" font-weight="700" text-transform="uppercase" letter-spacing="0.20em" color="${theme.secondaryText}">
            Errands
          </mj-text>
          <mj-text padding="0 20px 18px" font-size="14px" line-height="22px" color="#2A4560">
            ${escapeHtml(brief.layers.errands.summary)}
          </mj-text>
        </mj-column>
      </mj-section>

      <!-- Before You Leave (accessory rows) -->
      <mj-section padding="0 16px 14px">
        <mj-column
          background-color="#FFFFFF"
          border="1px solid ${theme.cardBorder}"
          border-radius="22px"
          padding="20px 22px"
        >
          <mj-text padding="0 0 14px" font-size="10px" font-weight="700" text-transform="uppercase" letter-spacing="0.22em" color="${theme.accentColor}">
            Before You Leave
          </mj-text>
          ${buildAccessoryRows(brief, theme.accentColor, theme.secondaryText, theme.cardBorder)}
          <mj-spacer height="6px" />
        </mj-column>
      </mj-section>

      <!-- Footer -->
      <mj-section padding="0 16px 32px">
        <mj-column>
          <mj-text font-size="11px" line-height="18px" color="#7A9AB8" align="center">
            Layer Up checks the weather so you can leave the house with less guesswork.
          </mj-text>
        </mj-column>
      </mj-section>

    `,
  });
}
```

---

## Step 6 — Wire into the switch statement

In `buildDailyBriefEmailMjml`, add the `"thermal"` case:

```ts
export function buildDailyBriefEmailMjml(
  input: EmailTemplateContext & {
    variant?: EmailDesignVariant;
  },
) {
  switch (input.variant ?? "classic") {
    case "classic":
      return renderClassicTemplate(input);
    case "sunrise":
      return renderSunriseTemplate(input);
    case "field-guide":
      return renderFieldGuideTemplate(input);
    case "city-poster":
      return renderCityPosterTemplate(input);
    case "weekend-pop":
      return renderWeekendPopTemplate(input);
    case "thermal":                          // ← add this
      return renderThermalTemplate(input);
    default:
      return renderClassicTemplate(input);
  }
}
```

---

## Step 7 — MJML implementation notes

### Gradient background on the hero

MJML compiles to `<table>` / `<td>` elements. The `background-color` attribute on `mj-column` outputs a `bgcolor` attribute on the `<td>`, which is what Outlook reads. The CSS gradient must be applied separately via an inline style on the same `<td>`.

**Recommended approach — `mj-html-attributes`:**

Use MJML's `mj-html-attributes` to patch a CSS `background` style onto the generated `<td>` for non-Outlook clients. Add a class to the section (e.g., `css-class="thermal-hero"`) and target it:

```xml
<mj-head>
  <mj-html-attributes>
    <mj-selector path=".thermal-hero td">
      <mj-html-attribute name="background" override>
        linear-gradient(145deg, #1B3A5E 0%, #1E4B7A 50%, #1A5580 100%)
      </mj-html-attribute>
    </mj-selector>
  </mj-html-attributes>
</mj-head>
```

Outlook ignores the CSS background and reads only `bgcolor="${theme.gradientFallback}"` — the solid midpoint color. All other clients render the gradient. This is the correct two-track approach for email gradients.

**Alternative:** Wrap the hero content in an `mj-raw` block with a full hand-rolled `<table>` if `mj-html-attributes` doesn't produce the expected output after testing. This gives full control but loses MJML's responsive handling for that section.

### Split-column layout (Outdoor / Errands)

The existing `buildSplitCardsSection` helper uses `mj-column width="50%"` with side padding. Replicate the same pattern. The 6px gap between columns (3px padding on each side) matches the `12px` visual gap in the design reference.

### Accessory row label alignment

The `min-width:100px` on the label `<span>` works in Gmail and Apple Mail. In Outlook, inline-block `min-width` is ignored. If label/description wraps awkwardly in Outlook testing, replace the label+description pattern with a two-column nested table:

```html
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td width="100" style="font-weight:700; color:${accentColor}; font-size:13px; vertical-align:top;">
      ${item.name}
    </td>
    <td style="font-size:13px; color:${secondaryText}; line-height:20px;">
      ${item.comment}
    </td>
  </tr>
</table>
```

Use `mj-raw` to inject this inside the `mj-column` for the accessory section.

### Feels-like gap source of truth

`brief.temperatureTranslation.feelsLikeGap` is already computed by `generate-daily-brief.ts` and stored on the brief. Use it directly — do not recompute from `weatherSnapshot`. The threshold for showing the alert is `Math.abs(feelsLikeGap) >= 8`, matching the PRD spec (§2.1.2).

When the alert is shown, use `brief.temperatureTranslation.summary` as the banner body copy — it already contains the human-readable translation including the gap callout.

### Safety mode interaction

When `brief.safetyMode.active === true`, `buildSafetyBanner` renders a full-width alert. In this template, it sits between the hero and the feels-like banner. The feels-like banner should still render below it — both can coexist. If this ever feels like too much alert stacking, suppress the feels-like banner when safety mode is active (`showFeelsLikeAlert && !brief.safetyMode.active`).

---

## Step 8 — Plain text update (optional)

`render-daily-brief-email.ts` has a `renderPlainText` function that is not variant-aware. The section label currently reads `"Grab Before You Go"`. To align with the Thermal design's label:

```ts
// Change this line in renderPlainText:
Grab Before You Go
// To:
Before You Leave
```

This is a copy change only — it does not affect any other variant since plain text is shared. If the other templates should keep the old label, make `renderPlainText` variant-aware by accepting `variant?: EmailDesignVariant` and switching on it.

---

## Step 9 — Gallery preview

Once the function is wired in, the existing `/dev/email-designs` gallery page will automatically pick up the new variant because it reads `EMAIL_DESIGN_VARIANTS` dynamically. No changes needed to `page.tsx`.

Verify in the gallery that:
- The hero renders with the gradient (check in Chrome — not just in the Next.js dev preview)
- The feels-like alert appears and disappears correctly based on the gap threshold
- The accessory rows align cleanly with at least 2 and 3 items
- The empty-accessories fallback text renders when `items.length === 0`
- Safety mode banner stacks correctly above the feels-like alert

---

## Quick reference — color tokens by temperature

| Range | Hero gradient (stop 2) | Page bg | Accent |
|-------|----------------------|---------|--------|
| ≤ 32°F | `#1E4B7A` (navy) | `#EBF0F6` | `#2E6BA8` |
| 33–50°F | `#3A6B9A` (slate blue) | `#EDF1F8` | `#3468A0` |
| 51–65°F | `#2D6B52` (slate green) | `#EBF2EE` | `#2A7A56` |
| 66–80°F | `#A85E00` (amber) | `#F7F0E4` | `#9A6000` |
| 81°F+ | `#B83C00` (orange) | `#F7EAE0` | `#B04000` |

The feels-like `#FFD080` highlight color in the hero is fixed across all temperature palettes — it always reads as "warm caution" regardless of the background.
