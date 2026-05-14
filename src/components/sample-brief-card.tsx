import type { DailyBrief } from "@/lib/briefing/types";
import {
  getThermalFeelsLikeLabel,
  getThermalHeroHeading,
} from "@/lib/design/thermal-content";
import { getThermalGradient, getThermalTheme } from "@/lib/design/thermal-theme";
import type { WeatherSnapshot } from "@/lib/weather/types";

type SampleBriefCardProps = {
  brief: DailyBrief;
  weatherSnapshot: WeatherSnapshot;
  eyebrow?: string;
  note?: string;
};

export function SampleBriefCard({
  brief,
  weatherSnapshot,
  eyebrow = "Daily Brief Preview",
  note,
}: SampleBriefCardProps) {
  const theme = getThermalTheme(weatherSnapshot.temperatureHighF);
  const heroGradient = getThermalGradient(theme);
  const showFeelsLikeAlert =
    Math.abs(brief.temperatureTranslation.feelsLikeGap) >= 8;
  const heroHeading = getThermalHeroHeading(brief);
  const feelsLikeLabel = getThermalFeelsLikeLabel(brief, weatherSnapshot);

  return (
    <section
      className="overflow-hidden rounded-[32px] border bg-white shadow-[0_30px_90px_rgba(23,33,49,0.16)]"
      style={{
        borderColor: theme.cardBorder,
        backgroundColor: theme.pageBg,
      }}
    >
      <div
        className="flex items-center justify-between border-b px-6 py-5"
        style={{ borderColor: theme.cardBorder }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.24em]"
          style={{ color: theme.accentColor }}
        >
          {eyebrow}
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8AA0B8]">
          {weatherSnapshot.locationName} · {weatherSnapshot.zipCode}
        </p>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div
          className="rounded-[28px] px-6 py-6 text-white"
          style={{ background: heroGradient }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Live Thermal Preview
          </p>
          <div className="mt-3 flex items-start gap-2">
            <span className="text-[84px] font-semibold leading-none tracking-[-0.06em]">
              {weatherSnapshot.temperatureHighF}
            </span>
            <span className="pt-3 text-[32px] text-white/65">°F</span>
          </div>
          <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.08em] text-white/60">
            {feelsLikeLabel.split(`${weatherSnapshot.feelsLikeHighF}°F`)[0]}
            <span className="font-semibold text-[#FFD080]">
              {weatherSnapshot.feelsLikeHighF}°F
            </span>
            {feelsLikeLabel.split(`${weatherSnapshot.feelsLikeHighF}°F`)[1] ?? ""}
          </p>
          <div className="mt-4 border-t border-white/12 pt-4">
            <h2 className="text-2xl font-semibold leading-tight">
              {heroHeading}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/78">{brief.vibe}</p>
          </div>
        </div>

        {showFeelsLikeAlert ? (
          <div className="rounded-[18px] border border-[#FFD080] bg-[#FFF3E0] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8B5E20]">
              Feels-like alert · {Math.abs(brief.temperatureTranslation.feelsLikeGap)}°
              gap
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6B4416]">
              {brief.temperatureTranslation.summary}
            </p>
          </div>
        ) : null}

        <div
          className="rounded-[24px] border bg-white px-5 py-5"
          style={{ borderColor: theme.cardBorder }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: theme.accentColor }}
          >
            Footwear
          </p>
          <p className="mt-3 text-[15px] leading-6 text-[#1E3055]">
            {brief.footwear.summary}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div
            className="rounded-[24px] border bg-white px-5 py-5"
            style={{ borderColor: theme.cardBorder }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: theme.accentColor }}
            >
              Outdoor
            </p>
            <p className="mt-3 text-sm leading-6 text-[#1E3055]">
              {brief.layers.walking.summary}
            </p>
          </div>
          <div
            className="rounded-[24px] border px-5 py-5"
            style={{
              borderColor: theme.errandCardBorder,
              backgroundColor: theme.errandCardBg,
            }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: theme.secondaryText }}
            >
              Errands
            </p>
            <p className="mt-3 text-sm leading-6 text-[#2A4560]">
              {brief.layers.errands.summary}
            </p>
          </div>
        </div>

        {(brief.family?.children.length ?? 0) > 0 ? (
          <div
            className="rounded-[24px] border bg-white px-5 py-5"
            style={{ borderColor: theme.cardBorder }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: theme.accentColor }}
            >
              For The Kids
            </p>
            <div className="mt-4 space-y-4">
              {(brief.family?.children ?? []).map((child, index) => (
                <div
                  key={`${child.label}-${index}`}
                  className="text-sm leading-6"
                  style={{
                    borderTop:
                      index > 0 ? `1px solid ${theme.cardBorder}` : "none",
                    paddingTop: index > 0 ? "14px" : "0",
                  }}
                >
                  <p className="font-semibold text-[#1E3055]">
                    {child.label} · Age {child.ageYears} · {child.cohort}
                  </p>
                  <p className="mt-2 text-[#2A4560]">{child.summary}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div
          className="rounded-[24px] border bg-white px-5 py-5"
          style={{ borderColor: theme.cardBorder }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: theme.accentColor }}
          >
            Before You Leave
          </p>
          <div className="mt-4" style={{ borderColor: theme.cardBorder }}>
            {brief.accessories.items.length > 0 ? (
              brief.accessories.items.map((item, index) => (
                <div
                  key={item.name}
                  className="grid gap-2 text-sm leading-6 md:grid-cols-[112px_1fr]"
                  style={{
                    borderTop:
                      index > 0 ? `1px solid ${theme.cardBorder}` : "none",
                    paddingTop: index > 0 ? "14px" : "0",
                    paddingBottom:
                      index < brief.accessories.items.length - 1 ? "14px" : "0",
                  }}
                >
                  <span
                    className="font-semibold"
                    style={{ color: theme.accentColor }}
                  >
                    {item.name}
                  </span>
                  <span style={{ color: theme.secondaryText }}>{item.comment}</span>
                </div>
              ))
            ) : (
              <p className="py-3 text-sm leading-6" style={{ color: theme.secondaryText }}>
                No extra gear required. The weather filed its paperwork correctly
                today.
              </p>
            )}
          </div>
        </div>

        {note ? (
          <p className="px-1 text-sm leading-6" style={{ color: theme.secondaryText }}>
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
