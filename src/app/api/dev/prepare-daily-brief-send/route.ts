import { NextResponse } from "next/server";
import { z } from "zod";

import { prepareDailyBriefSend } from "@/lib/email/prepare-daily-brief-send";

const prepareDailyBriefSendSchema = z.object({
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

  const parsed = prepareDailyBriefSendSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Pass a valid email or dailyBriefingId if you want to target one." },
      { status: 400 },
    );
  }

  try {
    const preparedSend = await prepareDailyBriefSend(parsed.data);

    return NextResponse.json({
      ok: true,
      sendReady: preparedSend.sendReady,
      dailyBriefingId: preparedSend.dailyBriefingId,
      to: preparedSend.to,
      subject: preparedSend.subject,
      previewText: preparedSend.previewText,
      text: preparedSend.text,
      html: preparedSend.html,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to prepare the daily brief send payload.",
      },
      { status: 500 },
    );
  }
}
