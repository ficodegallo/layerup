import { NextResponse } from "next/server";
import { z } from "zod";

import { sendDailyBrief } from "@/lib/email/send-daily-brief";

const sendDailyBriefSchema = z.object({
  email: z.email().optional(),
  dailyBriefingId: z.string().min(1).optional(),
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

  const parsed = sendDailyBriefSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Pass a valid email or dailyBriefingId if you want to target one." },
      { status: 400 },
    );
  }

  try {
    const result = await sendDailyBrief(parsed.data);

    return NextResponse.json({
      ok: true,
      message: "Daily brief sent.",
      jobRunId: result.jobRunId,
      dailyBriefingId: result.dailyBriefingId,
      to: result.to,
      subject: result.subject,
      sendgridStatusCode: result.sendgridStatusCode,
      sendgridMessageId: result.sendgridMessageId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send the daily brief.",
      },
      { status: 500 },
    );
  }
}
