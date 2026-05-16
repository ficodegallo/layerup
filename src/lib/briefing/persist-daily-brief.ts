import {
  Prisma,
  BriefingStatus,
  JobKind,
  JobStatus,
  SubscriberStatus,
} from "@prisma/client";
import { generateDailyBrief } from "@/lib/briefing/generate-daily-brief";
import { getPrismaClient } from "@/lib/db";
import { renderDailyBriefEmail } from "@/lib/email/render-daily-brief-email";
import { getEffectiveChildAgeYears } from "@/lib/family/child-outfit-recommendations";
import { resolveZipCode } from "@/lib/location/resolve-zip-code";
import { buildSubscriberManagementLinks } from "@/lib/subscribers/management-links";
import { getLiveWeatherSnapshot } from "@/lib/weather/get-live-weather-snapshot";

function toDateOnlyUtc(dateString: string) {
  const dateOnly = dateString.split("T")[0];
  return new Date(`${dateOnly}T12:00:00Z`);
}

type PersistDailyBriefOptions = {
  email?: string;
  subscriberId?: string;
};

export async function persistDailyBriefForSubscriber(
  options: PersistDailyBriefOptions = {},
) {
  const prisma = getPrismaClient();
  const jobRun = await prisma.jobRun.create({
    data: {
      kind: JobKind.DAILY_BRIEF_GENERATION,
      status: JobStatus.RUNNING,
      startedAt: new Date(),
      scope: options,
    },
  });

  try {
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        status: SubscriberStatus.ACTIVE,
        ...(options.email
          ? { email: options.email.trim().toLowerCase() }
          : undefined),
        ...(options.subscriberId ? { id: options.subscriberId } : undefined),
      },
      include: {
        children: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscriber) {
      throw new Error(
        "No active subscriber matched the request. Pass an existing email or subscriber id.",
      );
    }

    if (!subscriber.latitude || !subscriber.longitude) {
      const resolvedLocation = await resolveZipCode(subscriber.zipCode);

      await prisma.subscriber.update({
        where: {
          id: subscriber.id,
        },
        data: {
          timeZone: resolvedLocation.timeZone,
          latitude: resolvedLocation.latitude,
          longitude: resolvedLocation.longitude,
        },
      });
    }

    const weatherSnapshot = await getLiveWeatherSnapshot(subscriber.zipCode);
    const referenceDate = new Date();
    const brief = generateDailyBrief(weatherSnapshot, {
      children: subscriber.children.map((child) => ({
        ageYears: getEffectiveChildAgeYears(
          child.reportedAgeYears,
          child.ageRecordedAt,
          referenceDate,
        ),
      })),
    });
    const renderedEmail = await renderDailyBriefEmail({
      brief,
      managementLinks: buildSubscriberManagementLinks(subscriber.id),
      subscriberFirstName: subscriber.firstName,
      weatherSnapshot,
    });
    const forecastDateLocal = toDateOnlyUtc(weatherSnapshot.forecastDate);

    const forecastSnapshot = await prisma.forecastSnapshot.upsert({
      where: {
        zipCode_forecastDateLocal: {
          zipCode: weatherSnapshot.zipCode,
          forecastDateLocal,
        },
      },
      create: {
        zipCode: weatherSnapshot.zipCode,
        timeZone: weatherSnapshot.timeZone,
        latitude: weatherSnapshot.latitude,
        longitude: weatherSnapshot.longitude,
        forecastDateLocal,
        source: "open-meteo+nws",
        sourceRunAt: new Date(),
        normalizedForecast: weatherSnapshot,
        normalizedAlerts: weatherSnapshot.nwsAlert ?? Prisma.JsonNull,
      },
      update: {
        timeZone: weatherSnapshot.timeZone,
        latitude: weatherSnapshot.latitude,
        longitude: weatherSnapshot.longitude,
        source: "open-meteo+nws",
        sourceRunAt: new Date(),
        normalizedForecast: weatherSnapshot,
        normalizedAlerts: weatherSnapshot.nwsAlert ?? Prisma.JsonNull,
      },
    });

    const dailyBriefing = await prisma.dailyBriefing.upsert({
      where: {
        subscriberId_localSendDate: {
          subscriberId: subscriber.id,
          localSendDate: forecastDateLocal,
        },
      },
      create: {
        subscriberId: subscriber.id,
        forecastSnapshotId: forecastSnapshot.id,
        localSendDate: forecastDateLocal,
        status: BriefingStatus.READY,
        subjectLine: brief.subjectLine,
        previewText: brief.previewText,
        weatherSummary: weatherSnapshot,
        renderedSections: brief,
        renderedHtml: renderedEmail.html,
        renderedText: renderedEmail.text,
      },
      update: {
        forecastSnapshotId: forecastSnapshot.id,
        status: BriefingStatus.READY,
        subjectLine: brief.subjectLine,
        previewText: brief.previewText,
        weatherSummary: weatherSnapshot,
        renderedSections: brief,
        renderedHtml: renderedEmail.html,
        renderedText: renderedEmail.text,
      },
    });

    await prisma.jobRun.update({
      where: {
        id: jobRun.id,
      },
      data: {
        status: JobStatus.SUCCEEDED,
        finishedAt: new Date(),
        detail: {
          subscriberId: subscriber.id,
          subscriberEmail: subscriber.email,
          forecastSnapshotId: forecastSnapshot.id,
          dailyBriefingId: dailyBriefing.id,
          forecastDate: weatherSnapshot.forecastDate,
          subjectLine: brief.subjectLine,
        },
      },
    });

    return {
      subscriber,
      weatherSnapshot,
      forecastSnapshot,
      dailyBriefing,
      brief,
      renderedEmail,
      jobRunId: jobRun.id,
    };
  } catch (error) {
    await prisma.jobRun.update({
      where: {
        id: jobRun.id,
      },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        detail: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
    });

    throw error;
  }
}
