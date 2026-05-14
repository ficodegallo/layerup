import { z } from "zod";

export const betaSignupSchema = z.object({
  email: z.email(),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits."),
  firstName: z.string().trim().max(50).optional().or(z.literal("")),
  preferredDeliveryHour: z.union([z.literal(6), z.literal(7), z.literal(8)]),
  children: z
    .array(
      z.object({
        ageYears: z
          .number()
          .int()
          .min(0, "Child age must be 0 or older.")
          .max(18, "Child age must be 18 or younger."),
      }),
    )
    .max(6, "Please add up to 6 children per household.")
    .default([]),
});

export type BetaSignupInput = z.infer<typeof betaSignupSchema>;
