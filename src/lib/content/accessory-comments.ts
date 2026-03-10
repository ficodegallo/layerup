export interface AccessoryComment {
  item: string
  trigger: string
  comments: string[]
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

export const ACCESSORY_COMMENTS: AccessoryComment[] = [
  {
    item: 'umbrella',
    trigger: 'rain',
    comments: [
      "Pack an umbrella. This is not a drill.",
      "There's a rain situation developing. You know what to do.",
      "Umbrella today unless you enjoy the soaked look.",
      "Rain's coming. An umbrella is the difference between prepared and miserable.",
      "Grab an umbrella on the way out. Future you will say thanks.",
    ],
  },
  {
    item: 'sunglasses',
    trigger: 'sun',
    comments: [
      "Sunglasses required — the sun is actually trying today.",
      "UV is up. Protect the eyes.",
      "Bright out there. Sunglasses aren't just for looking cool today.",
      "The sun means business. Shades recommended.",
      "Squinting isn't a look. Grab your sunglasses.",
    ],
  },
  {
    item: 'hat',
    trigger: 'cold',
    comments: [
      "A hat for the head situation outside.",
      "The wind has opinions about your ears. Wear a hat.",
      "Your head loses heat fast. A hat fixes that.",
      "Hat weather is here. Your ears will thank you.",
      "It's cold enough that a bare head is a bold choice.",
    ],
  },
  {
    item: 'gloves',
    trigger: 'cold',
    comments: [
      "Your hands will want gloves today.",
      "Gloves are not optional below 35°F. This is the law.",
      "Cold hands, warm heart — or just wear gloves.",
      "Your phone has a touchscreen? Cool. You still need gloves.",
      "Bring gloves unless you enjoy numb fingers.",
    ],
  },
  {
    item: 'scarf',
    trigger: 'wind',
    comments: [
      "A scarf would be smart today. Wind plus cold neck equals bad time.",
      "Wrap up that neck. The wind is not your friend.",
      "Scarf weather. Your throat will appreciate the coverage.",
      "The wind is cutting today. A scarf goes a long way.",
      "Pro tip: scarf. The exposed neck thing isn't worth it.",
    ],
  },
  {
    item: 'sunscreen',
    trigger: 'sun',
    comments: [
      "Sunscreen. Yes, even today. UV doesn't care about your plans.",
      "The UV index is high. Sunscreen isn't optional.",
      "Apply sunscreen unless you want a surprise sunburn later.",
      "SPF today. Your future skin will write you a thank-you note.",
      "High UV alert. Sunscreen before you head out.",
    ],
  },
]

export function getAccessoryComment(
  item: string,
  trigger: string,
  dateStr: string,
  zip: string,
): string {
  const entry = ACCESSORY_COMMENTS.find(
    (ac) => ac.item === item && ac.trigger === trigger,
  )

  if (!entry) {
    return ''
  }

  const index = simpleHash(zip + dateStr) % entry.comments.length
  return entry.comments[index]
}
