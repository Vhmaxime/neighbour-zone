import { z } from "zod/v4";

export const messageSchema = z.object({
  conte: z.string().min(1).max(1000),
});

export type MessageValues = z.infer<typeof messageSchema>;
