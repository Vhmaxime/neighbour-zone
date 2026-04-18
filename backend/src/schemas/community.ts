import { z } from "zod/v4";

export const communitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
});
