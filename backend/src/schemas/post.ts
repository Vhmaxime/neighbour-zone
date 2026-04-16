import { z } from "zod/v4";

export const postSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().max(500).optional(),
  communityId: z.string().uuid().optional(),
});

export type PostValues = z.infer<typeof postSchema>;
