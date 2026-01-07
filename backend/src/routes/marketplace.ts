import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import {
  postsTable,
  postLikesTable,
  usersTable,
  marketplaceItemsTable,
} from "../database/schema.js";
import { count, desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { constants } from "../config/index.js";
import { idSchema } from "../schemas/index.js";
import { marketplaceItemSchema } from "../schemas/marketplace.js";

const marketplaceRouter = new Hono<{ Variables: Variables }>();

// JWT Middleware
//marketplaceRouter.use(jwt({ secret: constants.jwtSecret }));

marketplaceRouter.get("", async (c) => {
  try {
    const marketplaceItems = await db
      .select({
        id: marketplaceItemsTable.id,
        title: marketplaceItemsTable.title,
        userId: marketplaceItemsTable.userId,
        userName: usersTable.name,
        description: marketplaceItemsTable.description,
        price: marketplaceItemsTable.price,
        location: marketplaceItemsTable.location,
        category: marketplaceItemsTable.category,
        createdAt: marketplaceItemsTable.createdAt,
      })
      .from(marketplaceItemsTable)
      .leftJoin(usersTable, eq(marketplaceItemsTable.userId, usersTable.id))
      .orderBy(desc(marketplaceItemsTable.createdAt));

    return c.json({ marketplace: marketplaceItems });
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    throw new HTTPException(500, {
      message: "Error fetching marketplace items",
    });
  }
});

marketplaceRouter.post(
  "/",
  zValidator("json", marketplaceItemSchema, (result) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  async (c) => {
    try {
      const { title, description, location, price, category } =
        c.req.valid("json");
      const { sub: userId } = c.get("jwtPayload");
      console.log(c.get("jwtPayload"));

      const [newMarketplaceItem] = await db
        .insert(marketplaceItemsTable)
        .values({
          title,
          description,
          location,
          price: price ?? null,
          userId,
          category,
        })
        .returning();

      const [marketplaceItem] = await db
        .select({
          id: marketplaceItemsTable.id,
          title: marketplaceItemsTable.title,
          userId: marketplaceItemsTable.userId,
          userName: usersTable.name,
          description: marketplaceItemsTable.description,
          price: marketplaceItemsTable.price,
          location: marketplaceItemsTable.location,
          category: marketplaceItemsTable.category,
          createdAt: marketplaceItemsTable.createdAt,
        })
        .from(marketplaceItemsTable)
        .where(eq(marketplaceItemsTable.id, newMarketplaceItem.id))
        .leftJoin(usersTable, eq(marketplaceItemsTable.userId, usersTable.id))
        .orderBy(desc(marketplaceItemsTable.createdAt))
        .limit(1);

      return c.json({ marketplace: marketplaceItem }, 201);
    } catch (error) {
      console.error("Error creating post:", error);
      throw new HTTPException(500, { message: "Error creating post" });
    }
  }
);

marketplaceRouter.get(
  "/:id",
  zValidator("param", idSchema, (result) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),

  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const [marketplaceItem] = await db
        .select({
          id: marketplaceItemsTable.id,
          title: marketplaceItemsTable.title,
          userId: marketplaceItemsTable.userId,
          userName: usersTable.name,
          description: marketplaceItemsTable.description,
          price: marketplaceItemsTable.price,
          location: marketplaceItemsTable.location,
          category: marketplaceItemsTable.category,
          createdAt: marketplaceItemsTable.createdAt,
        })
        .from(marketplaceItemsTable)
        .where(eq(marketplaceItemsTable.id, id))
        .leftJoin(usersTable, eq(marketplaceItemsTable.userId, usersTable.id))
        .orderBy(desc(marketplaceItemsTable.createdAt))
        .limit(1);

      if (!marketplaceItem) {
        throw new HTTPException(404, { message: "Marketplace item not found" });
      }
      return c.json({ marketplace: marketplaceItem });
    } catch (error) {
      console.error("Error fetching marketplace item:", error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: "Error fetching marketplace item",
      });
    }
  }
);

export default marketplaceRouter;
