import { Hono } from "hono";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import {
  marketplaceItemsTable,
  marketplaceApplicationsTable,
} from "../database/schema.js";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { idSchema } from "../schemas/index.js";
import {
  marketplaceApplicationSchema,
  marketplaceItemSchema,
} from "../schemas/marketplace.js";
import authMiddleware from "../middleware/auth.js";

const marketplaceRouter = new Hono<{ Variables: Variables }>();

marketplaceRouter.use(authMiddleware);

// Get all marketplace items
marketplaceRouter.get("", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const marketplace = await db.query.marketplaceItemsTable.findMany({
    columns: {
      userId: false,
    },
    with: {
      provider: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const appliedItemIds = await db.query.marketplaceApplicationsTable.findMany({
    where: { userId: { eq: userId } },
    columns: {
      marketplaceItemId: true,
    },
  });

  const marketplaceSet = marketplace.map((item) => {
    const applied = appliedItemIds.some(
      (application) => application.marketplaceItemId === item.id
    );
    return {
      ...item,
      applied,
    };
  });

  return c.json({ marketplace: marketplaceSet }, 200);
});

// Create a new marketplace item
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

    const marketplaceItem = await db.query.marketplaceItemsTable.findFirst({
      where: {
        id: {
          eq: newMarketplaceItem.id,
        },
      },
      columns: {
        userId: false,
      },
      with: {
        provider: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return c.json({ marketplace: marketplaceItem }, 201);
  }
);

// Get a specific marketplace item by ID
marketplaceRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),

  async (c) => {
    const { id: marketplaceItemId } = c.req.valid("param");

    const { sub: userId } = c.get("jwtPayload");

    const marketplace = await db.query.marketplaceItemsTable.findFirst({
      where: {
        id: { eq: marketplaceItemId },
      },
      columns: {
        userId: false,
      },
      with: {
        provider: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!marketplace) {
      return c.json({ message: "Not found" }, 404);
    }

    const applied = !!(await db.query.marketplaceApplicationsTable.findFirst({
      where: {
        AND: [
          { marketplaceItemId: { eq: marketplaceItemId } },
          { userId: { eq: userId } },
        ],
      },
    }));

    if (marketplace.provider?.id === userId) {
      const applications = await db.query.marketplaceApplicationsTable.findMany(
        {
          where: {
            marketplaceItemId: { eq: marketplace.id },
          },
          columns: {
            message: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                username: true,
              },
            },
          },
        }
      );

      return c.json({ ...marketplace, applied, applications }, 200);
    }

    return c.json({ marketplace, applied }, 200);
  }
);

// Update a specific marketplace item by ID
marketplaceRouter.patch(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  zValidator("json", marketplaceItemSchema.partial(), (result, c) => {
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

    const existing = await db.query.marketplaceItemsTable.findFirst({
      where: {
        id: { eq: id },
      },
    });

    if (!existing) {
      return c.json({ message: "Not found" }, 404);
    }

    if (existing.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const [updatedMarketplaceItem] = await db
      .update(marketplaceItemsTable)
      .set({
        title,
        description,
        location,
        price: price ?? null,
        category,
      })
      .where(eq(marketplaceItemsTable.id, id))
      .returning();

    const marketplace = await db.query.marketplaceItemsTable.findFirst({
      where: {
        id: {
          eq: updatedMarketplaceItem.id,
        },
      },
      columns: {
        userId: false,
      },
      with: {
        provider: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return c.json({ marketplace }, 200);
  }
);

// Delete a specific marketplace item by ID
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

// Apply to a marketplace item
marketplaceRouter.post(
  "/:id/apply",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  zValidator("json", marketplaceApplicationSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: marketplaceItemId } = c.req.valid("param");

    const { sub: userId } = c.get("jwtPayload");

    const { message } = c.req.valid("json");

    const existing = await db.query.marketplaceItemsTable.findFirst({
      where: {
        id: { eq: marketplaceItemId },
      },
    });

    if (!existing) {
      return c.json({ message: "Not found" }, 404);
    }

    const alreadyApplied =
      await db.query.marketplaceApplicationsTable.findFirst({
        where: {
          AND: [
            { marketplaceItemId: { eq: marketplaceItemId } },
            { userId: { eq: userId } },
          ],
        },
      });

    if (alreadyApplied) {
      return c.json({ message: "Already applied" }, 400);
    }

    await db.insert(marketplaceApplicationsTable).values({
      marketplaceItemId,
      userId,
      message,
    });

    return c.json({ message: "ok" }, 200);
  }
);

marketplaceRouter.get(
  "/user/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: userId } = c.req.valid("param");

    const user = await db.query.usersTable.findFirst({
      where: {
        id: { eq: userId },
      },
    });

    if (!user) {
      return c.json({ message: "Not found" }, 404);
    }

    const marketplace = await db.query.marketplaceItemsTable.findMany({
      where: {
        userId: { eq: userId },
      },
      columns: {
        userId: false,
      },
      with: {
        provider: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });
    return c.json({ marketplace }, 200);
  }
);

export default marketplaceRouter;
