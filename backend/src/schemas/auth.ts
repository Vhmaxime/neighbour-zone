import { z } from "zod/v4";

const passwordSchema = z
  .string()
  .min(8)
  .max(32)
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/);

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    abort: true,
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginValues = z.infer<typeof loginSchema>;
