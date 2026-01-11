import { z } from "zod/v4";

export const eventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  location: z.string().min(1).max(255),
  dateTime: z.coerce.date(),
  endAt: z.coerce.date().optional(),
});
