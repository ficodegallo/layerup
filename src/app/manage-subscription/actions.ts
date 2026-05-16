"use server";

import { SubscriberStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { getPrismaClient } from "@/lib/db";
import { resolveZipCode } from "@/lib/location/resolve-zip-code";
import {
  mapDeliveryHourNumberToEnum,
} from "@/lib/subscribers/delivery-hour";
import { resolveSubscriberManagementAccess } from "@/lib/subscribers/management-links";
import { subscriberPreferencesSchema } from "@/lib/validation/subscriber";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildManageRedirectUrl(
  token: string,
  status: string,
) {
  const params = new URLSearchParams({ status });

  if (token) {
    params.set("token", token);
  }

  return `/manage-subscription?${params.toString()}`;
}

function buildUnsubscribeRedirectUrl(
  token: string,
  status: string,
) {
  const params = new URLSearchParams({ status });

  if (token) {
    params.set("token", token);
  }

  return `/unsubscribe?${params.toString()}`;
}

export async function saveManagedSubscriberPreferences(formData: FormData) {
  const token = getFormValue(formData, "token");

  if (!token) {
    redirect(buildManageRedirectUrl("", "missing"));
  }

  const parsed = subscriberPreferencesSchema.safeParse({
    token,
    zipCode: getFormValue(formData, "zipCode"),
    firstName: getFormValue(formData, "firstName"),
    preferredDeliveryHour: Number(formData.get("preferredDeliveryHour") ?? 7),
    humorMode: getFormValue(formData, "humorMode"),
    lifestyleMode: getFormValue(formData, "lifestyleMode"),
    measurementSystem: getFormValue(formData, "measurementSystem"),
  });

  if (!parsed.success) {
    redirect(buildManageRedirectUrl(token, "invalid-input"));
  }

  const access = await resolveSubscriberManagementAccess(parsed.data.token);

  if (access.kind === "invalid") {
    redirect(buildManageRedirectUrl(token, "invalid"));
  }

  if (access.kind === "expired") {
    redirect(buildManageRedirectUrl(token, "expired"));
  }

  let location;

  try {
    location = await resolveZipCode(parsed.data.zipCode);
  } catch {
    redirect(buildManageRedirectUrl(token, "bad-zip"));
  }

  const prisma = getPrismaClient();

  try {
    await prisma.subscriber.update({
      where: {
        id: access.subscriber.id,
      },
      data: {
        firstName: parsed.data.firstName || null,
        zipCode: location.zipCode,
        timeZone: location.timeZone,
        latitude: location.latitude,
        longitude: location.longitude,
        deliveryHour: mapDeliveryHourNumberToEnum(
          parsed.data.preferredDeliveryHour,
        ),
        humorMode: parsed.data.humorMode,
        lifestyleMode: parsed.data.lifestyleMode,
        measurementSystem: parsed.data.measurementSystem,
      },
    });
  } catch {
    redirect(buildManageRedirectUrl(token, "save-failed"));
  }

  redirect(buildManageRedirectUrl(token, "saved"));
}

export async function unsubscribeManagedSubscriber(formData: FormData) {
  const token = getFormValue(formData, "token");

  if (!token) {
    redirect(buildUnsubscribeRedirectUrl("", "missing"));
  }

  const access = await resolveSubscriberManagementAccess(token);

  if (access.kind === "invalid") {
    redirect(buildUnsubscribeRedirectUrl(token, "invalid"));
  }

  if (access.kind === "expired") {
    redirect(buildUnsubscribeRedirectUrl(token, "expired"));
  }

  const prisma = getPrismaClient();

  try {
    await prisma.subscriber.update({
      where: {
        id: access.subscriber.id,
      },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
      },
    });
  } catch {
    redirect(buildUnsubscribeRedirectUrl(token, "unsubscribe-failed"));
  }

  redirect(buildUnsubscribeRedirectUrl(token, "unsubscribed"));
}
