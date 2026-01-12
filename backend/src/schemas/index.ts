import { z } from "zod/v4";

export const idSchema = z.object({
  id: z.uuid(),
});

export const passwordSchema = z
  .string()
  .min(8)
  .max(32)
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/);
