import { z } from "zod/v4";
import { marketplaceCategoryEnum } from "../database/schema.js";

export const marketplaceItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  price: z.number().multipleOf(0.01).optional(),
  placeDisplayName: z.string().min(1).max(255),
  placeId: z.number().int(),
  lat: z.string().min(1),
  lon: z.string().min(1),
  category: z.enum(marketplaceCategoryEnum.enumValues).default("offered"),
});

export const marketplaceApplicationSchema = z.object({
  message: z.string().min(1).max(1000).optional(),
});

export type MarketplaceItem = z.infer<typeof marketplaceItemSchema>;
