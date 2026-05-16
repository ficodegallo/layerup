import { resolveZipCode } from "@/lib/location/resolve-zip-code";
import { sendSignupVerificationEmail } from "@/lib/email/send-signup-verification";
import { createOrRefreshPendingSignup } from "@/lib/subscribers/pending-signup";
import { mapDeliveryHourNumberToEnum } from "@/lib/subscribers/delivery-hour";
import {
  getClientIp,
  getRequestOrigin,
  isSameOriginRequest,
  jsonNoStore,
} from "@/lib/security/http";
import { checkFixedWindowRateLimit } from "@/lib/security/rate-limit";
import { betaSignupSchema } from "@/lib/validation/subscriber";

const maxSignupBodyBytes = 8_192;
const genericSuccessMessage =
  "Check your email for a secure confirmation link to finish joining the beta.";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return jsonNoStore(
      { error: "This request origin is not allowed." },
      { status: 403 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return jsonNoStore(
      { error: "Please submit JSON." },
      { status: 415 },
    );
  }

  const declaredContentLength = Number(request.headers.get("content-length") ?? "0");

  if (
    Number.isFinite(declaredContentLength) &&
    declaredContentLength > maxSignupBodyBytes
  ) {
    return jsonNoStore(
      { error: "That submission is too large." },
      { status: 413 },
    );
  }

  let payload: unknown;

  try {
    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > maxSignupBodyBytes) {
      return jsonNoStore(
        { error: "That submission is too large." },
        { status: 413 },
      );
    }

    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return jsonNoStore(
      { error: "Please submit valid JSON." },
      { status: 400 },
    );
  }

  const parsed = betaSignupSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonNoStore(
      {
        error:
          "Please double-check your email, ZIP code, and any child ages you entered.",
      },
      { status: 400 },
    );
  }

  if (parsed.data.website.trim().length > 0) {
    return jsonNoStore({
      ok: true,
      message: genericSuccessMessage,
    });
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const clientIp = getClientIp(request);
  const ipRateLimit = checkFixedWindowRateLimit(
    `signup:ip:${clientIp}`,
    10,
    1000 * 60 * 15,
  );

  if (!ipRateLimit.allowed) {
    return jsonNoStore(
      {
        error:
          "Too many signup attempts from this connection. Please wait a few minutes and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(ipRateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const emailRateLimit = checkFixedWindowRateLimit(
    `signup:email:${normalizedEmail}`,
    3,
    1000 * 60 * 30,
  );

  if (!emailRateLimit.allowed) {
    return jsonNoStore({
      ok: true,
      message: genericSuccessMessage,
    });
  }

  let location;

  try {
    location = await resolveZipCode(parsed.data.zipCode);
  } catch {
    return jsonNoStore(
      {
        error:
          "We couldn't resolve that ZIP code yet. Please try another US ZIP code.",
      },
      { status: 400 },
    );
  }

  try {
    const pendingSignupResult = await createOrRefreshPendingSignup({
      email: normalizedEmail,
      firstName: parsed.data.firstName?.trim() || null,
      zipCode: location.zipCode,
      timeZone: location.timeZone,
      latitude: location.latitude,
      longitude: location.longitude,
      deliveryHour: mapDeliveryHourNumberToEnum(
        parsed.data.preferredDeliveryHour,
      ),
      children: parsed.data.children,
    });

    if (pendingSignupResult.kind === "verification-created") {
      const confirmationUrl = new URL(
        "/confirm-subscription",
        getRequestOrigin(request),
      );
      confirmationUrl.searchParams.set("token", pendingSignupResult.token);

      await sendSignupVerificationEmail({
        to: normalizedEmail,
        firstName: parsed.data.firstName,
        confirmationUrl: confirmationUrl.toString(),
      });
    }

    return jsonNoStore({
      ok: true,
      message: genericSuccessMessage,
    });
  } catch {
    return jsonNoStore(
      {
        error:
          "We couldn't start your secure signup right now. Please try again in a minute.",
      },
      { status: 500 },
    );
  }
}
