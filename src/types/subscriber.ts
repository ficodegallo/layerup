export type SubscriberStatus = 'PENDING' | 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED'
export type Tone = 'MILD' | 'DRY' | 'DAD_JOKE' | 'STRAIGHT'
export type LifestyleMode = 'DRIVE' | 'WALK'
export type Units = 'F' | 'C'

export interface Subscriber {
  id: string
  email: string
  zip: string
  name?: string | null
  deliveryHour: number
  timezone: string
  status: SubscriberStatus
  confirmToken?: string | null
  unsubscribeToken: string
  magicToken?: string | null
  magicTokenExp?: Date | null
  createdAt: Date
  confirmedAt?: Date | null
  unsubscribedAt?: Date | null
  preferences?: Preferences | null
}

export interface Preferences {
  id: string
  subscriberId: string
  tone: Tone
  lifestyleMode: LifestyleMode
  units: Units
  activities: string[]
  updatedAt: Date
}

export interface SignUpInput {
  email: string
  zip: string
  name?: string
  deliveryHour?: number
}
