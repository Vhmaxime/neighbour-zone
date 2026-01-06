import { z } from "zod/v4";

const passwordSchema = z
  .string()
  .min(8, "Too short")
  .max(32, "Too long")
  .regex(/[A-Z]/, "Needs uppercase")
  .regex(/[a-z]/, "Needs lowercase")
  .regex(/[0-9]/, "Needs number")
  .regex(/[!@#$%^&*]/, "Needs special char");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;
