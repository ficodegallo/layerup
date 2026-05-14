import Link from "next/link";
import { redirect } from "next/navigation";

import { confirmPendingSignup } from "@/lib/subscribers/pending-signup";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type ConfirmSubscriptionPageProps = {
  searchParams: Promise<{
    status?: string;
    token?: string;
  }>;
};

const statusContent: Record<
  string,
  {
    title: string;
    body: string;
  }
> = {
  confirmed: {
    title: "You’re confirmed",
    body:
      "Your Layer Up beta signup is active. We’ll start sending your weather-based recommendations on your selected schedule.",
  },
  expired: {
    title: "That link expired",
    body:
      "Confirmation links are only valid for 24 hours. Head back to the homepage and submit the form again to get a fresh link.",
  },
  invalid: {
    title: "That link is not valid",
    body:
      "The confirmation link looks incomplete or has already been used. If you still want to join, submit the signup form again and we’ll send a fresh email.",
  },
};

export default async function ConfirmSubscriptionPage({
  searchParams,
}: ConfirmSubscriptionPageProps) {
  const params = await searchParams;

  if (params.token) {
    const result = await confirmPendingSignup(params.token);
    redirect(`/confirm-subscription?status=${result.kind}`);
  }

  const content = statusContent[params.status ?? "invalid"] ?? statusContent.invalid;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ebf0f6_54%,#dbe5ef_100%)] px-6 py-10 text-[#1e3055]">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-[#d4e0ee] bg-white/92 p-8 shadow-[0_24px_70px_rgba(38,68,109,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#416f9b]">
          Layer Up Beta
        </p>
        <h1 className="mt-4 text-3xl font-semibold">{content.title}</h1>
        <p className="mt-4 text-sm leading-7 text-[#5d7c98]">{content.body}</p>
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
