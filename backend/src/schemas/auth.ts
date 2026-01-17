import { z } from "zod/v4";
import { passwordSchema } from "./index.js";

export const registerSchema = z.object({
  firstname: z.string().min(2).max(30),
  lastname: z.string().min(2).max(30),
  username: z.string().min(3).max(20),
  email: z.email(),
  phoneNumber: z.string().min(10).max(15),
  password: passwordSchema,
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginValues = z.infer<typeof loginSchema>;
