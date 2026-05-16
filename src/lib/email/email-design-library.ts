import type { DailyBrief } from "@/lib/briefing/types";
import {
  getThermalFeelsLikeLabel,
  getThermalHeroHeading,
} from "@/lib/design/thermal-content";
import {
  getThermalGradient,
  getThermalTheme,
} from "@/lib/design/thermal-theme";
import type { SubscriberManagementLinks } from "@/lib/subscribers/management-links";
import type { WeatherSnapshot } from "@/lib/weather/types";

export type EmailDesignVariant =
  | "thermal"
  | "classic"
  | "sunrise"
  | "field-guide"
  | "city-poster"
  | "weekend-pop";

export type EmailDesignVariantMeta = {
  id: EmailDesignVariant;
  name: string;
  summary: string;
  creativity: string;
  pros: string[];
  cons: string[];
  tradeoffs: string[];
};

type EmailTemplateContext = {
  brief: DailyBrief;
  managementLinks?: SubscriberManagementLinks;
  subscriberFirstName?: string | null;
  weatherSnapshot: WeatherSnapshot;
};

type SplitCard = {
  eyebrow: string;
  body: string;
  backgroundColor: string;
  borderColor: string;
  eyebrowColor: string;
  bodyColor: string;
};

export const EMAIL_DESIGN_VARIANTS: EmailDesignVariantMeta[] = [
  {
    id: "thermal",
    name: "Thermal",
    summary:
      "A temperature-reactive hero that shifts color with the forecast. The giant degree read leads every email and the rest of the design supports it.",
    creativity: "High",
    pros: [
      "Immediately scannable because the temperature is the visual hero.",
      "Feels distinctly live as the palette changes with the actual forecast.",
      "The feels-like alert gets real visual weight instead of living in body copy.",
    ],
    cons: [
      "The design is more data-forward than the softer editorial directions.",
      "Gradient treatment will flatten to a solid fallback in stricter Outlook clients.",
    ],
    tradeoffs: [
      "Best option if Layer Up should feel unmistakably weather-native.",
      "The design does more of the storytelling, so copy needs to stay disciplined.",
    ],
  },
  {
    id: "classic",
    name: "Classic Bulletin",
    summary:
      "A polished editorial card layout that keeps the current feel but tightens the structure.",
    creativity: "Low",
    pros: [
      "Safest production default for broad inbox compatibility.",
      "Strong hierarchy and very easy scanning.",
      "Feels dependable without being plain.",
    ],
    cons: [
      "The most restrained option in the set.",
      "Brand personality comes more from copy than layout.",
    ],
    tradeoffs: [
      "Best if we want a stable default daily template.",
      "Least risky, but also least likely to feel ownable at a glance.",
    ],
  },
  {
    id: "sunrise",
    name: "Sunrise Brief",
    summary:
      "Warmer color blocks, softer cards, and a brighter morning feel without getting too loud.",
    creativity: "Medium-Low",
    pros: [
      "Adds more warmth and personality while staying readable.",
      "Feels more like a morning ritual than a utilitarian alert.",
      "Still conservative enough for daily sending.",
    ],
    cons: [
      "Hero section carries more visual weight than the classic version.",
      "More color means slightly less neutral presentation.",
    ],
    tradeoffs: [
      "A strong candidate if you want more brand energy without going fully bold.",
      "Good balance between charm and operational safety.",
    ],
  },
  {
    id: "field-guide",
    name: "Field Guide",
    summary:
      "An outdoors-inspired system with grounded colors, checklists, and gear-call framing.",
    creativity: "Medium",
    pros: [
      "Very on-theme for the idea of getting dressed with intent.",
      "Makes the recommendation blocks feel practical and actionable.",
      "Distinct without becoming flashy.",
    ],
    cons: [
      "Leans slightly more rugged and directional.",
      "Less neutral if the brand eventually skews urban or fashion-forward.",
    ],
    tradeoffs: [
      "Great if Layer Up wants a capable, utility-first personality.",
      "Feels branded, but not quite as broad as the classic template.",
    ],
  },
  {
    id: "city-poster",
    name: "City Poster",
    summary:
      "A sharper editorial treatment with bigger contrast, bolder blocks, and more attitude.",
    creativity: "Medium-High",
    pros: [
      "Most memorable of the more practical options.",
      "Typography and color feel more like a modern lifestyle brand.",
      "Gives the copy room to feel witty and intentional.",
    ],
    cons: [
      "Heavier visual treatment can feel louder every single day.",
      "A bit less forgiving if content length varies widely.",
    ],
    tradeoffs: [
      "Strong option if Layer Up should feel like a brand, not just a tool.",
      "Bolder design language means more sensitivity to copy and spacing.",
    ],
  },
  {
    id: "weekend-pop",
    name: "Weekend Pop",
    summary:
      "The most playful route: brighter accents, layered cards, and a looser personality.",
    creativity: "High",
    pros: [
      "Highest amount of personality and differentiation.",
      "Feels fun, memorable, and shareable.",
      "Could work especially well for weekend sends or special editions.",
    ],
    cons: [
      "Most visually opinionated in the set.",
      "Can feel less premium if used every single day without restraint.",
    ],
    tradeoffs: [
      "Best for experimentation, brand testing, or special sends.",
      "Highest creative upside and the highest risk of feeling too busy.",
    ],
  },
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getGreeting(subscriberFirstName?: string | null) {
  return subscriberFirstName
    ? `Good morning, ${escapeHtml(subscriberFirstName)}`
    : "Good morning";
}

function getLocationLine(weatherSnapshot: WeatherSnapshot) {
  return `${escapeHtml(weatherSnapshot.locationName)} (${escapeHtml(
    weatherSnapshot.zipCode,
  )})`;
}

function buildEmailFooter(options: {
  linkColor: string;
  managementLinks?: SubscriberManagementLinks;
  padding?: string;
  tagline: string;
  textColor: string;
  textSize?: number;
}) {
  const managementLinksBlock = options.managementLinks
    ? `
      <mj-text
        font-size="12px"
        line-height="20px"
        color="${options.textColor}"
        align="center"
        padding="8px 0 0"
      >
        <a
          href="${escapeHtml(options.managementLinks.manageUrl)}"
          style="color:${options.linkColor}; text-decoration:underline;"
        >
          Manage preferences
        </a>
        &nbsp;•&nbsp;
        <a
          href="${escapeHtml(options.managementLinks.unsubscribeUrl)}"
          style="color:${options.linkColor}; text-decoration:underline;"
        >
          Unsubscribe
        </a>
      </mj-text>
    `
    : "";

  return `
    <mj-section padding="${options.padding ?? "0 16px 32px"}">
      <mj-column>
        <mj-text
          font-size="${options.textSize ?? 11}px"
          line-height="18px"
          color="${options.textColor}"
          align="center"
        >
          ${escapeHtml(options.tagline)}
        </mj-text>
        ${managementLinksBlock}
      </mj-column>
    </mj-section>
  `;
}

function buildAccessoryParagraphs(
  brief: DailyBrief,
  bodyColor: string,
  accentColor: string,
) {
  if (brief.accessories.items.length === 0) {
    return `
      <mj-text font-size="16px" line-height="24px" color="${bodyColor}" padding-top="10px">
        No extra gear required. A suspiciously efficient weather day.
      </mj-text>
    `;
  }

  return brief.accessories.items
    .map(
      (item) => `
        <mj-text font-size="16px" line-height="24px" color="${bodyColor}" padding-top="10px" padding-bottom="0">
          <span style="color:${accentColor}; font-weight:700;">${escapeHtml(
            item.name,
          )}</span>: ${escapeHtml(item.comment)}
        </mj-text>
      `,
    )
    .join("");
}

function buildAccessoryChecklist(brief: DailyBrief, bodyColor: string) {
  if (brief.accessories.items.length === 0) {
    return `
      <mj-text font-size="16px" line-height="24px" color="${bodyColor}" padding-top="12px">
        Ready to leave the house without extra props. Enjoy the efficiency.
      </mj-text>
    `;
  }

  return brief.accessories.items
    .map(
      (item) => `
        <mj-text font-size="15px" line-height="23px" color="${bodyColor}" padding-top="12px" padding-bottom="0">
          [ ] <strong>${escapeHtml(item.name)}</strong> - ${escapeHtml(
            item.comment,
          )}
        </mj-text>
      `,
    )
    .join("");
}

function buildAccessoryPills(brief: DailyBrief) {
  if (brief.accessories.items.length === 0) {
    return `
      <mj-text font-size="16px" line-height="24px" color="#213047" padding-top="14px">
        No extra gear required. The weather filled out its paperwork correctly.
      </mj-text>
    `;
  }

  return `
    <mj-text font-size="15px" line-height="28px" color="#213047" padding-top="14px">
      ${brief.accessories.items
        .map(
          (item, index) => `
            <span style="display:inline-block; margin:0 10px 10px 0; padding:8px 12px; border-radius:999px; background:${
              ["#FFD36E", "#8DD7D1", "#FFB7A5", "#C7B8FF"][index % 4]
            }; font-weight:700; color:#213047;">
              ${escapeHtml(item.name)}
            </span>
          `,
        )
        .join("")}
    </mj-text>
    <mj-text font-size="15px" line-height="24px" color="#35506F" padding-top="0">
      ${brief.accessories.items.map((item) => escapeHtml(item.comment)).join(" ")}
    </mj-text>
  `;
}

