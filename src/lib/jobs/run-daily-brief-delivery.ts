import {
  BriefingStatus,
  DeliveryHour,
  JobKind,
  JobStatus,
  SubscriberStatus,
} from "@prisma/client";

import { persistDailyBriefForSubscriber } from "@/lib/briefing/persist-daily-brief";
import { getPrismaClient } from "@/lib/db";
import { sendDailyBrief } from "@/lib/email/send-daily-brief";

const deliveryHourByEnum: Record<DeliveryHour, number> = {
  [DeliveryHour.SIX_AM]: 6,
  [DeliveryHour.SEVEN_AM]: 7,
  [DeliveryHour.EIGHT_AM]: 8,
};

const localClockFormatters = new Map<string, Intl.DateTimeFormat>();

type RunDailyBriefDeliveryOptions = {
  referenceTime?: Date;
  email?: string;
  subscriberId?: string;
  force?: boolean;
  dryRun?: boolean;
};

type SubscriberDeliveryResult =
  | {
      action: "skipped-not-due";
      subscriberId: string;
      email: string;
      deliveryHourLocal: number;
      localDate: string;
      localHour: number;
      localMinute: number;
      timeZone: string;
    }
  | {
      action: "skipped-already-sent";
      subscriberId: string;
      email: string;
      dailyBriefingId: string;
      localDate: string;
      timeZone: string;
    }
  | {
      action: "would-send";
      subscriberId: string;
      email: string;
      localDate: string;
      deliveryHourLocal: number;
      localHour: number;
      localMinute: number;
      timeZone: string;
    }
  | {
      action: "sent";
      subscriberId: string;
      email: string;
      dailyBriefingId: string;
      localDate: string;
      subject: string;
      sendgridMessageId: string | null;
      sendgridStatusCode: number;
      timeZone: string;
    }
  | {
      action: "failed";
      subscriberId: string;
      email: string;
      error: string;
      localDate?: string;
      timeZone: string;
    };

function isFailedResult(
  result: SubscriberDeliveryResult,
): result is Extract<SubscriberDeliveryResult, { action: "failed" }> {
  return result.action === "failed";
}

function toDateOnlyUtc(localDate: string) {
  return new Date(`${localDate}T12:00:00Z`);
}

function getLocalClockFormatter(timeZone: string) {
  const cachedFormatter = localClockFormatters.get(timeZone);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  localClockFormatters.set(timeZone, formatter);

  return formatter;
}

function getLocalClock(date: Date, timeZone: string) {
  const formatter = getLocalClockFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const year = values.year;
  const month = values.month;
  const day = values.day;
  const hour = Number(values.hour);
  const minute = Number(values.minute);

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error(`Could not derive the local clock for time zone "${timeZone}".`);
  }

  return {
    localDate: `${year}-${month}-${day}`,
    localHour: hour,
    localMinute: minute,
  };
}

