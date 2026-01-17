import { z } from "zod/v4";

export const eventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(300),
  placeDisplayName: z.string().min(1).max(100),
  placeId: z.number().int(),
  lat: z.string().min(1),
  lon: z.string().min(1),
  dateTime: z.iso.datetime().transform((str) => new Date(str)),
  endAt: z.iso
    .datetime()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
});
