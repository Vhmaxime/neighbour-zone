import { string, z } from "zod/v4";

export const eventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  placeDisplayName: z.string().min(1).max(255),
  placeId: z.number().int(),
  lat: string().min(1),
  lon: string().min(1),
  dateTime: z.iso.datetime(),
  endAt: z.iso.datetime().optional(),
});
