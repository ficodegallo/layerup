import { timingSafeEqual } from "node:crypto";

import { jsonNoStore } from "@/lib/security/http";

function headersMatch(expected: string, actual: string | null) {
  if (!actual) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(actual, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function requireCronSecret(request: Request) {
  const configuredSecret = process.env.CRON_SECRET?.trim();

  if (!configuredSecret) {
    return jsonNoStore(
      {
        error: "CRON_SECRET is not configured for scheduled delivery.",
      },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization")?.trim() ?? null;
  const expectedHeader = `Bearer ${configuredSecret}`;

  if (!headersMatch(expectedHeader, authHeader)) {
    return jsonNoStore(
      {
        error: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  return null;
}
