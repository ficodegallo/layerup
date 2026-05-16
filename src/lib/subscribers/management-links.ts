import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import {
  DeliveryHour,
  HumorMode,
  LifestyleMode,
  MeasurementSystem,
  SubscriberStatus,
} from "@prisma/client";

import { buildAbsoluteAppUrl } from "@/lib/app-url";
import { getPrismaClient } from "@/lib/db";

const tokenLifetimeMs = 1000 * 60 * 60 * 24 * 30;
const tokenPurpose = "subscriber-management";
const tokenVersion = 1;

type SubscriberManagementTokenPayload = {
  exp: number;
  iat: number;
  purpose: typeof tokenPurpose;
  subscriberId: string;
  version: typeof tokenVersion;
};

type SubscriberManagementTokenVerificationResult =
  | {
      kind: "expired";
    }
  | {
      kind: "invalid";
    }
  | {
      kind: "valid";
      payload: SubscriberManagementTokenPayload;
    };

export type SubscriberManagementAccessResult =
  | {
      kind: "expired";
    }
  | {
      kind: "invalid";
    }
  | {
      kind: "valid";
      subscriber: {
        id: string;
        email: string;
        firstName: string | null;
        zipCode: string;
        timeZone: string;
        deliveryHour: DeliveryHour;
        humorMode: HumorMode;
        lifestyleMode: LifestyleMode;
        measurementSystem: MeasurementSystem;
        status: SubscriberStatus;
        childProfileCount: number;
      };
    };

export type SubscriberManagementLinks = {
  manageUrl: string;
  unsubscribeUrl: string;
};

function getSubscriberManagementSecret() {
  const explicitSecret = process.env.SUBSCRIBER_MANAGEMENT_SECRET?.trim();

  if (explicitSecret) {
    return explicitSecret;
  }

  const fallbackSecret = process.env.CRON_SECRET?.trim();

  if (fallbackSecret) {
    return fallbackSecret;
  }

  throw new Error(
    "SUBSCRIBER_MANAGEMENT_SECRET is not configured. Add it before generating subscriber management links.",
  );
}

function encodePayload(payload: SubscriberManagementTokenPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(
  encodedPayload: string,
): SubscriberManagementTokenPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<SubscriberManagementTokenPayload>;

    if (
      parsed.version !== tokenVersion ||
      parsed.purpose !== tokenPurpose ||
      typeof parsed.subscriberId !== "string" ||
      parsed.subscriberId.trim().length === 0 ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    return {
      exp: parsed.exp,
      iat: parsed.iat,
      purpose: parsed.purpose,
      subscriberId: parsed.subscriberId,
      version: parsed.version,
    };
  } catch {
    return null;
  }
}

function createTokenSignature(encodedPayload: string) {
  return createHmac("sha256", getSubscriberManagementSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function buildManagePath(token: string) {
  return `/manage-subscription?token=${encodeURIComponent(token)}`;
}

function buildUnsubscribePath(token: string) {
  return `/unsubscribe?token=${encodeURIComponent(token)}`;
}

function createVerificationResult(
  payload: SubscriberManagementTokenPayload,
): SubscriberManagementTokenVerificationResult {
  if (payload.exp <= Date.now()) {
    return {
      kind: "expired",
    };
  }

  return {
    kind: "valid",
    payload,
  };
}

export function createSubscriberManagementToken(subscriberId: string) {
  const issuedAt = Date.now();
  const payload: SubscriberManagementTokenPayload = {
    exp: issuedAt + tokenLifetimeMs,
    iat: issuedAt,
    purpose: tokenPurpose,
    subscriberId,
    version: tokenVersion,
  };
  const encodedPayload = encodePayload(payload);
  const signature = createTokenSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySubscriberManagementToken(
  token: string,
): SubscriberManagementTokenVerificationResult {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return {
      kind: "invalid",
    };
  }

  const expectedSignature = createTokenSignature(encodedPayload);
  const actualSignatureBuffer = Buffer.from(signature, "utf8");
  const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    actualSignatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)
  ) {
    return {
      kind: "invalid",
    };
  }

  const payload = decodePayload(encodedPayload);

  if (!payload) {
    return {
      kind: "invalid",
    };
  }

  return createVerificationResult(payload);
}

export async function resolveSubscriberManagementAccess(
  token: string,
): Promise<SubscriberManagementAccessResult> {
  const verification = verifySubscriberManagementToken(token);

  if (verification.kind !== "valid") {
    return verification;
  }

  const prisma = getPrismaClient();
  const subscriber = await prisma.subscriber.findUnique({
    where: {
      id: verification.payload.subscriberId,
    },
    include: {
      children: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!subscriber) {
    return {
      kind: "invalid",
    };
  }

  return {
    kind: "valid",
    subscriber: {
      id: subscriber.id,
      email: subscriber.email,
      firstName: subscriber.firstName,
      zipCode: subscriber.zipCode,
      timeZone: subscriber.timeZone,
      deliveryHour: subscriber.deliveryHour,
      humorMode: subscriber.humorMode,
      lifestyleMode: subscriber.lifestyleMode,
      measurementSystem: subscriber.measurementSystem,
      status: subscriber.status,
      childProfileCount: subscriber.children.length,
    },
  };
}

export function buildSubscriberManagementLinks(
  subscriberId: string,
): SubscriberManagementLinks {
  const token = createSubscriberManagementToken(subscriberId);

  return {
    manageUrl: buildAbsoluteAppUrl(buildManagePath(token)),
    unsubscribeUrl: buildAbsoluteAppUrl(buildUnsubscribePath(token)),
  };
}
