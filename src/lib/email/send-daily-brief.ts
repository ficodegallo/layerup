import {
  BriefingStatus,
  JobKind,
  JobStatus,
} from "@prisma/client";
import { getPrismaClient } from "@/lib/db";
import { prepareDailyBriefSend } from "@/lib/email/prepare-daily-brief-send";
import { sendEmailWithSendGrid } from "@/lib/email/sendgrid";

type SendDailyBriefOptions = {
  email?: string;
  dailyBriefingId?: string;
};

export async function sendDailyBrief(options: SendDailyBriefOptions = {}) {
  const prisma = getPrismaClient();
  const jobRun = await prisma.jobRun.create({
    data: {
      kind: JobKind.DAILY_SEND,
      status: JobStatus.RUNNING,
      startedAt: new Date(),
      scope: options,
    },
  });

  let dailyBriefingId: string | undefined;

  try {
    const preparedSend = await prepareDailyBriefSend(options);
    dailyBriefingId = preparedSend.dailyBriefingId;

    const sendResult = await sendEmailWithSendGrid({
      to: preparedSend.to,
      subject: preparedSend.subject,
      html: preparedSend.html,
      text: preparedSend.text,
      customArgs: {
        dailyBriefingId: preparedSend.dailyBriefingId,
        subscriberId: preparedSend.subscriberId,
      },
    });

    await prisma.dailyBriefing.update({
      where: {
        id: preparedSend.dailyBriefingId,
      },
      data: {
        status: BriefingStatus.SENT,
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
          dailyBriefingId: preparedSend.dailyBriefingId,
          subscriberId: preparedSend.subscriberId,
          to: preparedSend.to,
          subject: preparedSend.subject,
          sendgridMessageId: sendResult.messageId,
          sendgridStatusCode: sendResult.statusCode,
        },
      },
    });

    return {
      ...preparedSend,
      jobRunId: jobRun.id,
      sendgridMessageId: sendResult.messageId,
      sendgridStatusCode: sendResult.statusCode,
    };
  } catch (error) {
    if (dailyBriefingId) {
      await prisma.dailyBriefing.update({
        where: {
          id: dailyBriefingId,
        },
        data: {
          status: BriefingStatus.FAILED,
        },
      });
    }

    await prisma.jobRun.update({
      where: {
        id: jobRun.id,
      },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        detail: {
          dailyBriefingId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
    });

    throw error;
  }
}
