export type AccessoryItem = {
  name: string;
  comment: string;
};

export type LayerRecommendation = {
  items: string[];
  summary: string;
};

export type ChildRecommendation = {
  label: string;
  ageYears: number;
  cohort: string;
  summary: string;
  highlights: string[];
};

export type DailyBrief = {
  subjectLine: string;
  previewText: string;
  vibe: string;
  temperatureTranslation: {
    label: string;
    feelsLikeGap: number;
    summary: string;
  };
  layers: {
    walking: LayerRecommendation;
    errands: LayerRecommendation;
  };
  footwear: {
    recommendation: string;
    summary: string;
  };
  accessories: {
    items: AccessoryItem[];
  };
  family?: {
    children: ChildRecommendation[];
  };
  safetyMode: {
    active: boolean;
    headline?: string;
    instruction?: string;
  };
};
