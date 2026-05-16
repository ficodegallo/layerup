import Link from "next/link";
import {
  HumorMode,
  LifestyleMode,
  MeasurementSystem,
  SubscriberStatus,
} from "@prisma/client";

import { mapDeliveryHourEnumToNumber } from "@/lib/subscribers/delivery-hour";
import { resolveSubscriberManagementAccess } from "@/lib/subscribers/management-links";

import { saveManagedSubscriberPreferences } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "Manage Subscription | Layer Up",
};

type ManageSubscriptionPageProps = {
  searchParams: Promise<{
    status?: string;
    token?: string;
  }>;
};

const deliveryHourOptions = [
  { label: "6:00 AM local", value: 6 },
  { label: "7:00 AM local", value: 7 },
  { label: "8:00 AM local", value: 8 },
] as const;

const humorModeOptions = [
  { label: "Mild Humor", value: HumorMode.MILD_HUMOR },
  { label: "Very Dry", value: HumorMode.VERY_DRY },
  { label: "Dad Joke Mode", value: HumorMode.DAD_JOKE },
  { label: "Straight", value: HumorMode.STRAIGHT },
] as const;

const lifestyleModeOptions = [
  { label: "Mostly drive", value: LifestyleMode.DRIVES },
  { label: "Mostly walk or transit", value: LifestyleMode.WALKS_TRANSIT },
] as const;

const measurementOptions = [
  { label: "Imperial (deg F, mph)", value: MeasurementSystem.IMPERIAL },
  { label: "Metric (deg C, km/h)", value: MeasurementSystem.METRIC },
] as const;

const statusBadgeCopy: Record<SubscriberStatus, string> = {
  [SubscriberStatus.ACTIVE]: "Active",
  [SubscriberStatus.PAUSED]: "Paused",
  [SubscriberStatus.PENDING]: "Pending",
  [SubscriberStatus.UNSUBSCRIBED]: "Unsubscribed",
};

const pageStatusCopy: Record<
  string,
  {
    body: string;
    tone: "error" | "success";
    title: string;
  }
> = {
  "bad-zip": {
    title: "That ZIP code did not validate",
    body: "Please enter a valid US ZIP code so we can refresh your forecast location and delivery time zone.",
    tone: "error",
  },
  expired: {
    title: "That management link expired",
    body: "Open a more recent Layer Up email to get a fresh secure link for preferences or unsubscribe actions.",
    tone: "error",
  },
  invalid: {
    title: "That management link is not valid",
    body: "The link looks incomplete or has already been replaced. Open a recent Layer Up email and try again from there.",
    tone: "error",
  },
  "invalid-input": {
    title: "A few fields still need attention",
    body: "Please double-check the ZIP code and preference fields, then submit the form again.",
    tone: "error",
  },
  missing: {
    title: "This page needs a secure email link",
    body: "Open the manage-preferences link from one of your Layer Up emails so we can identify the right subscription safely.",
    tone: "error",
  },
  saved: {
    title: "Preferences updated",
    body: "We saved your latest delivery and profile settings for future Layer Up emails.",
    tone: "success",
  },
  "save-failed": {
    title: "We could not save those changes",
    body: "The request reached us, but the update did not finish cleanly. Please try again in a moment.",
    tone: "error",
  },
};

function getBannerClasses(tone: "error" | "success") {
  if (tone === "success") {
    return "border-[#b6ddc7] bg-[#edf8f1] text-[#214f37]";
  }

  return "border-[#f0c6bf] bg-[#fff3f0] text-[#7f3f36]";
}

