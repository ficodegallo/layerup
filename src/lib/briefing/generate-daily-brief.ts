import type {
  AccessoryItem,
  DailyBrief,
  LayerRecommendation,
} from "@/lib/briefing/types";
import { buildChildRecommendations } from "@/lib/family/child-outfit-recommendations";
import type { WeatherSnapshot } from "@/lib/weather/types";

type GenerateDailyBriefOptions = {
  children?: Array<{
    ageYears: number;
  }>;
};

const safetyKeywords = [
  "winter storm",
  "ice storm",
  "tornado",
  "heat advisory",
  "excessive heat",
  "air quality",
  "flood",
];

function getDateOnly(dateString: string) {
  return dateString.split("T")[0];
}

function formatLocalDate(dateString: string) {
  const dateOnly = getDateOnly(dateString);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateOnly}T12:00:00Z`));
}

function getSeason(dateString: string) {
  const month = Number(getDateOnly(dateString).split("-")[1]);

  if (month >= 3 && month <= 5) {
    return "spring";
  }

  if (month >= 6 && month <= 8) {
    return "summer";
  }

  if (month >= 9 && month <= 11) {
    return "fall";
  }

  return "winter";
}

function averageFeelsLike(weather: WeatherSnapshot) {
  return Math.round((weather.feelsLikeHighF + weather.feelsLikeLowF) / 2);
}

function significantFeelsLikeGap(weather: WeatherSnapshot) {
  return Math.abs(weather.temperatureHighF - weather.feelsLikeHighF) >= 8;
}

function getTemperatureLabel(feelsLikeHighF: number) {
  if (feelsLikeHighF <= 15) {
    return "face-hurting cold";
  }

  if (feelsLikeHighF <= 32) {
    return "proper coat weather";
  }

  if (feelsLikeHighF <= 50) {
    return "hoodie weather";
  }

  if (feelsLikeHighF <= 68) {
    return "suspiciously pleasant";
  }

  if (feelsLikeHighF <= 82) {
    return "good outside weather";
  }

  return "sweaty on purpose";
}

function getVibe(weather: WeatherSnapshot) {
  if (isSafetyMode(weather)) {
    return "Weather is behaving badly today, so this is a practical briefing, not a bit.";
  }

  const season = getSeason(weather.forecastDate);
  const feelsLike = averageFeelsLike(weather);

  if (weather.precipitationType === "snow" && weather.precipitationProbability >= 40) {
    return "Winter is doing one last dramatic thing before it packs up and leaves. Respect it.";
  }

  if (weather.precipitationProbability >= 50 && weather.windMph >= 18) {
    return "This is a sturdy-jacket, low-expectations kind of day.";
  }

  if (weather.precipitationProbability >= 40) {
    return "Today has umbrella energy from start to finish.";
  }

  if (season === "winter" && feelsLike <= 28) {
    return "Today is a keep-your-coat-zipped-and-mind-your-business kind of day.";
  }

  if (season === "spring" && feelsLike >= 62) {
    return "Genuinely gorgeous out there. No notes.";
  }

  if (season === "summer" && weather.dewPointF >= 65) {
    return "The air has fully committed to being clingy today.";
  }

  if (season === "fall" && feelsLike >= 48 && feelsLike <= 64) {
    return "Peak light-jacket weather. Absolutely no complaints from the committee.";
  }

  return "A perfectly manageable weather day with just enough personality to keep you honest.";
}

function getTemperatureTranslation(weather: WeatherSnapshot) {
  const label = getTemperatureLabel(weather.feelsLikeHighF);
  const feelsLikeGap = Math.abs(weather.temperatureHighF - weather.feelsLikeHighF);

  let summary = `High ${weather.temperatureHighF}°F, low ${weather.temperatureLowF}°F, and it will feel closer to ${weather.feelsLikeHighF}°F for most of the part that matters. Call it ${label}.`;

  if (significantFeelsLikeGap(weather)) {
    summary = `It tops out at ${weather.temperatureHighF}°F, but with wind and exposure it will feel more like ${weather.feelsLikeHighF}°F. That ${feelsLikeGap}° gap is the difference between technically fine and genuinely annoying.`;
  }

  return {
    label,
    feelsLikeGap,
    summary,
  };
}

function getOuterwear(feelsLikeF: number) {
  if (feelsLikeF <= 15) {
    return "heavy winter coat";
  }

  if (feelsLikeF <= 30) {
    return "insulated coat";
  }

  if (feelsLikeF <= 45) {
    return "fleece or medium jacket";
  }

  if (feelsLikeF <= 60) {
    return "light jacket";
  }

  return "overshirt or no jacket";
}

function buildWalkingLayering(weather: WeatherSnapshot): LayerRecommendation {
  const feelsLike = averageFeelsLike(weather);
  const items = [getOuterwear(feelsLike)];

  if (feelsLike <= 38) {
    items.push("base layer");
  }

  if (feelsLike <= 30) {
    items.push("gloves");
  }

  if (weather.windMph >= 15 || weather.precipitationProbability >= 30) {
    items.push("weather-resistant outer layer");
  }

  if (feelsLike <= 25) {
    items.push("hat");
  }

  const summary = `For extended outdoor time: ${items.join(", ")}. This is the version of the day where wind and exposure get an actual vote.`;

  return {
    items,
    summary,
  };
}

function buildErrandLayering(weather: WeatherSnapshot): LayerRecommendation {
  const feelsLike = averageFeelsLike(weather);
  const items = [getOuterwear(Math.max(feelsLike, 32))];

  if (feelsLike <= 45) {
    items.push("one solid mid-layer");
  }

  if (weather.windMph >= 18 && feelsLike <= 40) {
    items.push("scarf");
  }

  const summary = `For quick car-to-building days: ${items.join(", ")}. You want warmth without creating your own indoor heat advisory.`;

  return {
    items,
    summary,
  };
}

function getFootwear(weather: WeatherSnapshot) {
  if (weather.precipitationType === "snow" || weather.precipitationType === "ice") {
    return {
      recommendation: "waterproof with grip",
      summary:
        "Waterproof with grip. No loopholes here. Snow and ice do not care how nice your shoes are.",
    };
  }

  if (weather.hasSnowOnGround && weather.temperatureHighF > 32) {
    return {
      recommendation: "waterproof shoes",
      summary:
        "Leave the white sneakers at home. Snowmelt and road salt are teaming up against them today.",
    };
  }

  if (weather.precipitationProbability >= 40 && weather.precipitationType === "rain") {
    return {
      recommendation: "waterproof shoes or rain boots",
      summary:
        "Waterproof shoes or rain boots. Today is a puddle-avoidance strategy meeting.",
    };
  }

  if (weather.temperatureHighF < 20) {
    return {
      recommendation: "closed-toe shoes with ankle coverage",
      summary:
        "Any closed-toe shoe works, but a little ankle coverage will feel smarter about twenty minutes in.",
    };
  }

  return {
    recommendation: "your usual shoes",
    summary: "Dry and manageable. Wear what you like and enjoy the lack of drama.",
  };
}

function getAccessoryChecklist(weather: WeatherSnapshot) {
  const items: AccessoryItem[] = [];

  if (weather.uvIndex >= 3 || (weather.hasSnowOnGround && weather.cloudCoverPercent <= 45)) {
    items.push({
      name: "Sunglasses",
      comment: "Morning glare has enough confidence today to be a problem.",
    });
  }

  if (weather.precipitationProbability >= 30) {
    items.push({
      name: "Umbrella",
      comment: "Bring the sturdy one. The tiny emergency umbrella is not ready for this conversation.",
    });
  }

  if (weather.feelsLikeHighF <= 28 || (weather.windMph > 20 && weather.temperatureHighF < 40)) {
    items.push({
      name: "Warm hat",
      comment: "Your ears would like a formal apology if you skip this.",
    });
  }

  if (weather.feelsLikeHighF <= 32) {
    items.push({
      name: "Gloves",
      comment: "Optional in theory, regrettable in practice.",
    });
  }

  if (weather.windMph > 15 && weather.temperatureHighF < 38) {
    items.push({
      name: "Scarf",
      comment: "The wind is absolutely going for your neck today.",
    });
  }

  if (weather.uvIndex >= 6) {
    items.push({
      name: "Sunscreen",
      comment: "UV is high enough that optimism is not a substitute for SPF.",
    });
  }

  if (getSeason(weather.forecastDate) === "winter" && weather.humidityPercent < 25) {
    items.push({
      name: "Hand lotion",
      comment: "The air is dry enough to start negotiating with your skin.",
    });
  }

  if (weather.dewPointF >= 60) {
    items.push({
      name: "Hair tie or frizz backup",
      comment: "The dew point has plans for your hair, and they are not collaborative.",
    });
  }

  return {
    items,
  };
}

function isSafetyMode(weather: WeatherSnapshot) {
  const event = weather.nwsAlert?.event.toLowerCase() ?? "";
  return safetyKeywords.some((keyword) => event.includes(keyword));
}

export function generateDailyBrief(
  weather: WeatherSnapshot,
  options: GenerateDailyBriefOptions = {},
): DailyBrief {
  const familyChildren = buildChildRecommendations(weather, options.children ?? []);

  if (isSafetyMode(weather)) {
    return {
      subjectLine: `Layer Up Safety Briefing — ${formatLocalDate(weather.forecastDate)}`,
      previewText: "A weather alert is active. Humor is off. Practical guidance only.",
      vibe: "A weather advisory is active for your area. This one is all signal and no sass.",
      temperatureTranslation: getTemperatureTranslation(weather),
      layers: {
        walking: {
          items: ["sturdy outerwear", "weather-specific protection"],
          summary:
            "Dress for the alert conditions first, then fill in comfort layers underneath.",
        },
        errands: {
          items: ["weather-ready outerwear"],
          summary:
            "Keep trips short, prioritize traction and visibility, and skip anything optional outdoors.",
        },
      },
      footwear: {
        recommendation: "weather-safe footwear",
        summary:
          "Choose traction, waterproofing, and stability over style today. The weather gets final say.",
      },
      accessories: {
        items: [
          {
            name: "Phone charged",
            comment: weather.nwsAlert?.headline ?? "Keep an eye on the active alert.",
          },
        ],
      },
      family:
        familyChildren.length > 0
          ? {
              children: familyChildren,
            }
          : undefined,
      safetyMode: {
        active: true,
        headline: weather.nwsAlert?.headline ?? "Weather alert in effect",
        instruction:
          weather.nwsAlert?.instruction ??
          "Follow local guidance and keep outdoor exposure brief.",
      },
    };
  }

  return {
    subjectLine: `Layer Up for ${formatLocalDate(weather.forecastDate)}`,
    previewText: "The weather, translated into layers, shoes, and a few strong opinions.",
    vibe: getVibe(weather),
    temperatureTranslation: getTemperatureTranslation(weather),
    layers: {
      walking: buildWalkingLayering(weather),
      errands: buildErrandLayering(weather),
    },
    footwear: getFootwear(weather),
    accessories: getAccessoryChecklist(weather),
    family:
      familyChildren.length > 0
        ? {
            children: familyChildren,
          }
        : undefined,
    safetyMode: {
      active: false,
    },
  };
}
