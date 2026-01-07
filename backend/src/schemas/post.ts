import { z } from "zod/v4";
import { postTypeEnum } from "../database/schema.js";

export const postIdSchema = z.object({
  id: z.uuid(),
});

export const postSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  type: z.enum(postTypeEnum.enumValues),
});

export type PostValues = z.infer<typeof postSchema>;