export default async function ManageSubscriptionPage({
  searchParams,
}: ManageSubscriptionPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const access = token
    ? await resolveSubscriberManagementAccess(token)
    : { kind: "invalid" as const };
  const banner = pageStatusCopy[status] ?? null;

  if (!token || access.kind !== "valid") {
    const fallbackKey = token ? access.kind : "missing";
    const fallbackContent = pageStatusCopy[fallbackKey];

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

  const subscriber = access.subscriber;
  const unsubscribeHref = `/unsubscribe?token=${encodeURIComponent(token)}`;
  const deliveryHourValue = mapDeliveryHourEnumToNumber(subscriber.deliveryHour);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ebf0f6_54%,#dbe5ef_100%)] px-6 py-10 text-[#1e3055]">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[32px] border border-[#d4e0ee] bg-white/92 p-8 shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
                Subscriber Management
              </p>
              <h1 className="mt-4 text-3xl font-semibold">Manage your Layer Up settings</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5d7c98]">
                This secure link lets you update where Layer Up sends, how it
                sounds, and when it arrives without asking you to remember a
                password.
              </p>
            </div>

            <div className="rounded-full border border-[#d4e0ee] bg-[#eef3f8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5d7c98]">
              {statusBadgeCopy[subscriber.status]}
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-[28px] border border-[#dbe4ef] bg-[#f7fbff] p-5 text-sm text-[#496784] sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c8aaa]">
                Email
              </p>
              <p className="mt-2 break-all font-medium text-[#1e3055]">
                {subscriber.email}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c8aaa]">
                Time Zone
              </p>
              <p className="mt-2 font-medium text-[#1e3055]">{subscriber.timeZone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c8aaa]">
                Child Profiles
              </p>
              <p className="mt-2 font-medium text-[#1e3055]">
                {subscriber.childProfileCount} on file
              </p>
            </div>
          </div>

          {banner ? (
            <div
              className={`mt-6 rounded-[24px] border px-4 py-3 text-sm leading-6 ${getBannerClasses(
                banner.tone,
              )}`}
            >
              <p className="font-semibold">{banner.title}</p>
              <p className="mt-1">{banner.body}</p>
            </div>
          ) : null}

          {subscriber.status === SubscriberStatus.UNSUBSCRIBED ? (
            <div className="mt-6 rounded-[24px] border border-[#f0d9a7] bg-[#fff8e8] px-4 py-3 text-sm leading-6 text-[#765524]">
              You are currently unsubscribed. You can still update this profile,
              but email delivery will stay off until you join again from the homepage.
            </div>
          ) : null}
        </section>

        <section className="rounded-[32px] border border-[#d4e0ee] bg-white/92 p-8 shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
                Preferences
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Delivery and profile settings</h2>
            </div>

            <Link
              href={unsubscribeHref}
              className="inline-flex rounded-full border border-[#d4e0ee] bg-[#f6f9fc] px-4 py-2 text-sm font-semibold text-[#34506f] transition hover:bg-[#eef4fa]"
            >
              Go to unsubscribe
            </Link>
          </div>

          <form action={saveManagedSubscriberPreferences} className="mt-6 space-y-5">
            <input type="hidden" name="token" value={token} />

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1e3055]">
                  First name
                </span>
                <input
                  name="firstName"
                  type="text"
                  defaultValue={subscriber.firstName ?? ""}
                  maxLength={50}
                  className="w-full rounded-2xl border border-[#d4e0ee] bg-white px-4 py-3 text-sm text-[#1e3055] outline-none transition focus:border-[#8eb4da]"
                  placeholder="Optional"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1e3055]">
                  ZIP code
                </span>
                <input
                  name="zipCode"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{5}"
                  maxLength={5}
                  required
                  defaultValue={subscriber.zipCode}
                  className="w-full rounded-2xl border border-[#d4e0ee] bg-white px-4 py-3 text-sm text-[#1e3055] outline-none transition focus:border-[#8eb4da]"
                  placeholder="60618"
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1e3055]">
                  Delivery time
                </span>
                <select
                  name="preferredDeliveryHour"
                  defaultValue={String(deliveryHourValue)}
                  className="w-full rounded-2xl border border-[#d4e0ee] bg-white px-4 py-3 text-sm text-[#1e3055] outline-none transition focus:border-[#8eb4da]"
                >
                  {deliveryHourOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1e3055]">
                  Measurement system
                </span>
                <select
                  name="measurementSystem"
                  defaultValue={subscriber.measurementSystem}
                  className="w-full rounded-2xl border border-[#d4e0ee] bg-white px-4 py-3 text-sm text-[#1e3055] outline-none transition focus:border-[#8eb4da]"
                >
                  {measurementOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1e3055]">
                  Tone
                </span>
                <select
                  name="humorMode"
                  defaultValue={subscriber.humorMode}
                  className="w-full rounded-2xl border border-[#d4e0ee] bg-white px-4 py-3 text-sm text-[#1e3055] outline-none transition focus:border-[#8eb4da]"
                >
                  {humorModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1e3055]">
                  Lifestyle mode
                </span>
                <select
                  name="lifestyleMode"
                  defaultValue={subscriber.lifestyleMode}
                  className="w-full rounded-2xl border border-[#d4e0ee] bg-white px-4 py-3 text-sm text-[#1e3055] outline-none transition focus:border-[#8eb4da]"
                >
                  {lifestyleModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-[24px] border border-[#dbe4ef] bg-[#f7fbff] px-4 py-3 text-sm leading-6 text-[#56748f]">
              Household child profiles are preserved with your subscription. This
              first management pass focuses on delivery settings, tone, units,
              and location.
            </div>

            <button className="inline-flex rounded-full bg-[#224e84] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a3f6b]">
              Save preferences
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
