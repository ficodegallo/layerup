import { SampleBriefCard } from "@/components/sample-brief-card";
import { SignupForm } from "@/components/signup-form";
import { generateDailyBrief } from "@/lib/briefing/generate-daily-brief";
import { mockForecast } from "@/lib/briefing/mock-forecast";
import { getThermalGradient, getThermalTheme } from "@/lib/design/thermal-theme";
import { getLiveWeatherSnapshot } from "@/lib/weather/get-live-weather-snapshot";

export const revalidate = 1800;

const featureCards = [
  {
    eyebrow: "Households",
    title: "Built for solo mornings and the school-run version of chaos.",
    body:
      "Parents can optionally add children at signup, and Layer Up will translate their ages into broad cohorts so the daily outfit guidance can cover the whole household.",
  },
  {
    eyebrow: "Footwear",
    title: "A dedicated shoe opinion, because slush ruins more than moods.",
    body:
      "Rain, snowmelt, road salt, and ice get translated into simple calls before your white sneakers volunteer as tribute.",
  },
];

async function getHomepagePreview() {
  const previewZipCode = process.env.LAYER_UP_PREVIEW_ZIP ?? "60618";

  try {
    const snapshot = await getLiveWeatherSnapshot(previewZipCode);

    return {
      brief: generateDailyBrief(snapshot),
      weatherSnapshot: snapshot,
      eyebrow: "Live Daily Brief Preview",
      note: `Powered by Open-Meteo and NWS for ${snapshot.locationName} (${snapshot.zipCode}).`,
    };
  } catch (error) {
    console.error("Falling back to sample weather preview.", error);

    return {
      brief: generateDailyBrief(mockForecast),
      weatherSnapshot: mockForecast,
      eyebrow: "Fallback Daily Brief Preview",
      note: "Using local sample weather because the live forecast services were unavailable.",
    };
  }
}

export default async function Home() {
  const preview = await getHomepagePreview();
  const thermalTheme = getThermalTheme(preview.weatherSnapshot.temperatureHighF);
  const thermalGradient = getThermalGradient(thermalTheme);

  return (
    <main
      className="grain overflow-x-hidden"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(255,255,255,0.72), transparent 28%),
          radial-gradient(circle at top right, rgba(141,174,210,0.3), transparent 32%),
          linear-gradient(180deg, #f8fbff 0%, ${thermalTheme.pageBg} 58%, #dde8f2 100%)
        `,
      }}
    >
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-16 pt-8 sm:px-8 lg:px-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p
              className="font-display text-3xl font-semibold tracking-tight"
              style={{ color: thermalTheme.accentColor }}
            >
              Layer Up
            </p>
            <p className="mt-1 text-sm text-[color:rgba(30,48,85,0.68)]">
              Your daily weather briefing, delivered with personality.
            </p>
          </div>
          <div
            className="rounded-full border bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.24em] shadow-sm backdrop-blur"
            style={{
              borderColor: thermalTheme.cardBorder,
              color: thermalTheme.accentColor,
            }}
          >
            Friends, Family &amp; Parents Beta
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-8">
            <div className="max-w-3xl">
              <h1 className="font-display text-balance text-5xl leading-[0.94] font-semibold tracking-tight text-[#1E3055] sm:text-6xl lg:text-7xl">
                Morning weather, translated into layers before your household has to think.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:rgba(30,48,85,0.78)] sm:text-xl">
                Layer Up turns forecast data into outfit guidance, footwear calls,
                accessory reminders, and optional kid-ready recommendations so busy
                mornings feel a little less improvised.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[28px] border bg-white/88 p-6 shadow-[0_18px_60px_rgba(38,68,109,0.08)] backdrop-blur md:p-7"
                  style={{ borderColor: thermalTheme.cardBorder }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.24em]"
                    style={{ color: thermalTheme.accentColor }}
                  >
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-3 max-w-lg text-[1.65rem] font-semibold leading-[1.2] text-[#1E3055]">
                    {card.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-[15px] leading-7 text-[color:rgba(30,48,85,0.72)]">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-8">
            <SignupForm theme={thermalTheme} heroGradient={thermalGradient} />
            <SampleBriefCard
              brief={preview.brief}
              weatherSnapshot={preview.weatherSnapshot}
              eyebrow={preview.eyebrow}
              note={preview.note}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
