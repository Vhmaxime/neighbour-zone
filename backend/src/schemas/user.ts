import { z } from "zod/v4";

export const userSchema = z.object({
  firstname: z.string().min(2).max(30).optional(),
  lastname: z.string().min(2).max(30).optional(),
  username: z.string().min(2).max(30).optional(),
  email: z.email().optional(),
  bio: z.string().max(160).optional(),
});