function buildAccessoryRows(
  brief: DailyBrief,
  accentColor: string,
  secondaryText: string,
  dividerColor: string,
) {
  if (brief.accessories.items.length === 0) {
    return `
      <mj-text font-size="14px" line-height="22px" color="${secondaryText}" padding-top="10px">
        No extra gear required. The weather filed its paperwork correctly today.
      </mj-text>
    `;
  }

  const rows = brief.accessories.items
    .map((item, index) => {
      const isFirst = index === 0;
      const isLast = index === brief.accessories.items.length - 1;
      const cellStyles = [
        "font-size:13px",
        "line-height:20px",
        "vertical-align:top",
        !isFirst ? `border-top:1px solid ${dividerColor}` : "",
        !isFirst ? "padding-top:10px" : "",
        !isLast ? "padding-bottom:10px" : "",
      ]
        .filter(Boolean)
        .join("; ");

      return `
        <tr>
          <td style="width:108px; padding:0 12px 0 0; font-weight:700; color:${accentColor}; ${cellStyles}">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding:0; color:${secondaryText}; ${cellStyles}">
            ${escapeHtml(item.comment)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <mj-table padding="4px 0 0" role="presentation">
      ${rows}
    </mj-table>
  `;
}

function getFamilyChildren(brief: DailyBrief) {
  return brief.family?.children ?? [];
}

function buildFamilyRecommendationSection(
  brief: DailyBrief,
  options: {
    title: string;
    backgroundColor: string;
    borderColor: string;
    eyebrowColor: string;
    bodyColor: string;
    secondaryColor: string;
    sectionPadding?: string;
  },
) {
  const children = getFamilyChildren(brief);

  if (children.length === 0) {
    return "";
  }

  const childRows = children
    .map((child, index) => {
      const divider =
        index > 0
          ? `border-top:1px solid ${options.borderColor}; padding-top:16px;`
          : "";

      return `
        <div style="${divider}">
          <div style="font-size:13px; line-height:20px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:${options.eyebrowColor};">
            ${escapeHtml(child.label)} - Age ${child.ageYears} - ${escapeHtml(
              child.cohort,
            )}
          </div>
          <div style="margin-top:8px; font-size:15px; line-height:24px; color:${options.bodyColor};">
            ${escapeHtml(child.summary)}
          </div>
          <div style="margin-top:8px; font-size:13px; line-height:21px; color:${options.secondaryColor};">
            Highlights: ${child.highlights.map((item) => escapeHtml(item)).join(", ")}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <mj-section padding="${options.sectionPadding ?? "0 20px 20px"}">
      <mj-column
        background-color="${options.backgroundColor}"
        border="1px solid ${options.borderColor}"
        border-radius="30px"
      >
        <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="${options.eyebrowColor}">
          ${escapeHtml(options.title)}
        </mj-text>
        <mj-text padding="14px 28px 28px">
          ${childRows}
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

function buildThermalModeCard(options: {
  eyebrow: string;
  body: string;
  backgroundColor: string;
  borderColor: string;
  eyebrowColor: string;
  bodyColor: string;
}) {
  return `
    <mj-text padding="0">
      <div
        style="
          background:${options.backgroundColor};
          border:1px solid ${options.borderColor};
          border-radius:22px;
          padding:18px 20px;
        "
      >
        <div
          style="
            font-size:10px;
            font-weight:700;
            letter-spacing:0.20em;
            line-height:1;
            text-transform:uppercase;
            color:${options.eyebrowColor};
            margin-bottom:8px;
          "
        >
          ${escapeHtml(options.eyebrow)}
        </div>
        <div
          style="
            font-size:14px;
            line-height:22px;
            color:${options.bodyColor};
          "
        >
          ${escapeHtml(options.body)}
        </div>
      </div>
    </mj-text>
  `;
}

function buildSafetyBanner(
  brief: DailyBrief,
  options: {
    backgroundColor: string;
    borderColor?: string;
    eyebrowColor: string;
    bodyColor: string;
    padding?: string;
  },
) {
  if (!brief.safetyMode.active) {
    return "";
  }

  return `
    <mj-section padding="0 20px 20px">
      <mj-column
        background-color="${options.backgroundColor}"
        ${options.borderColor ? `border="1px solid ${options.borderColor}"` : ""}
        border-radius="28px"
      >
        <mj-text padding="${options.padding ?? "24px 24px 0"}" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="${options.eyebrowColor}">
          Safety Mode
        </mj-text>
        <mj-text padding="10px 24px 0" font-size="23px" line-height="31px" font-weight="700" color="${options.bodyColor}">
          ${escapeHtml(brief.safetyMode.headline ?? "Weather alert in effect")}
        </mj-text>
        <mj-text padding="10px 24px 24px" font-size="16px" line-height="25px" color="${options.bodyColor}">
          ${escapeHtml(
            brief.safetyMode.instruction ??
              "Follow local guidance and keep outdoor exposure limited.",
          )}
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

function buildSplitCardsSection(left: SplitCard, right: SplitCard) {
  return `
    <mj-section padding="0 20px 20px">
      <mj-column
        width="50%"
        padding="0 10px 0 0"
        background-color="${left.backgroundColor}"
        border="1px solid ${left.borderColor}"
        border-radius="28px"
      >
        <mj-text padding="24px 24px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="${left.eyebrowColor}">
          ${escapeHtml(left.eyebrow)}
        </mj-text>
        <mj-text padding="10px 24px 24px" font-size="16px" line-height="27px" color="${left.bodyColor}">
          ${escapeHtml(left.body)}
        </mj-text>
      </mj-column>
      <mj-column
        width="50%"
        padding="0 0 0 10px"
        background-color="${right.backgroundColor}"
        border="1px solid ${right.borderColor}"
        border-radius="28px"
      >
        <mj-text padding="24px 24px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="${right.eyebrowColor}">
          ${escapeHtml(right.eyebrow)}
        </mj-text>
        <mj-text padding="10px 24px 24px" font-size="16px" line-height="27px" color="${right.bodyColor}">
          ${escapeHtml(right.body)}
        </mj-text>
      </mj-column>
    </mj-section>
  `;
}

function wrapEmailDocument(options: {
  backgroundColor: string;
  previewText: string;
  defaultTextColor: string;
  fontFamily: string;
  body: string;
  headExtras?: string;
}) {
  return `
    <mjml>
      <mj-head>
        <mj-preview>${escapeHtml(options.previewText)}</mj-preview>
        <mj-attributes>
          <mj-all font-family="${options.fontFamily}" />
          <mj-text color="${options.defaultTextColor}" />
          <mj-section padding="0" />
          <mj-column padding="0" />
        </mj-attributes>
        ${options.headExtras ?? ""}
      </mj-head>
      <mj-body background-color="${options.backgroundColor}" width="640px">
        ${options.body}
      </mj-body>
    </mjml>
  `;
}

function renderThermalTemplate({
  brief,
  managementLinks,
  subscriberFirstName,
  weatherSnapshot,
}: EmailTemplateContext) {
  const greeting = getGreeting(subscriberFirstName);
  const theme = getThermalTheme(weatherSnapshot.temperatureHighF);
  const feelsLikeGap = brief.temperatureTranslation.feelsLikeGap;
  const showFeelsLikeAlert = Math.abs(feelsLikeGap) >= 8;
  const heroGradient = getThermalGradient(theme);
  const heroHeading = getThermalHeroHeading(brief);
  const feelsLikeLabel = getThermalFeelsLikeLabel(brief, weatherSnapshot);

  return wrapEmailDocument({
    backgroundColor: theme.pageBg,
    previewText: brief.previewText,
    defaultTextColor: "#1E3055",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
    headExtras: `
      <mj-html-attributes>
        <mj-selector path=".thermal-hero > table > tbody > tr > td">
          <mj-html-attribute name="style" override="true">
            background:${heroGradient}; background-color:${theme.gradientFallback}; border-radius:28px; vertical-align:top; border-collapse:separate; padding:32px 28px 28px;
          </mj-html-attribute>
        </mj-selector>
      </mj-html-attributes>
    `,
    body: `
      <mj-section padding="20px 24px 10px">
        <mj-column>
          <mj-text padding="0" font-size="11px" font-weight="700" letter-spacing="0.20em" text-transform="uppercase" color="#2E5E8A">
            Layer Up
          </mj-text>
        </mj-column>
        <mj-column>
          <mj-text padding="0" font-size="11px" color="#8AA0B8" letter-spacing="0.04em" align="right">
            ${getLocationLine(weatherSnapshot)}
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 16px 18px">
        <mj-column
          css-class="thermal-hero"
          background-color="${theme.gradientFallback}"
          border-radius="28px"
          padding="32px 28px 28px"
        >
          <mj-text padding="0 0 14px" font-size="11px" font-weight="700" letter-spacing="0.22em" text-transform="uppercase" color="rgba(255,255,255,0.5)">
            ${greeting}
          </mj-text>
          <mj-text padding="0 0 6px" font-size="96px" font-weight="800" color="#FFFFFF" line-height="1" letter-spacing="-4px">
            ${weatherSnapshot.temperatureHighF}<span style="font-size:36px; font-weight:400; color:rgba(255,255,255,0.6); vertical-align:top; display:inline-block;">°F</span>
          </mj-text>
          <mj-text padding="0 0 16px" font-size="13px" font-weight="500" letter-spacing="0.04em" color="rgba(255,255,255,0.55)">
            ${feelsLikeLabel.replace(
              `${weatherSnapshot.feelsLikeHighF}°F`,
              `<span style="color:#FFD080; font-weight:700;">${weatherSnapshot.feelsLikeHighF}°F</span>`,
            )}
          </mj-text>
          <mj-divider
            padding="0 0 16px"
            border-color="rgba(255,255,255,0.12)"
            border-width="1px"
          />
          <mj-text padding="0 0 8px" font-size="22px" font-weight="600" color="#FFFFFF" line-height="28px">
            ${escapeHtml(heroHeading)}
          </mj-text>
          <mj-text padding="0" font-size="14px" line-height="22px" color="rgba(255,255,255,0.7)">
            ${escapeHtml(brief.vibe)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSafetyBanner(brief, {
        backgroundColor: "#FFDED1",
        borderColor: "#F59E82",
        eyebrowColor: "#B14E3E",
        bodyColor: "#1F2940",
      })}

      ${
        showFeelsLikeAlert
          ? `
        <mj-section padding="0 16px 14px">
          <mj-column
            background-color="#FFF3E0"
            border="1px solid #FFD080"
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
      `
          : ""
      }

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

      <mj-section padding="0 16px 14px">
        <mj-column width="50%" padding="0 8px 0 0">
          ${buildThermalModeCard({
            eyebrow: "Outdoor",
            body: brief.layers.walking.summary,
            backgroundColor: "#FFFFFF",
            borderColor: theme.cardBorder,
            eyebrowColor: theme.accentColor,
            bodyColor: "#1E3055",
          })}
        </mj-column>
        <mj-column width="50%" padding="0 0 0 8px">
          ${buildThermalModeCard({
            eyebrow: "Errands",
            body: brief.layers.errands.summary,
            backgroundColor: theme.errandCardBg,
            borderColor: theme.errandCardBorder,
            eyebrowColor: theme.secondaryText,
            bodyColor: "#2A4560",
          })}
        </mj-column>
      </mj-section>

      ${buildFamilyRecommendationSection(brief, {
        title: "For The Kids",
        backgroundColor: "#FFFFFF",
        borderColor: theme.cardBorder,
        eyebrowColor: theme.accentColor,
        bodyColor: "#1E3055",
        secondaryColor: theme.secondaryText,
        sectionPadding: "0 16px 14px",
      })}

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
          ${buildAccessoryRows(
            brief,
            theme.accentColor,
            theme.secondaryText,
            theme.cardBorder,
          )}
          <mj-spacer height="6px" />
        </mj-column>
      </mj-section>

      ${buildEmailFooter({
        tagline:
          "Layer Up checks the weather so you can leave the house with less guesswork.",
        textColor: "#7A9AB8",
        linkColor: "#2E5E8A",
        managementLinks,
      })}
    `,
  });
}

function renderClassicTemplate({
  brief,
  managementLinks,
  subscriberFirstName,
  weatherSnapshot,
}: EmailTemplateContext) {
  const greeting = getGreeting(subscriberFirstName);

  return wrapEmailDocument({
    backgroundColor: "#F4ECDD",
    previewText: brief.previewText,
    defaultTextColor: "#233042",
    fontFamily: "'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif",
    body: `
      <mj-section padding="24px 20px 12px">
        <mj-column>
          <mj-text font-size="14px" letter-spacing="1px" text-transform="uppercase" font-weight="700" color="#5F7088">
            Layer Up
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#FFFDF8" border="1px solid #E4DAC8" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="16px" line-height="24px" color="#5F7088">
            ${greeting}
          </mj-text>
          <mj-text padding="10px 28px 0" font-size="34px" line-height="40px" font-weight="700" color="#233042">
            ${escapeHtml(brief.subjectLine)}
          </mj-text>
          <mj-text padding="10px 28px 0" font-size="16px" line-height="26px" color="#4D5A6B">
            ${escapeHtml(brief.previewText)}
          </mj-text>
          <mj-text padding="8px 28px 28px" font-size="13px" line-height="20px" color="#7B8794">
            ${getLocationLine(weatherSnapshot)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSafetyBanner(brief, {
        backgroundColor: "#FCE9E2",
        borderColor: "#E7B4A5",
        eyebrowColor: "#A14D3F",
        bodyColor: "#233042",
      })}

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#FFFDF8" border="1px solid #E4DAC8" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#A14D3F">
            Vibe of the Day
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="24px" line-height="34px" font-weight="700" color="#233042">
            ${escapeHtml(brief.vibe)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSplitCardsSection(
        {
          eyebrow: "Temperature",
          body: brief.temperatureTranslation.summary,
          backgroundColor: "#FFFDF8",
          borderColor: "#E4DAC8",
          eyebrowColor: "#5F7088",
          bodyColor: "#233042",
        },
        {
          eyebrow: "Footwear",
          body: brief.footwear.summary,
          backgroundColor: "#FFFDF8",
          borderColor: "#E4DAC8",
          eyebrowColor: "#5F7088",
          bodyColor: "#233042",
        },
      )}

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#FFFDF8" border="1px solid #E4DAC8" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#5F7088">
            Outdoor / Walking
          </mj-text>
          <mj-text padding="10px 28px 0" font-size="16px" line-height="26px" color="#233042">
            ${escapeHtml(brief.layers.walking.summary)}
          </mj-text>
          <mj-divider padding="20px 28px 0" border-color="#E7DDCD" />
          <mj-text padding="20px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#5F7088">
            Errand Mode
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="16px" line-height="26px" color="#233042">
            ${escapeHtml(brief.layers.errands.summary)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildFamilyRecommendationSection(brief, {
        title: "For The Kids",
        backgroundColor: "#FFFDF8",
        borderColor: "#E4DAC8",
        eyebrowColor: "#A14D3F",
        bodyColor: "#233042",
        secondaryColor: "#5F7088",
      })}

      <mj-section padding="0 20px 24px">
        <mj-column background-color="#FFFDF8" border="1px solid #E4DAC8" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#5F7088">
            Grab Before You Go
          </mj-text>
          ${buildAccessoryParagraphs(brief, "#233042", "#A14D3F")}
          <mj-spacer height="18px" />
        </mj-column>
      </mj-section>

      ${buildEmailFooter({
        tagline:
          "Layer Up checks the weather so you can leave the house with less guesswork.",
        textColor: "#6D7782",
        linkColor: "#7E4A3C",
        managementLinks,
        padding: "0 20px 36px",
        textSize: 13,
      })}
    `,
  });
}

function renderSunriseTemplate({
  brief,
  managementLinks,
  subscriberFirstName,
  weatherSnapshot,
}: EmailTemplateContext) {
  const greeting = getGreeting(subscriberFirstName);

  return wrapEmailDocument({
    backgroundColor: "#FFF3E8",
    previewText: brief.previewText,
    defaultTextColor: "#273247",
    fontFamily: "Georgia, 'Times New Roman', serif",
    body: `
      <mj-section padding="22px 20px 14px">
        <mj-column>
          <mj-text font-size="13px" text-transform="uppercase" letter-spacing="2px" font-weight="700" color="#A96A4C">
            Layer Up Morning Edition
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#FFD2A7" border="1px solid #F0B88A" border-radius="34px">
          <mj-text padding="28px 28px 0" font-size="15px" line-height="23px" color="#8B5035">
            ${greeting}
          </mj-text>
          <mj-text padding="12px 28px 0" font-size="38px" line-height="42px" font-weight="700" color="#213047">
            ${escapeHtml(brief.subjectLine)}
          </mj-text>
          <mj-text padding="12px 28px 0" font-size="17px" line-height="28px" color="#324866">
            ${escapeHtml(brief.previewText)}
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="13px" line-height="20px" color="#7D5B4B">
            ${getLocationLine(weatherSnapshot)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSafetyBanner(brief, {
        backgroundColor: "#FFF0E0",
        borderColor: "#ECA47A",
        eyebrowColor: "#B35A3D",
        bodyColor: "#213047",
      })}

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#FFF9F2" border="1px solid #F1D7BD" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#A96A4C">
            Day Feel
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="25px" line-height="35px" font-weight="700" color="#213047">
            ${escapeHtml(brief.vibe)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSplitCardsSection(
        {
          eyebrow: "Temperature Read",
          body: brief.temperatureTranslation.summary,
          backgroundColor: "#FFF8EF",
          borderColor: "#F1D7BD",
          eyebrowColor: "#8F654D",
          bodyColor: "#213047",
        },
        {
          eyebrow: "Shoe Read",
          body: brief.footwear.summary,
          backgroundColor: "#FFF0E8",
          borderColor: "#F0C7B1",
          eyebrowColor: "#A15C46",
          bodyColor: "#213047",
        },
      )}

      ${buildSplitCardsSection(
        {
          eyebrow: "Outdoor / Walking",
          body: brief.layers.walking.summary,
          backgroundColor: "#FFF9F2",
          borderColor: "#F1D7BD",
          eyebrowColor: "#8F654D",
          bodyColor: "#213047",
        },
        {
          eyebrow: "Errand Mode",
          body: brief.layers.errands.summary,
          backgroundColor: "#FFF9F2",
          borderColor: "#F1D7BD",
          eyebrowColor: "#8F654D",
          bodyColor: "#213047",
        },
      )}

      ${buildFamilyRecommendationSection(brief, {
        title: "For The Kids",
        backgroundColor: "#FFF9F2",
        borderColor: "#F1D7BD",
        eyebrowColor: "#A96A4C",
        bodyColor: "#213047",
        secondaryColor: "#8F654D",
      })}

      <mj-section padding="0 20px 24px">
        <mj-column background-color="#FFF9F2" border="1px solid #F1D7BD" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#A96A4C">
            Out-the-Door Checklist
          </mj-text>
          ${buildAccessoryParagraphs(brief, "#213047", "#C26B4A")}
          <mj-spacer height="18px" />
        </mj-column>
      </mj-section>

      ${buildEmailFooter({
        tagline: "A brighter take on the daily Layer Up brief.",
        textColor: "#836555",
        linkColor: "#A96A4C",
        managementLinks,
        padding: "0 20px 36px",
        textSize: 13,
      })}
    `,
  });
}

function renderFieldGuideTemplate({
  brief,
  managementLinks,
  subscriberFirstName,
  weatherSnapshot,
}: EmailTemplateContext) {
  const greeting = getGreeting(subscriberFirstName);

  return wrapEmailDocument({
    backgroundColor: "#EEF2E7",
    previewText: brief.previewText,
    defaultTextColor: "#203028",
    fontFamily: "'Trebuchet MS', Arial, sans-serif",
    body: `
      <mj-section padding="22px 20px 14px">
        <mj-column>
          <mj-text font-size="13px" text-transform="uppercase" letter-spacing="2px" font-weight="700" color="#708066">
            Layer Up Field Guide
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#31473A" border-radius="34px">
          <mj-text padding="28px 28px 0" font-size="15px" line-height="23px" color="#DDE8D7">
            ${greeting}
          </mj-text>
          <mj-text padding="12px 28px 0" font-size="36px" line-height="42px" font-weight="700" color="#F6F3E9">
            ${escapeHtml(brief.subjectLine)}
          </mj-text>
          <mj-text padding="12px 28px 0" font-size="16px" line-height="26px" color="#D7E3D1">
            ${escapeHtml(brief.previewText)}
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="13px" line-height="20px" color="#BAC9B2">
            ${getLocationLine(weatherSnapshot)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSafetyBanner(brief, {
        backgroundColor: "#F6E0D3",
        borderColor: "#D8A58B",
        eyebrowColor: "#91533D",
        bodyColor: "#203028",
      })}

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#F9F5E9" border="1px solid #D8D1BE" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#6A7B61">
            Conditions Summary
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="24px" line-height="34px" font-weight="700" color="#203028">
            ${escapeHtml(brief.vibe)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSplitCardsSection(
        {
          eyebrow: "Temperature Read",
          body: brief.temperatureTranslation.summary,
          backgroundColor: "#F9F5E9",
          borderColor: "#D8D1BE",
          eyebrowColor: "#6A7B61",
          bodyColor: "#203028",
        },
        {
          eyebrow: "Footwear Call",
          body: brief.footwear.summary,
          backgroundColor: "#E5EBD9",
          borderColor: "#C6D1B5",
          eyebrowColor: "#52674C",
          bodyColor: "#203028",
        },
      )}

      ${buildSplitCardsSection(
        {
          eyebrow: "Long Outdoor Time",
          body: brief.layers.walking.summary,
          backgroundColor: "#F9F5E9",
          borderColor: "#D8D1BE",
          eyebrowColor: "#6A7B61",
          bodyColor: "#203028",
        },
        {
          eyebrow: "Quick Errands",
          body: brief.layers.errands.summary,
          backgroundColor: "#F9F5E9",
          borderColor: "#D8D1BE",
          eyebrowColor: "#6A7B61",
          bodyColor: "#203028",
        },
      )}

      ${buildFamilyRecommendationSection(brief, {
        title: "For The Kids",
        backgroundColor: "#F9F5E9",
        borderColor: "#D8D1BE",
        eyebrowColor: "#6A7B61",
        bodyColor: "#203028",
        secondaryColor: "#52674C",
      })}

      <mj-section padding="0 20px 24px">
        <mj-column background-color="#F9F5E9" border="1px solid #D8D1BE" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#6A7B61">
            Checklist Before Exit
          </mj-text>
          ${buildAccessoryChecklist(brief, "#203028")}
          <mj-spacer height="18px" />
        </mj-column>
      </mj-section>

      ${buildEmailFooter({
        tagline: "Built for people who want the weather translated into decisions.",
        textColor: "#61725A",
        linkColor: "#4B6142",
        managementLinks,
        padding: "0 20px 36px",
        textSize: 13,
      })}
    `,
  });
}

function renderCityPosterTemplate({
  brief,
  managementLinks,
  subscriberFirstName,
  weatherSnapshot,
}: EmailTemplateContext) {
  const greeting = getGreeting(subscriberFirstName);

  return wrapEmailDocument({
    backgroundColor: "#EFE7DE",
    previewText: brief.previewText,
    defaultTextColor: "#1C2333",
    fontFamily: "'Arial Black', Arial, sans-serif",
    body: `
      <mj-section padding="0">
        <mj-column background-color="#1F2940">
          <mj-text padding="20px 24px" font-size="13px" text-transform="uppercase" letter-spacing="2px" font-weight="700" color="#F7E6CF">
            Layer Up Daily Poster
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 20px 18px">
        <mj-column background-color="#FFF9F1" border="1px solid #D8C7B2" border-radius="0 0 34px 34px">
          <mj-text padding="28px 28px 0" font-size="14px" line-height="22px" color="#7E5C4C">
            ${greeting}
          </mj-text>
          <mj-text padding="12px 28px 0" font-size="40px" line-height="42px" font-weight="700" color="#1F2940">
            ${escapeHtml(brief.subjectLine)}
          </mj-text>
          <mj-text padding="14px 28px 0" font-size="17px" line-height="27px" color="#37445E">
            ${escapeHtml(brief.previewText)}
          </mj-text>
          <mj-text padding="12px 28px 28px" font-size="13px" line-height="20px" color="#7A6A5E">
            ${getLocationLine(weatherSnapshot)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSafetyBanner(brief, {
        backgroundColor: "#FFDED1",
        borderColor: "#F59E82",
        eyebrowColor: "#B14E3E",
        bodyColor: "#1F2940",
      })}

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#FFB39B" border="1px solid #EC9C84" border-radius="30px">
          <mj-text padding="26px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#7B3E35">
            Vibe Report
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="28px" line-height="36px" font-weight="700" color="#1F2940">
            ${escapeHtml(brief.vibe)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSplitCardsSection(
        {
          eyebrow: "Temperature",
          body: brief.temperatureTranslation.summary,
          backgroundColor: "#1F2940",
          borderColor: "#1F2940",
          eyebrowColor: "#F8D8A8",
          bodyColor: "#FFFFFF",
        },
        {
          eyebrow: "Footwear",
          body: brief.footwear.summary,
          backgroundColor: "#FFF9F1",
          borderColor: "#D8C7B2",
          eyebrowColor: "#B14E3E",
          bodyColor: "#1F2940",
        },
      )}

      ${buildSplitCardsSection(
        {
          eyebrow: "Outdoor / Walking",
          body: brief.layers.walking.summary,
          backgroundColor: "#FFF9F1",
          borderColor: "#D8C7B2",
          eyebrowColor: "#B14E3E",
          bodyColor: "#1F2940",
        },
        {
          eyebrow: "Errand Mode",
          body: brief.layers.errands.summary,
          backgroundColor: "#F8D8A8",
          borderColor: "#E3C28D",
          eyebrowColor: "#715038",
          bodyColor: "#1F2940",
        },
      )}

      ${buildFamilyRecommendationSection(brief, {
        title: "For The Kids",
        backgroundColor: "#FFF9F1",
        borderColor: "#D8C7B2",
        eyebrowColor: "#B14E3E",
        bodyColor: "#1F2940",
        secondaryColor: "#7A6A5E",
      })}

      <mj-section padding="0 20px 24px">
        <mj-column background-color="#FFF9F1" border="1px solid #D8C7B2" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#B14E3E">
            Grab Before You Go
          </mj-text>
          ${buildAccessoryParagraphs(brief, "#1F2940", "#B14E3E")}
          <mj-spacer height="18px" />
        </mj-column>
      </mj-section>

      ${buildEmailFooter({
        tagline: "Stronger contrast, bigger attitude, same weather logic underneath.",
        textColor: "#5C5E67",
        linkColor: "#B14E3E",
        managementLinks,
        padding: "0 20px 36px",
        textSize: 13,
      })}
    `,
  });
}

function renderWeekendPopTemplate({
  brief,
  managementLinks,
  subscriberFirstName,
  weatherSnapshot,
}: EmailTemplateContext) {
  const greeting = getGreeting(subscriberFirstName);

  return wrapEmailDocument({
    backgroundColor: "#FFF7D8",
    previewText: brief.previewText,
    defaultTextColor: "#213047",
    fontFamily: "'Trebuchet MS', Arial, sans-serif",
    body: `
      <mj-section padding="18px 20px 8px">
        <mj-column>
          <mj-text font-size="13px" text-transform="uppercase" letter-spacing="2px" font-weight="700" color="#4764A7">
            Layer Up Weekend Pop
          </mj-text>
        </mj-column>
      </mj-section>

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#8DD7D1" border="1px solid #69BEB8" border-radius="34px">
          <mj-text padding="28px 28px 0" font-size="15px" line-height="23px" color="#2A4B62">
            ${greeting}
          </mj-text>
          <mj-text padding="12px 28px 0" font-size="38px" line-height="42px" font-weight="700" color="#213047">
            ${escapeHtml(brief.subjectLine)}
          </mj-text>
          <mj-text padding="12px 28px 0" font-size="17px" line-height="28px" color="#27445E">
            ${escapeHtml(brief.previewText)}
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="13px" line-height="20px" color="#355C74">
            ${getLocationLine(weatherSnapshot)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSafetyBanner(brief, {
        backgroundColor: "#FFD0C3",
        borderColor: "#F0A592",
        eyebrowColor: "#A64E3A",
        bodyColor: "#213047",
      })}

      <mj-section padding="0 20px 20px">
        <mj-column background-color="#FFFFFF" border="1px solid #E7D9B7" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#4764A7">
            Mood Board
          </mj-text>
          <mj-text padding="10px 28px 28px" font-size="27px" line-height="36px" font-weight="700" color="#213047">
            ${escapeHtml(brief.vibe)}
          </mj-text>
        </mj-column>
      </mj-section>

      ${buildSplitCardsSection(
        {
          eyebrow: "Temperature",
          body: brief.temperatureTranslation.summary,
          backgroundColor: "#FFD36E",
          borderColor: "#E8BE56",
          eyebrowColor: "#73521C",
          bodyColor: "#213047",
        },
        {
          eyebrow: "Footwear",
          body: brief.footwear.summary,
          backgroundColor: "#FFB7A5",
          borderColor: "#EA9C88",
          eyebrowColor: "#8D4A3A",
          bodyColor: "#213047",
        },
      )}

      ${buildSplitCardsSection(
        {
          eyebrow: "Outdoor / Walking",
          body: brief.layers.walking.summary,
          backgroundColor: "#FFFFFF",
          borderColor: "#E7D9B7",
          eyebrowColor: "#4764A7",
          bodyColor: "#213047",
        },
        {
          eyebrow: "Errand Mode",
          body: brief.layers.errands.summary,
          backgroundColor: "#C7B8FF",
          borderColor: "#A998E8",
          eyebrowColor: "#5B4CA1",
          bodyColor: "#213047",
        },
      )}

      ${buildFamilyRecommendationSection(brief, {
        title: "For The Kids",
        backgroundColor: "#FFFFFF",
        borderColor: "#E7D9B7",
        eyebrowColor: "#4764A7",
        bodyColor: "#213047",
        secondaryColor: "#586B84",
      })}

      <mj-section padding="0 20px 24px">
        <mj-column background-color="#FFFFFF" border="1px solid #E7D9B7" border-radius="30px">
          <mj-text padding="28px 28px 0" font-size="12px" font-weight="700" text-transform="uppercase" letter-spacing="1px" color="#4764A7">
            Exit Kit
          </mj-text>
          ${buildAccessoryPills(brief)}
          <mj-spacer height="18px" />
        </mj-column>
      </mj-section>

      ${buildEmailFooter({
        tagline:
          "Most playful of the five. Best when the brand wants a little more swagger.",
        textColor: "#586B84",
        linkColor: "#4764A7",
        managementLinks,
        padding: "0 20px 36px",
        textSize: 13,
      })}
    `,
  });
}

export function buildDailyBriefEmailMjml(
  input: EmailTemplateContext & {
    variant?: EmailDesignVariant;
  },
) {
  switch (input.variant ?? "thermal") {
    case "thermal":
      return renderThermalTemplate(input);
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
    default:
      return renderThermalTemplate(input);
  }
}
