import { createHash, randomBytes } from "node:crypto";

import {
  DeliveryHour,
  SubscriberStatus,
} from "@prisma/client";
import { getPrismaClient } from "@/lib/db";
import { childSignupListSchema } from "@/lib/validation/subscriber";

const verificationWindowMs = 1000 * 60 * 60 * 24;
const resendCooldownMs = 1000 * 60 * 10;

type PendingSignupInput = {
  email: string;
  firstName: string | null;
  zipCode: string;
  timeZone: string;
  latitude: number;
  longitude: number;
  deliveryHour: DeliveryHour;
  children: Array<{ ageYears: number }>;
};

type PendingSignupResult =
  | {
      kind: "verification-created";
      token: string;
      resendAvailableAt: Date;
    }
  | {
      kind: "cooldown";
      resendAvailableAt: Date;
    };

type ConfirmPendingSignupResult =
  | {
      kind: "confirmed";
      email: string;
    }
  | {
      kind: "expired";
    }
  | {
      kind: "invalid";
    };

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createVerificationToken() {
  return randomBytes(32).toString("hex");
}

export async function createOrRefreshPendingSignup(
  input: PendingSignupInput,
): Promise<PendingSignupResult> {
  const prisma = getPrismaClient();
  const now = new Date();
  const existing = await prisma.pendingSignup.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
      lastVerificationSentAt: true,
    },
  });

  if (
    existing?.lastVerificationSentAt &&
    now.getTime() - existing.lastVerificationSentAt.getTime() < resendCooldownMs
  ) {
    return {
      kind: "cooldown",
      resendAvailableAt: new Date(
        existing.lastVerificationSentAt.getTime() + resendCooldownMs,
      ),
    };
  }

  const token = createVerificationToken();
  const tokenHash = hashVerificationToken(token);
  const verificationTokenExpiresAt = new Date(
    now.getTime() + verificationWindowMs,
  );

  await prisma.pendingSignup.upsert({
    where: {
      email: input.email,
    },
    create: {
      ...input,
      children: input.children,
      verificationTokenHash: tokenHash,
      verificationTokenExpiresAt,
      lastVerificationSentAt: now,
    },
    update: {
      ...input,
      children: input.children,
      verificationTokenHash: tokenHash,
      verificationTokenExpiresAt,
      lastVerificationSentAt: now,
    },
  });

  return {
    kind: "verification-created",
    token,
    resendAvailableAt: new Date(now.getTime() + resendCooldownMs),
  };
}

export async function confirmPendingSignup(
  token: string,
): Promise<ConfirmPendingSignupResult> {
  const prisma = getPrismaClient();
  const pendingSignup = await prisma.pendingSignup.findUnique({
    where: {
      verificationTokenHash: hashVerificationToken(token),
    },
  });

  if (!pendingSignup) {
    return {
      kind: "invalid",
    };
  }

  if (pendingSignup.verificationTokenExpiresAt.getTime() < Date.now()) {
    await prisma.pendingSignup.delete({
      where: {
        id: pendingSignup.id,
      },
    });

    return {
      kind: "expired",
    };
  }

  const parsedChildren = childSignupListSchema.safeParse(pendingSignup.children);
  const children = parsedChildren.success ? parsedChildren.data : [];

  await prisma.$transaction(async (tx) => {
    const existingSubscriber = await tx.subscriber.findUnique({
      where: {
        email: pendingSignup.email,
      },
      select: {
        id: true,
      },
    });

    const childProfiles = children.map((child, index) => ({
      sortOrder: index,
      reportedAgeYears: child.ageYears,
      ageRecordedAt: new Date(),
    }));

    if (existingSubscriber) {
      await tx.subscriber.update({
        where: {
          id: existingSubscriber.id,
        },
        data: {
          firstName: pendingSignup.firstName,
          zipCode: pendingSignup.zipCode,
          timeZone: pendingSignup.timeZone,
          latitude: pendingSignup.latitude,
          longitude: pendingSignup.longitude,
          deliveryHour: pendingSignup.deliveryHour,
          status: SubscriberStatus.ACTIVE,
          children: {
            deleteMany: {},
            ...(childProfiles.length > 0
              ? {
                  create: childProfiles,
                }
              : {}),
          },
        },
      });
    } else {
      await tx.subscriber.create({
        data: {
          email: pendingSignup.email,
          firstName: pendingSignup.firstName,
          zipCode: pendingSignup.zipCode,
          timeZone: pendingSignup.timeZone,
          latitude: pendingSignup.latitude,
          longitude: pendingSignup.longitude,
          deliveryHour: pendingSignup.deliveryHour,
          status: SubscriberStatus.ACTIVE,
          ...(childProfiles.length > 0
            ? {
                children: {
                  create: childProfiles,
                },
              }
            : {}),
        },
      });
    }

    await tx.pendingSignup.delete({
      where: {
        id: pendingSignup.id,
      },
    });
  });

  return {
    kind: "confirmed",
    email: pendingSignup.email,
  };
}
