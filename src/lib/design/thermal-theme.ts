export type ThermalTheme = {
  gradientStops: [string, string, string];
  gradientFallback: string;
  pageBg: string;
  accentColor: string;
  cardBorder: string;
  secondaryText: string;
  errandCardBg: string;
  errandCardBorder: string;
};

export function getThermalTheme(tempF: number): ThermalTheme {
  if (tempF <= 32) {
    return {
      gradientStops: ["#1B3A5E", "#1E4B7A", "#1A5580"],
      gradientFallback: "#1E4B7A",
      pageBg: "#EBF0F6",
      accentColor: "#2E6BA8",
      cardBorder: "#D4E0EE",
      secondaryText: "#5A7A98",
      errandCardBg: "#EBF0F6",
      errandCardBorder: "#C8D8E8",
    };
  }

  if (tempF <= 50) {
    return {
      gradientStops: ["#24476D", "#2E5F8E", "#3E77AA"],
      gradientFallback: "#2E5F8E",
      pageBg: "#EDF1F8",
      accentColor: "#356A9E",
      cardBorder: "#D2DDED",
      secondaryText: "#5C7C9B",
      errandCardBg: "#ECF1F7",
      errandCardBorder: "#C7D5E5",
    };
  }

  if (tempF <= 65) {
    return {
      gradientStops: ["#36546E", "#4B6F90", "#628AB0"],
      gradientFallback: "#4B6F90",
      pageBg: "#EEF3F8",
      accentColor: "#416F9B",
      cardBorder: "#D2DEEB",
      secondaryText: "#5D7C98",
      errandCardBg: "#EAF0F7",
      errandCardBorder: "#C8D6E4",
    };
  }

  if (tempF <= 80) {
    return {
      gradientStops: ["#7B5316", "#A06B21", "#C2862E"],
      gradientFallback: "#A06B21",
      pageBg: "#F6EFE5",
      accentColor: "#9D6822",
      cardBorder: "#E7D8BF",
      secondaryText: "#8A6B46",
      errandCardBg: "#F4EBDC",
      errandCardBorder: "#DECCAF",
    };
  }

  return {
    gradientStops: ["#8D2F16", "#B64A24", "#D5682B"],
    gradientFallback: "#B64A24",
    pageBg: "#F7ECE4",
    accentColor: "#B14B24",
    cardBorder: "#E7CCBE",
    secondaryText: "#95604B",
    errandCardBg: "#F4E6DE",
    errandCardBorder: "#DDBDAD",
  };
}

export function getThermalGradient(theme: ThermalTheme) {
  return `linear-gradient(145deg, ${theme.gradientStops[0]} 0%, ${theme.gradientStops[1]} 50%, ${theme.gradientStops[2]} 100%)`;
}
