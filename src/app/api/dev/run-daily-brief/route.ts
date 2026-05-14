import { NextResponse } from "next/server";
import { z } from "zod";

import { persistDailyBriefForSubscriber } from "@/lib/briefing/persist-daily-brief";

const runDailyBriefSchema = z.object({
  email: z.email().optional(),
  subscriberId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let payload: unknown = {};

  try {
    const rawBody = await request.text();
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json(
      { error: "Please submit valid JSON." },
      { status: 400 },
    );
  }

  const parsed = runDailyBriefSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Pass a valid email or subscriber id if you want to target one." },
      { status: 400 },
    );
  }

  try {
    const result = await persistDailyBriefForSubscriber(parsed.data);

    return NextResponse.json({
      ok: true,
      message: "Daily brief generated and saved.",
      jobRunId: result.jobRunId,
      subscriber: {
        id: result.subscriber.id,
        email: result.subscriber.email,
      },
      forecastSnapshot: {
        id: result.forecastSnapshot.id,
        forecastDateLocal: result.forecastSnapshot.forecastDateLocal,
        zipCode: result.forecastSnapshot.zipCode,
      },
      dailyBriefing: {
        id: result.dailyBriefing.id,
        localSendDate: result.dailyBriefing.localSendDate,
        subjectLine: result.dailyBriefing.subjectLine,
        status: result.dailyBriefing.status,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate the daily brief.",
      },
      { status: 500 },
    );
  }
}
