import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import {
  usersTable,
  marketplaceItemsTable,
  marketplaceApplicationsTable,
} from "../database/schema.js";
import { desc, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { constants } from "../config/index.js";
import { idSchema } from "../schemas/index.js";
import { marketplaceItemSchema } from "../schemas/marketplace.js";

const marketplaceRouter = new Hono<{ Variables: Variables }>();

// JWT Middleware
marketplaceRouter.use(jwt({ secret: constants.jwtSecret }));

marketplaceRouter.get("", async (c) => {
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

  return c.json({ marketplace: marketplaceItems }, 200);
});

marketplaceRouter.post(
  "/",
  zValidator("json", marketplaceItemSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { title, description, location, price, category } =
      c.req.valid("json");

    const { sub: userId } = c.get("jwtPayload");

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
  }
);

marketplaceRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),

  async (c) => {
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
      return c.json({ message: "Not found" }, 404);
    }

    return c.json({ marketplace: marketplaceItem }, 200);
  }
);

marketplaceRouter.patch(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  zValidator("json", marketplaceItemSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const { title, description, location, price, category } =
      c.req.valid("json");

    const { sub: userId } = c.get("jwtPayload");

    const [existingItem] = await db
      .select()
      .from(marketplaceItemsTable)
      .where(eq(marketplaceItemsTable.id, id))
      .limit(1);

    if (!existingItem) {
      return c.json({ message: "Not found" }, 404);
    }

    if (existingItem.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await db
      .update(marketplaceItemsTable)
      .set({
        title,
        description,
        location,
        price: price ?? null,
        category,
      })
      .where(eq(marketplaceItemsTable.id, id));

    const [updatedItem] = await db
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

    return c.json({ marketplace: updatedItem }, 200);
  }
);

marketplaceRouter.delete(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const { sub: userId } = c.get("jwtPayload");

    const [existingItem] = await db
      .select()
      .from(marketplaceItemsTable)
      .where(eq(marketplaceItemsTable.id, id))
      .limit(1);

    if (!existingItem) {
      return c.json({ message: "Not found" }, 404);
    }

    if (existingItem.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }
    await db
      .delete(marketplaceItemsTable)
      .where(eq(marketplaceItemsTable.id, id));

    return c.json({ message: "ok" }, 200);
  }
);

marketplaceRouter.post(
  "/:id/apply",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: marketplaceItemId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const [existingItem] = await db
      .select()
      .from(marketplaceItemsTable)
      .where(eq(marketplaceItemsTable.id, marketplaceItemId))
      .limit(1);

    if (!existingItem) {
      return c.json({ message: "Not found" }, 404);
    }

    await db.insert(marketplaceApplicationsTable).values({
      marketplaceItemId,
      userId,
    });

    return c.json({ message: "ok" }, 200);
  }
);

export default marketplaceRouter;
