import type { ChildRecommendation } from "@/lib/briefing/types";
import type { WeatherSnapshot } from "@/lib/weather/types";

type ChildAgeCohort = {
  label: string;
  guidance: string;
};

type ChildAgeInput = {
  ageYears: number;
};

function getAverageFeelsLike(weather: WeatherSnapshot) {
  return Math.round((weather.feelsLikeHighF + weather.feelsLikeLowF) / 2);
}

function getChildAgeCohort(ageYears: number): ChildAgeCohort {
  if (ageYears <= 1) {
    return {
      label: "Newborn / infant",
      guidance:
        "Plan for one warmer layer than the stationary adult next to them, especially for stroller time.",
    };
  }

  if (ageYears <= 4) {
    return {
      label: "Toddler / preschool",
      guidance:
        "Choose easy-on layers and assume mittens, socks, or both may need a backup.",
    };
  }

  if (ageYears <= 10) {
    return {
      label: "Elementary school",
      guidance:
        "Recess and playground time matter more than the car ride, so pack for the long outdoor stretch.",
    };
  }

  if (ageYears <= 13) {
    return {
      label: "Middle school",
      guidance:
        "Use layers that can handle buses, locker swaps, and a dramatic mid-day change of opinion.",
    };
  }

  return {
    label: "High school",
    guidance:
      "Close to the adult brief, but wet shoes and underdressed waits outside still win arguments fast.",
  };
}

function getChildOuterwear(weather: WeatherSnapshot) {
  const feelsLike = getAverageFeelsLike(weather);

  if (feelsLike <= 15) {
    return "snowsuit or heavy insulated coat";
  }

  if (feelsLike <= 30) {
    return "insulated winter coat";
  }

  if (feelsLike <= 45) {
    return "fleece or medium jacket";
  }

  if (feelsLike <= 60) {
    return "light jacket or hoodie";
  }

  return "breathable layers";
}

function getChildFootwear(weather: WeatherSnapshot) {
  if (weather.precipitationType === "snow" || weather.precipitationType === "ice") {
    return "waterproof boots with grip";
  }

  if (weather.hasSnowOnGround && weather.temperatureHighF > 32) {
    return "waterproof shoes for slush";
  }

  if (weather.precipitationProbability >= 40 && weather.precipitationType === "rain") {
    return "rain boots or waterproof sneakers";
  }

  if (weather.temperatureHighF < 45) {
    return "closed-toe shoes with real socks";
  }

  return "their usual shoes";
}

function getChildHighlights(
  weather: WeatherSnapshot,
  cohortLabel: string,
  outerwear: string,
  footwear: string,
) {
  const highlights = [outerwear, footwear];

  if (weather.feelsLikeHighF <= 32) {
    highlights.push("hat and gloves");
  }

  if (weather.precipitationProbability >= 30) {
    highlights.push("weather-ready outer layer");
  }

  if (cohortLabel === "Newborn / infant" && getAverageFeelsLike(weather) <= 45) {
    highlights.push("blanket or stroller cover");
  }

  if (cohortLabel === "Toddler / preschool" && weather.precipitationProbability >= 30) {
    highlights.push("backup socks or mittens");
  }

  if (weather.uvIndex >= 6 && weather.temperatureHighF >= 60) {
    highlights.push("sun hat or sunscreen");
  }

  return highlights;
}

export function getEffectiveChildAgeYears(
  reportedAgeYears: number,
  ageRecordedAt: Date | string,
  referenceDate = new Date(),
) {
  const recordedAt = new Date(ageRecordedAt);
  const yearsElapsed =
    referenceDate.getUTCFullYear() -
    recordedAt.getUTCFullYear() -
    (referenceDate.getUTCMonth() < recordedAt.getUTCMonth() ||
    (referenceDate.getUTCMonth() === recordedAt.getUTCMonth() &&
      referenceDate.getUTCDate() < recordedAt.getUTCDate())
      ? 1
      : 0);

  return reportedAgeYears + Math.max(0, yearsElapsed);
}

export function buildChildRecommendations(
  weather: WeatherSnapshot,
  children: ChildAgeInput[] = [],
): ChildRecommendation[] {
  return children.map((child, index) => {
    const cohort = getChildAgeCohort(child.ageYears);
    const outerwear = getChildOuterwear(weather);
    const footwear = getChildFootwear(weather);
    const highlights = getChildHighlights(
      weather,
      cohort.label,
      outerwear,
      footwear,
    );

    return {
      label: `Child ${index + 1}`,
      ageYears: child.ageYears,
      cohort: cohort.label,
      summary: `${outerwear}, ${footwear}, and layers built for ${
        cohort.label.toLowerCase()
      } routines. ${cohort.guidance}`,
      highlights,
    };
  });
}
