import Link from "next/link";
import { SubscriberStatus } from "@prisma/client";

import { resolveSubscriberManagementAccess } from "@/lib/subscribers/management-links";

import { unsubscribeManagedSubscriber } from "@/app/manage-subscription/actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Unsubscribe | Layer Up",
};

type UnsubscribePageProps = {
  searchParams: Promise<{
    status?: string;
    token?: string;
  }>;
};

const statusCopy: Record<
  string,
  {
    body: string;
    title: string;
  }
> = {
  expired: {
    title: "That unsubscribe link expired",
    body: "Open a more recent Layer Up email to get a fresh secure unsubscribe link.",
  },
  invalid: {
    title: "That unsubscribe link is not valid",
    body: "The link looks incomplete or outdated. Open a recent Layer Up email and try again from there.",
  },
  missing: {
    title: "This page needs a secure email link",
    body: "Open the unsubscribe link from a Layer Up email so we can identify the right subscription safely.",
  },
  unsubscribed: {
    title: "You are unsubscribed",
    body: "We turned off future Layer Up sends for this address. You can rejoin any time from the homepage.",
  },
  "unsubscribe-failed": {
    title: "We could not complete that unsubscribe",
    body: "The request reached us, but the update did not finish cleanly. Please try again in a moment.",
  },
};

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const access = token
    ? await resolveSubscriberManagementAccess(token)
    : { kind: "invalid" as const };

  if (!token || access.kind !== "valid") {
    const fallbackKey = token ? access.kind : "missing";
    const fallbackContent = statusCopy[fallbackKey];

    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ebf0f6_54%,#dbe5ef_100%)] px-6 py-10 text-[#1e3055]">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-[#d4e0ee] bg-white/92 p-8 shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
            Layer Up
          </p>
          <h1 className="mt-4 text-3xl font-semibold">{fallbackContent.title}</h1>
          <p className="mt-4 text-sm leading-7 text-[#5d7c98]">
            {fallbackContent.body}
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-full bg-[#224e84] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a3f6b]"
          >
            Back to the homepage
          </Link>
        </div>
      </main>
    );
  }

  const manageHref = `/manage-subscription?token=${encodeURIComponent(token)}`;
  const alreadyUnsubscribed =
    status === "unsubscribed" ||
    access.subscriber.status === SubscriberStatus.UNSUBSCRIBED;
  const banner =
    !alreadyUnsubscribed && status ? statusCopy[status] ?? null : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ebf0f6_54%,#dbe5ef_100%)] px-6 py-10 text-[#1e3055]">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-[32px] border border-[#d4e0ee] bg-white/92 p-8 shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
            Layer Up
          </p>

          {alreadyUnsubscribed ? (
            <>
              <h1 className="mt-4 text-3xl font-semibold">
                {statusCopy.unsubscribed.title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#5d7c98]">
                {statusCopy.unsubscribed.body}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex rounded-full bg-[#224e84] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a3f6b]"
                >
                  Return home
                </Link>
                <Link
                  href={manageHref}
                  className="inline-flex rounded-full border border-[#d4e0ee] bg-[#f6f9fc] px-5 py-3 text-sm font-semibold text-[#34506f] transition hover:bg-[#eef4fa]"
                >
                  View saved preferences
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-3xl font-semibold">
                Confirm your unsubscribe
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#5d7c98]">
                This will stop future Layer Up emails for{" "}
                <span className="font-semibold text-[#1e3055]">
                  {access.subscriber.email}
                </span>
                . You can still return to the preferences page from any saved email
                link if you want to review your settings first.
              </p>

              {banner ? (
                <div className="mt-6 rounded-[24px] border border-[#f0c6bf] bg-[#fff3f0] px-4 py-3 text-sm leading-6 text-[#7f3f36]">
                  <p className="font-semibold">{banner.title}</p>
                  <p className="mt-1">{banner.body}</p>
                </div>
              ) : null}

              <form action={unsubscribeManagedSubscriber} className="mt-8">
                <input type="hidden" name="token" value={token} />
                <div className="flex flex-wrap gap-3">
                  <button className="inline-flex rounded-full bg-[#a6483a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8f3a2e]">
                    Unsubscribe me
                  </button>
                  <Link
                    href={manageHref}
                    className="inline-flex rounded-full border border-[#d4e0ee] bg-[#f6f9fc] px-5 py-3 text-sm font-semibold text-[#34506f] transition hover:bg-[#eef4fa]"
                  >
                    Keep my subscription
                  </Link>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
