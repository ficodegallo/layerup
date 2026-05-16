import {
  HumorMode,
  LifestyleMode,
  MeasurementSystem,
} from "@prisma/client";
import { z } from "zod";

export const childSignupSchema = z.object({
  ageYears: z
    .number()
    .int()
    .min(0, "Child age must be 0 or older.")
    .max(18, "Child age must be 18 or younger."),
});

export const childSignupListSchema = z
  .array(childSignupSchema)
  .max(6, "Please add up to 6 children per household.")
  .default([]);

export const betaSignupSchema = z.object({
  email: z.email(),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits."),
  firstName: z.string().trim().max(50).optional().or(z.literal("")),
  preferredDeliveryHour: z.union([z.literal(6), z.literal(7), z.literal(8)]),
  children: childSignupListSchema,
  website: z.string().trim().max(200).optional().default(""),
});

export const subscriberPreferencesSchema = z.object({
  token: z.string().trim().min(1, "Missing management token."),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits."),
  firstName: z.string().trim().max(50).optional().or(z.literal("")),
  preferredDeliveryHour: z.union([z.literal(6), z.literal(7), z.literal(8)]),
  humorMode: z.nativeEnum(HumorMode),
  lifestyleMode: z.nativeEnum(LifestyleMode),
  measurementSystem: z.nativeEnum(MeasurementSystem),
});

export type BetaSignupInput = z.infer<typeof betaSignupSchema>;
export type SubscriberPreferencesInput = z.infer<
  typeof subscriberPreferencesSchema
>;
