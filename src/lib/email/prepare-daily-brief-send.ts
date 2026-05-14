import { getPrismaClient } from "@/lib/db";

type PrepareDailyBriefSendOptions = {
  email?: string;
  dailyBriefingId?: string;
};

export async function prepareDailyBriefSend(
  options: PrepareDailyBriefSendOptions = {},
) {
  const prisma = getPrismaClient();

  const briefing = await prisma.dailyBriefing.findFirst({
    where: {
      ...(options.dailyBriefingId ? { id: options.dailyBriefingId } : undefined),
      ...(options.email
        ? {
            subscriber: {
              email: options.email.trim().toLowerCase(),
            },
          }
        : undefined),
    },
    include: {
      subscriber: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!briefing) {
    throw new Error("No saved daily briefing matched the request.");
  }

  if (!briefing.renderedHtml || !briefing.renderedText) {
    throw new Error(
      "This daily briefing has not been rendered into email content yet.",
    );
  }

  return {
    to: briefing.subscriber.email,
    subject: briefing.subjectLine,
    previewText: briefing.previewText ?? "",
    html: briefing.renderedHtml,
    text: briefing.renderedText,
    dailyBriefingId: briefing.id,
    subscriberId: briefing.subscriberId,
    sendReady: true,
  };
}
