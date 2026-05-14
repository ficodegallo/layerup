import { notFound } from "next/navigation";

import { generateDailyBrief } from "@/lib/briefing/generate-daily-brief";
import { mockForecast } from "@/lib/briefing/mock-forecast";
import type { DailyBrief } from "@/lib/briefing/types";
import { getPrismaClient } from "@/lib/db";
import {
  EMAIL_DESIGN_VARIANTS,
  type EmailDesignVariantMeta,
} from "@/lib/email/email-design-library";
import { renderDailyBriefEmail } from "@/lib/email/render-daily-brief-email";
import { guardInternalPage } from "@/lib/security/internal-only";
import { getLiveWeatherSnapshot } from "@/lib/weather/get-live-weather-snapshot";
import type { WeatherSnapshot } from "@/lib/weather/types";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type EmailDesignsPageProps = {
  searchParams: Promise<{
    email?: string;
    dailyBriefingId?: string;
  }>;
};

type PreviewSource = {
  brief: DailyBrief;
  weatherSnapshot: WeatherSnapshot;
  subscriberFirstName?: string | null;
  sourceLabel: string;
};

async function getPreviewSource(
  params: Awaited<EmailDesignsPageProps["searchParams"]>,
): Promise<PreviewSource> {
  const prisma = getPrismaClient();

  const savedBriefing = await prisma.dailyBriefing.findFirst({
    where: {
      ...(params.dailyBriefingId ? { id: params.dailyBriefingId } : undefined),
      ...(params.email
        ? {
            subscriber: {
              email: params.email.trim().toLowerCase(),
            },
          }
        : undefined),
    },
    include: {
      subscriber: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (savedBriefing) {
    return {
      brief: savedBriefing.renderedSections as unknown as DailyBrief,
      weatherSnapshot: savedBriefing.weatherSummary as unknown as WeatherSnapshot,
      subscriberFirstName: savedBriefing.subscriber.firstName,
      sourceLabel: `Using the latest saved briefing for ${savedBriefing.subscriber.email}.`,
    };
  }

  const previewZipCode = process.env.LAYER_UP_PREVIEW_ZIP ?? "60618";

  try {
    const snapshot = await getLiveWeatherSnapshot(previewZipCode);

    return {
      brief: generateDailyBrief(snapshot),
      weatherSnapshot: snapshot,
      subscriberFirstName: "Nick",
      sourceLabel: `Using a live forecast preview for ${snapshot.locationName} (${snapshot.zipCode}).`,
    };
  } catch (error) {
    console.error("Falling back to sample preview for email design gallery.", error);

    return {
      brief: generateDailyBrief(mockForecast),
      weatherSnapshot: mockForecast,
      subscriberFirstName: "Nick",
      sourceLabel: "Using the local sample forecast because live preview data was unavailable.",
    };
  }
}

type RenderedDesign = {
  meta: EmailDesignVariantMeta;
  html: string;
};

export default async function EmailDesignsPage({
  searchParams,
}: EmailDesignsPageProps) {
  guardInternalPage();

  const params = await searchParams;
  const preview = await getPreviewSource(params);

  if (!preview.brief || !preview.weatherSnapshot) {
    notFound();
  }

  const renderedDesigns: RenderedDesign[] = await Promise.all(
    EMAIL_DESIGN_VARIANTS.map(async (meta) => {
      const rendered = await renderDailyBriefEmail({
        brief: preview.brief,
        subscriberFirstName: preview.subscriberFirstName,
        weatherSnapshot: preview.weatherSnapshot,
        variant: meta.id,
      });

      return {
        meta,
        html: rendered.html,
      };
    }),
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ebf0f6_54%,#dbe5ef_100%)] px-6 py-10 text-[#1e3055]">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl border border-[#d4e0ee] bg-white/88 p-6 shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
            Email Design Gallery
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {EMAIL_DESIGN_VARIANTS.length} Layer Up email directions, one place to
            compare them.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5d7c98]">
            {preview.sourceLabel}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5d7c98]">
            Thermal is now the live default template. The older directions are
            still here for comparison, and the base layout issue that was causing
            awkward metric-card spacing has been resolved in the new default.
          </p>
        </div>

        {renderedDesigns.map((design, index) => (
          <section
            key={design.meta.id}
            className="space-y-4 rounded-[32px] border border-[#d4e0ee] bg-white/78 p-5 shadow-[0_24px_70px_rgba(38,68,109,0.12)]"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
                  Design {index + 1}
                  {design.meta.id === "thermal" ? " / Current Base" : ""}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{design.meta.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5d7c98]">
                  {design.meta.summary}
                </p>
              </div>
              <div className="rounded-full border border-[#d4e0ee] bg-[#eef3f8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5d7c98]">
                Creativity: {design.meta.creativity}
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[#d4e0ee] bg-[#eef3f8]">
              <iframe
                title={design.meta.name}
                srcDoc={design.html}
                className="h-[1480px] w-full bg-white"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-[#d4e0ee] bg-[#f6f9fc] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7c98]">
                  Pros
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#1e3055]">
                  {design.meta.pros.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-[#d4e0ee] bg-[#f6f9fc] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7c98]">
                  Cons
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#1e3055]">
                  {design.meta.cons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl border border-[#d4e0ee] bg-[#f6f9fc] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5d7c98]">
                  Tradeoffs
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#1e3055]">
                  {design.meta.tradeoffs.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
