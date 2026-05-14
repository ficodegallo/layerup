"use client";

import { useState } from "react";

import type { ThermalTheme } from "@/lib/design/thermal-theme";

type SubmitState =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const initialState: SubmitState = { kind: "idle" };
const maxChildren = 6;

type SignupFormProps = {
  theme: ThermalTheme;
  heroGradient: string;
};

export function SignupForm({ theme, heroGradient }: SignupFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wantsChildRecommendations, setWantsChildRecommendations] =
    useState(false);
  const [childCount, setChildCount] = useState(1);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitState(initialState);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      email: String(formData.get("email") ?? ""),
      zipCode: String(formData.get("zipCode") ?? ""),
      firstName: String(formData.get("firstName") ?? ""),
      preferredDeliveryHour: Number(formData.get("preferredDeliveryHour") ?? 7),
      children: wantsChildRecommendations
        ? formData.getAll("childAgeYears").map((value) => ({
            ageYears: Number(value),
          }))
        : [],
    };

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setSubmitState({
          kind: "error",
          message: data.error ?? "Something went wrong. Please try again.",
        });
        return;
      }

      setSubmitState({
        kind: "success",
        message: data.message ?? "Thanks. You're on the beta list.",
      });
      form.reset();
      setWantsChildRecommendations(false);
      setChildCount(1);
    } catch {
      setSubmitState({
        kind: "error",
        message: "Network hiccup. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="overflow-hidden rounded-[32px] border bg-white shadow-[0_28px_90px_rgba(38,68,109,0.14)]"
      style={{ borderColor: theme.cardBorder }}
    >
      <div className="px-6 py-6 text-white" style={{ background: heroGradient }}>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
          Join The Beta
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight">
          Get the morning weather readout your household actually forwards.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">
          Daily weather translated into layers, footwear, and optional kid-ready
          recommendations for busy school mornings.
        </p>
      </div>

      <div className="p-6">
        <div
          className="rounded-[24px] border px-4 py-3 text-sm leading-6"
          style={{
            borderColor: theme.cardBorder,
            backgroundColor: theme.pageBg,
            color: theme.secondaryText,
          }}
        >
          Start with the basics, then optionally expand the form if you want child
          recommendations too. We map ages into broad groups automatically.
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                Email address
              </span>
              <input
                required
                autoComplete="email"
                className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-offset-0"
                style={{
                  borderColor: theme.cardBorder,
                  backgroundColor: "rgba(255,255,255,0.96)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
                }}
                name="email"
                type="email"
                placeholder="you@domain.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                ZIP code
              </span>
              <input
                required
                inputMode="numeric"
                className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-offset-0"
                style={{
                  borderColor: theme.cardBorder,
                  backgroundColor: "rgba(255,255,255,0.96)",
                }}
                name="zipCode"
                type="text"
                placeholder="60618"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                First name
              </span>
              <input
                autoComplete="given-name"
                className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-offset-0"
                style={{
                  borderColor: theme.cardBorder,
                  backgroundColor: "rgba(255,255,255,0.96)",
                }}
                name="firstName"
                type="text"
                placeholder="Optional"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                Delivery time
              </span>
              <select
                className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-offset-0"
                style={{
                  borderColor: theme.cardBorder,
                  backgroundColor: "rgba(255,255,255,0.96)",
                }}
                defaultValue="7"
                name="preferredDeliveryHour"
              >
                <option value="6">6:00 AM local</option>
                <option value="7">7:00 AM local</option>
                <option value="8">8:00 AM local</option>
              </select>
            </label>
          </div>

          <div
            className="rounded-[28px] border p-4"
            style={{
              borderColor: theme.cardBorder,
              background:
                "linear-gradient(180deg, rgba(248,251,255,0.94) 0%, rgba(236,243,250,0.9) 100%)",
            }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: theme.accentColor }}
                >
                  Family Add-On
                </p>
                <p className="mt-2 text-sm leading-6 text-[#2A4560]">
                  Add child ages if you want a quick weather read for school drop-off,
                  recess, stroller walks, or the bus stop.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: wantsChildRecommendations
                    ? theme.accentColor
                    : theme.cardBorder,
                  color: wantsChildRecommendations
                    ? theme.accentColor
                    : theme.secondaryText,
                  backgroundColor: "rgba(255,255,255,0.86)",
                }}
                onClick={() =>
                  setWantsChildRecommendations((current) => !current)
                }
                aria-expanded={wantsChildRecommendations}
              >
                {wantsChildRecommendations ? "Hide child fields" : "Add children"}
              </button>
            </div>

            {wantsChildRecommendations ? (
              <div className="mt-4 space-y-4 border-t border-white/65 pt-4">
                <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-end">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                      Number of children
                    </span>
                    <select
                      className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-offset-0"
                      style={{
                        borderColor: theme.cardBorder,
                        backgroundColor: "rgba(255,255,255,0.96)",
                      }}
                      value={childCount}
                      onChange={(event) =>
                        setChildCount(Number(event.target.value))
                      }
                    >
                      {Array.from({ length: maxChildren }, (_, index) => {
                        const value = index + 1;

                        return (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <p className="text-sm leading-6 text-[#516C86]">
                    We automatically translate ages into broad cohorts like newborn,
                    toddler, elementary, middle school, and high school.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: childCount }, (_, index) => (
                    <label key={index} className="block">
                      <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                        Child {index + 1} age
                      </span>
                      <input
                        required
                        min={0}
                        max={18}
                        step={1}
                        inputMode="numeric"
                        className="w-full rounded-2xl border px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:ring-2 focus:ring-offset-0"
                        style={{
                          borderColor: theme.cardBorder,
                          backgroundColor: "rgba(255,255,255,0.96)",
                        }}
                        name="childAgeYears"
                        type="number"
                        placeholder="Age in years"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <button
            className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            style={{
              background: heroGradient,
              boxShadow: "0 16px 40px rgba(32, 57, 93, 0.22)",
            }}
            type="submit"
          >
            {isSubmitting ? "Checking your details..." : "Join the beta"}
          </button>
        </form>

        <div className="mt-4 min-h-6 text-sm">
          {submitState.kind === "success" ? (
            <p style={{ color: theme.accentColor }}>{submitState.message}</p>
          ) : null}
          {submitState.kind === "error" ? (
            <p className="text-[var(--rose)]">{submitState.message}</p>
          ) : null}
        </div>

        <p className="mt-4 text-xs leading-5" style={{ color: theme.secondaryText }}>
          Friends-and-family beta. One short briefing each morning, no marketing
          fluff, and kid guidance only if you ask for it.
        </p>
      </div>
    </section>
  );
}
