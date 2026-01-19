import { z } from "zod/v4";
import { postTypeEnum } from "../database/schema.js";

export const postSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().max(500).optional(),
  type: z.enum(postTypeEnum.enumValues),
});

export type PostValues = z.infer<typeof postSchema>;
