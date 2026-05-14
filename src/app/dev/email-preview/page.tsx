import { notFound } from "next/navigation";

import { getPrismaClient } from "@/lib/db";
import { renderDailyBriefEmail } from "@/lib/email/render-daily-brief-email";
import type { DailyBrief } from "@/lib/briefing/types";
import type { WeatherSnapshot } from "@/lib/weather/types";

export const dynamic = "force-dynamic";

type EmailPreviewPageProps = {
  searchParams: Promise<{
    email?: string;
    dailyBriefingId?: string;
  }>;
};

export default async function EmailPreviewPage({
  searchParams,
}: EmailPreviewPageProps) {
  const params = await searchParams;
  const prisma = getPrismaClient();

  const briefing = await prisma.dailyBriefing.findFirst({
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
      createdAt: "desc",
    },
  });

  if (!briefing) {
    notFound();
  }

  const rendered = await renderDailyBriefEmail({
    brief: briefing.renderedSections as unknown as DailyBrief,
    subscriberFirstName: briefing.subscriber.firstName,
    weatherSnapshot: briefing.weatherSummary as unknown as WeatherSnapshot,
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ebf0f6_54%,#dbe5ef_100%)] px-6 py-10 text-[#1e3055]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-[#d4e0ee] bg-white/88 p-6 shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
            Saved Email Preview
          </p>
          <h1 className="mt-3 text-3xl font-semibold">{briefing.subjectLine}</h1>
          <p className="mt-2 text-sm leading-6 text-[#5d7c98]">
            To: {briefing.subscriber.email}
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#d4e0ee] bg-white shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
          <iframe
            title={`Preview for ${briefing.subjectLine}`}
            srcDoc={rendered.html}
            className="min-h-[1400px] w-full bg-white"
          />
        </div>
      </div>
    </main>
  );
}
