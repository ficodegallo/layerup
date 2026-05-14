import mjml2html from "mjml";

import type { DailyBrief } from "@/lib/briefing/types";
import {
  buildDailyBriefEmailMjml,
  type EmailDesignVariant,
} from "@/lib/email/email-design-library";
import type { WeatherSnapshot } from "@/lib/weather/types";

type RenderDailyBriefEmailInput = {
  brief: DailyBrief;
  subscriberFirstName?: string | null;
  weatherSnapshot: WeatherSnapshot;
  variant?: EmailDesignVariant;
};

type RenderedEmail = {
  html: string;
  text: string;
  previewText: string;
};

function renderPlainText(
  brief: DailyBrief,
  weatherSnapshot: WeatherSnapshot,
  subscriberFirstName?: string | null,
) {
  const greeting = subscriberFirstName
    ? `Hi ${subscriberFirstName},`
    : "Good morning,";
  const accessoryLines =
    brief.accessories.items.length > 0
      ? brief.accessories.items
          .map((item) => `- ${item.name}: ${item.comment}`)
          .join("\n")
      : "- No extra gear required today.";

  const safetyBlock = brief.safetyMode.active
    ? `\nSAFETY MODE\n${brief.safetyMode.headline ?? "Weather alert in effect"}\n${brief.safetyMode.instruction ?? ""}\n`
    : "";
  const childLines =
    (brief.family?.children.length ?? 0) > 0
      ? `\nFor The Kids\n${(brief.family?.children ?? [])
          .map(
            (child) =>
              `- ${child.label} (Age ${child.ageYears}, ${child.cohort}): ${child.summary} Highlights: ${child.highlights.join(", ")}.`,
          )
          .join("\n")}\n`
      : "";

  return `${greeting}

${brief.subjectLine}
${brief.previewText}

Location: ${weatherSnapshot.locationName} (${weatherSnapshot.zipCode})
Vibe: ${brief.vibe}

Temperature
${brief.temperatureTranslation.summary}

Outdoor / Walking
${brief.layers.walking.summary}

Errand Mode
${brief.layers.errands.summary}
${childLines}

Footwear
${brief.footwear.summary}

Before You Leave
${accessoryLines}
${safetyBlock}
Layer Up`;
}

export async function renderDailyBriefEmail({
  brief,
  subscriberFirstName,
  weatherSnapshot,
  variant,
}: RenderDailyBriefEmailInput): Promise<RenderedEmail> {
  const mjml = buildDailyBriefEmailMjml({
    brief,
    subscriberFirstName,
    weatherSnapshot,
    variant,
  });

  const result = await mjml2html(mjml, {
    minify: false,
    validationLevel: "soft",
  });
  const errors = result.errors ?? [];

  if (errors.length > 0) {
    throw new Error(
      `MJML rendering produced errors: ${errors
        .map((error: { message: string }) => error.message)
        .join("; ")}`,
    );
  }

  return {
    html: result.html,
    text: renderPlainText(brief, weatherSnapshot, subscriberFirstName),
    previewText: brief.previewText,
  };
}
