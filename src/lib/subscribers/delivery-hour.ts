import { DeliveryHour } from "@prisma/client";

export type DeliveryHourNumber = 6 | 7 | 8;

export function mapDeliveryHourNumberToEnum(
  hour: DeliveryHourNumber,
): DeliveryHour {
  if (hour === 6) {
    return DeliveryHour.SIX_AM;
  }

  if (hour === 8) {
    return DeliveryHour.EIGHT_AM;
  }

  return DeliveryHour.SEVEN_AM;
}

export function mapDeliveryHourEnumToNumber(
  hour: DeliveryHour,
): DeliveryHourNumber {
  if (hour === DeliveryHour.SIX_AM) {
    return 6;
  }

  if (hour === DeliveryHour.EIGHT_AM) {
    return 8;
  }

  return 7;
}
