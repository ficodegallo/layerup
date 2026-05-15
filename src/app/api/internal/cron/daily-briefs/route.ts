import { z } from "zod";

import { runDailyBriefDelivery } from "@/lib/jobs/run-daily-brief-delivery";
import { requireCronSecret } from "@/lib/security/cron";
import { jsonNoStore } from "@/lib/security/http";

export const runtime = "nodejs";

function parseOptionalBoolean(value: unknown) {
  if (
    value === true ||
    value === "true" ||
    value === "1" ||
    value === "yes" ||
    value === "on"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === "0" ||
    value === "no" ||
    value === "off"
  ) {
    return false;
  }

  return value;
}

const cronTriggerSchema = z.object({
  email: z.email().optional(),
  subscriberId: z.string().min(1).optional(),
  force: z.preprocess(parseOptionalBoolean, z.boolean().optional()),
  dryRun: z.preprocess(parseOptionalBoolean, z.boolean().optional()),
});

async function parseTriggerInput(request: Request) {
  if (request.method === "GET") {
    const url = new URL(request.url);

    return Object.fromEntries(url.searchParams.entries());
  }

  try {
    const rawBody = await request.text();

    return rawBody ? JSON.parse(rawBody) : {};
  } catch {
    throw new Error("Please submit valid JSON.");
  }
}

async function handleTrigger(request: Request) {
  const unauthorizedResponse = requireCronSecret(request);

  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  let parsedInput: unknown;

  try {
    parsedInput = await parseTriggerInput(request);
  } catch (error) {
    return jsonNoStore(
      {
        error:
          error instanceof Error ? error.message : "Please submit valid JSON.",
      },
      { status: 400 },
    );
  }

  const parsed = cronTriggerSchema.safeParse(parsedInput);

  if (!parsed.success) {
    return jsonNoStore(
      {
        error:
          "Pass a valid email or subscriberId if you want to target a single subscriber.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await runDailyBriefDelivery(parsed.data);

    return jsonNoStore(
      {
        ok: result.failedCount === 0,
        ...result,
      },
      {
        status: result.failedCount > 0 ? 500 : 200,
      },
    );
  } catch (error) {
    return jsonNoStore(
      {
        error:
          error instanceof Error
            ? error.message
            : "The scheduled delivery run failed.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handleTrigger(request);
}

export async function POST(request: Request) {
  return handleTrigger(request);
}
