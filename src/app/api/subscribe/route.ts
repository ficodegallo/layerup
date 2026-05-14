import { NextResponse } from "next/server";

import {
  DeliveryHour,
  SubscriberStatus,
} from "@prisma/client";
import { getPrismaClient } from "@/lib/db";
import { resolveZipCode } from "@/lib/location/resolve-zip-code";
import { betaSignupSchema } from "@/lib/validation/subscriber";

function mapDeliveryHour(hour: 6 | 7 | 8) {
  if (hour === 6) {
    return DeliveryHour.SIX_AM;
  }

  if (hour === 8) {
    return DeliveryHour.EIGHT_AM;
  }

  return DeliveryHour.SEVEN_AM;
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Please submit valid JSON." },
      { status: 400 },
    );
  }

  const parsed = betaSignupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Please double-check your email, ZIP code, and any child ages you entered.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const firstName = parsed.data.firstName?.trim() || null;
  const ageRecordedAt = new Date();
  const childProfiles = parsed.data.children.map((child, index) => ({
    sortOrder: index,
    reportedAgeYears: child.ageYears,
    ageRecordedAt,
  }));

  let location;

  try {
    location = await resolveZipCode(parsed.data.zipCode);
  } catch {
    return NextResponse.json(
      {
        error:
          "We couldn't resolve that ZIP code yet. Please try another US ZIP code.",
      },
      { status: 400 },
    );
  }

  try {
    const prisma = getPrismaClient();
    const subscriber = await prisma.subscriber.upsert({
      where: {
        email: normalizedEmail,
      },
      create: {
        email: normalizedEmail,
        firstName,
        zipCode: location.zipCode,
        timeZone: location.timeZone,
        latitude: location.latitude,
        longitude: location.longitude,
        status: SubscriberStatus.ACTIVE,
        deliveryHour: mapDeliveryHour(parsed.data.preferredDeliveryHour),
        ...(childProfiles.length > 0
          ? {
              children: {
                create: childProfiles,
              },
            }
          : {}),
      },
      update: {
        firstName,
        zipCode: location.zipCode,
        timeZone: location.timeZone,
        latitude: location.latitude,
        longitude: location.longitude,
        status: SubscriberStatus.ACTIVE,
        deliveryHour: mapDeliveryHour(parsed.data.preferredDeliveryHour),
        children: {
          deleteMany: {},
          ...(childProfiles.length > 0
            ? {
                create: childProfiles,
              }
            : {}),
        },
      },
      select: {
        id: true,
        email: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      mode: "beta-persisted",
      message:
        childProfiles.length > 0
          ? `You're on the beta list for ${location.displayName}, with child recommendations turned on.`
          : `You're on the beta list for ${location.displayName}.`,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        zipCode: location.zipCode,
        timeZone: location.timeZone,
        childCount: subscriber._count.children,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown signup persistence error.";

    return NextResponse.json(
      {
        error: message.includes("DATABASE_URL")
          ? "Signup storage is not configured on this machine yet. Add DATABASE_URL to enable persistence."
          : "We couldn't save your signup right now. Please try again in a minute.",
      },
      { status: message.includes("DATABASE_URL") ? 503 : 500 },
    );
  }
}
