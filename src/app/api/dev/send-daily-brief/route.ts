import { z } from "zod";

import { sendDailyBrief } from "@/lib/email/send-daily-brief";
import { internalRouteUnavailable } from "@/lib/security/internal-only";
import { jsonNoStore } from "@/lib/security/http";

const sendDailyBriefSchema = z.object({
  email: z.email().optional(),
  dailyBriefingId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const unavailableResponse = internalRouteUnavailable();

  if (unavailableResponse) {
    return unavailableResponse;
  }

  let payload: unknown = {};

  try {
    const rawBody = await request.text();
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return jsonNoStore(
      { error: "Please submit valid JSON." },
      { status: 400 },
    );
  }

  const parsed = sendDailyBriefSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonNoStore(
      { error: "Pass a valid email or dailyBriefingId if you want to target one." },
      { status: 400 },
    );
  }

  try {
    const result = await sendDailyBrief(parsed.data);

    return jsonNoStore({
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
    return jsonNoStore(
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