export async function runDailyBriefDelivery(
  options: RunDailyBriefDeliveryOptions = {},
) {
  const prisma = getPrismaClient();
  const referenceTime = options.referenceTime ?? new Date();
  const normalizedEmail = options.email?.trim().toLowerCase();
  const force = options.force ?? false;
  const dryRun = options.dryRun ?? false;

  const batchJobRun = await prisma.jobRun.create({
    data: {
      kind: JobKind.DAILY_SEND,
      status: JobStatus.RUNNING,
      startedAt: referenceTime,
      scope: {
        mode: "scheduled-batch",
        referenceTime: referenceTime.toISOString(),
        email: normalizedEmail,
        subscriberId: options.subscriberId,
        force,
        dryRun,
      },
    },
  });

  try {
    const subscribers = await prisma.subscriber.findMany({
      where: {
        status: SubscriberStatus.ACTIVE,
        ...(normalizedEmail ? { email: normalizedEmail } : undefined),
        ...(options.subscriberId ? { id: options.subscriberId } : undefined),
      },
      select: {
        id: true,
        email: true,
        timeZone: true,
        deliveryHour: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const results: SubscriberDeliveryResult[] = [];
    let dueNowCount = 0;
    let sentCount = 0;
    let wouldSendCount = 0;
    let skippedNotDueCount = 0;
    let skippedAlreadySentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      let localClock;

      try {
        localClock = getLocalClock(referenceTime, subscriber.timeZone);
      } catch (error) {
        failedCount += 1;
        results.push({
          action: "failed",
          subscriberId: subscriber.id,
          email: subscriber.email,
          error:
            error instanceof Error
              ? error.message
              : "Unable to evaluate the subscriber time zone.",
          timeZone: subscriber.timeZone,
        });
        continue;
      }

      const deliveryHourLocal = deliveryHourByEnum[subscriber.deliveryHour];
      const dueNow = force || localClock.localHour === deliveryHourLocal;

      if (!dueNow) {
        skippedNotDueCount += 1;
        results.push({
          action: "skipped-not-due",
          subscriberId: subscriber.id,
          email: subscriber.email,
          deliveryHourLocal,
          localDate: localClock.localDate,
          localHour: localClock.localHour,
          localMinute: localClock.localMinute,
          timeZone: subscriber.timeZone,
        });
        continue;
      }

      dueNowCount += 1;

      const existingBriefing = await prisma.dailyBriefing.findUnique({
        where: {
          subscriberId_localSendDate: {
            subscriberId: subscriber.id,
            localSendDate: toDateOnlyUtc(localClock.localDate),
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (existingBriefing?.status === BriefingStatus.SENT) {
        skippedAlreadySentCount += 1;
        results.push({
          action: "skipped-already-sent",
          subscriberId: subscriber.id,
          email: subscriber.email,
          dailyBriefingId: existingBriefing.id,
          localDate: localClock.localDate,
          timeZone: subscriber.timeZone,
        });
        continue;
      }

      if (dryRun) {
        wouldSendCount += 1;
        results.push({
          action: "would-send",
          subscriberId: subscriber.id,
          email: subscriber.email,
          localDate: localClock.localDate,
          deliveryHourLocal,
          localHour: localClock.localHour,
          localMinute: localClock.localMinute,
          timeZone: subscriber.timeZone,
        });
        continue;
      }

      try {
        const persistedBrief = await persistDailyBriefForSubscriber({
          subscriberId: subscriber.id,
        });
        const sentBrief = await sendDailyBrief({
          dailyBriefingId: persistedBrief.dailyBriefing.id,
        });

        sentCount += 1;
        results.push({
          action: "sent",
          subscriberId: subscriber.id,
          email: subscriber.email,
          dailyBriefingId: sentBrief.dailyBriefingId,
          localDate: localClock.localDate,
          subject: sentBrief.subject,
          sendgridMessageId: sentBrief.sendgridMessageId,
          sendgridStatusCode: sentBrief.sendgridStatusCode,
          timeZone: subscriber.timeZone,
        });
      } catch (error) {
        failedCount += 1;
        results.push({
          action: "failed",
          subscriberId: subscriber.id,
          email: subscriber.email,
          error:
            error instanceof Error
              ? error.message
              : "The daily briefing could not be generated or sent.",
          localDate: localClock.localDate,
          timeZone: subscriber.timeZone,
        });
      }
    }

    await prisma.jobRun.update({
      where: {
        id: batchJobRun.id,
      },
      data: {
        status: failedCount > 0 ? JobStatus.FAILED : JobStatus.SUCCEEDED,
        finishedAt: new Date(),
        detail: {
          matchedSubscribers: subscribers.length,
          dueNowCount,
          sentCount,
          wouldSendCount,
          skippedNotDueCount,
          skippedAlreadySentCount,
          failedCount,
          failedSubscribers: results.filter(isFailedResult).map((result) => ({
              subscriberId: result.subscriberId,
              email: result.email,
              error: result.error,
            })),
        },
      },
    });

    return {
      jobRunId: batchJobRun.id,
      referenceTime: referenceTime.toISOString(),
      matchedSubscribers: subscribers.length,
      dueNowCount,
      sentCount,
      wouldSendCount,
      skippedNotDueCount,
      skippedAlreadySentCount,
      failedCount,
      results,
    };
  } catch (error) {
    await prisma.jobRun.update({
      where: {
        id: batchJobRun.id,
      },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        detail: {
          error:
            error instanceof Error
              ? error.message
              : "The scheduled delivery batch failed unexpectedly.",
        },
      },
    });

    throw error;
  }
}
