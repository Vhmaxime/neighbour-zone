import { z } from "zod/v4";

export const conversationSchema = z.object({
  participantId: z.uuid(),
});
