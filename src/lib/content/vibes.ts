import type { WeatherDaily } from '@/types/weather'

export interface VibeArchetype {
  id: string
  label: string
  conditions: {
    weathercodes?: number[]
    tempMaxRange?: [number, number]
    months?: number[]
    precipProbMin?: number
    windspeedMin?: number
  }
  variants: string[]
  priority: number
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export const VIBE_ARCHETYPES: VibeArchetype[] = [
  {
    id: 'scorcher',
    label: 'Scorcher',
    conditions: { tempMaxRange: [90, 200] },
    priority: 15,
    variants: [
      "Today is not the day to wear your denim jacket. The sun is putting in overtime.",
      "If you go outside, bring water. If you stay inside, smart move.",
      "The pavement could fry an egg today. Please don't actually try this.",
      "It's the kind of hot where you question every life choice that led you outdoors.",
      "The sun woke up and chose violence. Dress accordingly.",
    ],
  },
  {
    id: 'heat-wave',
    label: 'Heat Wave',
    conditions: { tempMaxRange: [80, 89] },
    priority: 14,
    variants: [
      "Summer called. It's bringing the heat and zero apologies.",
      "Warm enough that iced coffee isn't a preference — it's survival.",
      "The kind of day where your car seat reminds you it exists.",
      "It's giving hot. Not dangerously hot, but definitely 'I'm sweating while standing still' hot.",
      "Tank top weather has arrived. Act accordingly.",
    ],
  },
  {
    id: 'perfect-day',
    label: 'Perfect Day',
    conditions: { weathercodes: [0, 1], tempMaxRange: [65, 79] },
    priority: 13,
    variants: [
      "The weather app has nothing interesting to report. That's a good thing.",
      "This is the day other days wish they could be. Go outside.",
      "If weather could get a five-star review, today would be it.",
      "No complaints department needed today. Just blue sky and good vibes.",
      "The kind of day you'll remember in February. Take a walk.",
    ],
  },
  {
    id: 'spring-tease',
    label: 'Spring Tease',
    conditions: { weathercodes: [2], tempMaxRange: [60, 74], months: [3, 4, 5] },
    priority: 12,
    variants: [
      "Spring is flirting but hasn't committed yet. Bring a light layer.",
      "The weather is giving mixed signals. Classic spring.",
      "It's nice-ish. The kind of nice where you want to believe, but pack a jacket anyway.",
      "Spring said 'maybe.' That's better than winter's hard no.",
      "The clouds are doing their thing but the air feels like hope.",
    ],
  },
  {
    id: 'thunder-mood',
    label: 'Thunder Mood',
    conditions: { weathercodes: [95, 96, 99] },
    priority: 15,
    variants: [
      "Thunder's on the schedule. Stay safe and maybe stay inside.",
      "The sky has strong opinions today. Lightning is involved. Be careful out there.",
      "Thunderstorm alert. This is nature's way of saying 'cancel outdoor plans.'",
      "It's giving dramatic weather energy. Stay indoors if you can.",
      "The atmosphere is throwing a fit. Keep shelter in mind today.",
    ],
  },
  {
    id: 'snow-day',
    label: 'Snow Day',
    conditions: { weathercodes: [71, 73, 75, 77, 85, 86] },
    priority: 14,
    variants: [
      "It snowed. The universe has given you permission to be cozy.",
      "Snow day vibes. Layer up, literally. This is what we're here for.",
      "The ground is getting a fresh coat of white. Boots mandatory.",
      "It's snowing. Hot chocolate is now a personality trait.",
      "Snow is falling. Drive slow, walk careful, dress warm.",
    ],
  },
  {
    id: 'rain-check',
    label: 'Rain Check',
    conditions: { weathercodes: [61, 63, 65, 80, 81, 82] },
    priority: 13,
    variants: [
      "It's a rain day. Embrace the umbrella life.",
      "Water is falling from the sky. You know the drill.",
      "Rain's in the forecast. Your hair has been warned.",
      "Wet weather incoming. Waterproof shoes are the move today.",
      "The clouds have committed to rain. Respect their decision and bring an umbrella.",
    ],
  },
  {
    id: 'drizzle-daze',
    label: 'Drizzle Daze',
    conditions: { weathercodes: [51, 53, 55] },
    priority: 11,
    variants: [
      "It's not quite raining. It's more like the air is damp and has attitude.",
      "Drizzle: too much to ignore, not enough for an umbrella. Or is it?",
      "The sky is misting. It's giving moody aesthetic.",
      "Light drizzle today. Your windshield wipers will be confused.",
      "It's the kind of wet where you can't tell if it's raining or the clouds are just sweating.",
    ],
  },
  {
    id: 'fog-season',
    label: 'Fog Season',
    conditions: { weathercodes: [45, 48] },
    priority: 12,
    variants: [
      "Fog today. You can't see far, but that's fine — mystery is underrated.",
      "It's foggy. Drive slow, walk slow, just be slow today.",
      "The world has a filter on it today. Visibility is not great.",
      "Fog has entered the chat. Headlights on, ego off.",
      "Today's vibe is 'silent hill but make it safe.' Watch your driving.",
    ],
  },
  {
    id: 'crisp-fall',
    label: 'Crisp Fall',
    conditions: { weathercodes: [2, 3], tempMaxRange: [45, 59], months: [9, 10, 11] },
    priority: 10,
    variants: [
      "It's sweater weather. This is not a suggestion.",
      "The air has that crisp fall bite. Layer game matters today.",
      "Autumn is peaking. Flannel is basically required.",
      "It's the kind of cool where a warm drink solves everything.",
      "Fall is doing its thing. Enjoy it before winter shows up uninvited.",
    ],
  },
  {
    id: 'winter-chill',
    label: 'Winter Chill',
    conditions: { tempMaxRange: [-50, 31] },
    priority: 13,
    variants: [
      "It's freezing. Your face will know within seconds of stepping outside.",
      "Cold enough to reconsider going outside at all. Layer up seriously.",
      "Winter is not playing around today. Full coat, hat, gloves — the works.",
      "Below freezing. If you have a warm layer, wear it. If you have two, wear both.",
      "The cold is real. Exposed skin is a bad idea today.",
    ],
  },
  {
    id: 'deep-freeze',
    label: 'Deep Freeze',
    conditions: { tempMaxRange: [-80, 14] },
    priority: 14,
    variants: [
      "It's dangerously cold. Limit your time outside and cover everything.",
      "Deep freeze territory. Frostbite doesn't wait. Bundle up completely.",
      "The air hurts your face today. That's your sign to stay warm.",
      "This is the kind of cold that makes you question geography. Full armor.",
      "Extreme cold warning vibes. If you go out, make it quick and make it layered.",
    ],
  },
  {
    id: 'breezy',
    label: 'Breezy',
    conditions: { windspeedMin: 20 },
    priority: 9,
    variants: [
      "It's windy. Hold onto your hat — or anything that isn't bolted down.",
      "The wind is auditioning for a lead role today. Hair will be affected.",
      "Breezy is an understatement. Zip up tight.",
      "Wind advisory for your personal comfort. Secure loose items.",
      "The trees are doing their dramatic swaying thing. It's windy out there.",
    ],
  },
  {
    id: 'gloomy',
    label: 'Gloomy',
    conditions: { weathercodes: [3], tempMaxRange: [40, 65] },
    priority: 8,
    variants: [
      "Overcast and meh. It's a good day for indoor plans.",
      "The sky is gray. Your outfit doesn't have to be.",
      "Gloomy but not dramatic. Just an unremarkable weather day.",
      "Cloud cover is at 100%. The sun has called in sick.",
      "It's the kind of day where cozy lighting makes a real difference.",
    ],
  },
  {
    id: 'standard-issue',
    label: 'Standard Issue',
    conditions: {},
    priority: 1,
    variants: [
      "Weather's happening. Nothing extreme, nothing exciting. Just weather.",
      "Today's forecast: regular. Dress for comfort and carry on.",
      "No weather drama today. Just an average day doing average things.",
      "The weather is unremarkable and honestly, that's fine.",
      "Nothing wild on the weather front. Just another day to exist in.",
    ],
  },
]

export function selectVibe(weather: WeatherDaily, dateStr: string, zip: string): VibeArchetype {
  const matched = VIBE_ARCHETYPES.filter((archetype) => {
    const c = archetype.conditions

    if (c.weathercodes && !c.weathercodes.includes(weather.weathercode)) {
      return false
    }

    if (c.tempMaxRange) {
      const [min, max] = c.tempMaxRange
      if (weather.tempMax < min || weather.tempMax > max) {
        return false
      }
    }

    if (c.months) {
      const month = parseInt(dateStr.split('-')[1], 10)
      if (!c.months.includes(month)) {
        return false
      }
    }

    if (c.precipProbMin !== undefined) {
      if (weather.precipProbability < c.precipProbMin) {
        return false
      }
    }

    if (c.windspeedMin !== undefined) {
      if (weather.windspeedMax < c.windspeedMin) {
        return false
      }
    }

    return true
  })

  matched.sort((a, b) => b.priority - a.priority)

  return matched[0] ?? VIBE_ARCHETYPES[VIBE_ARCHETYPES.length - 1]
}

export function getVibeVariant(archetype: VibeArchetype, dateStr: string, zip: string): string {
  const index = simpleHash(zip + dateStr) % archetype.variants.length
  return archetype.variants[index]
}
