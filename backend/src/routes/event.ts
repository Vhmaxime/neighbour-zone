import { Hono } from "hono";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import { eventLikesTable, eventsTable } from "../database/schema.js";
import { eq, and } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { idSchema } from "../schemas/index.js";
import authMiddleware from "../middleware/auth.js";
import { eventSchema } from "../schemas/event.js";
import { z } from "zod/v4";

const eventRouter = new Hono<{ Variables: Variables }>();

eventRouter.use(authMiddleware);

// Get all events
eventRouter.get(
  "/",
  zValidator(
    "query",
    z.object({ eventBy: z.string().optional() }),
    (result, c) => {
      if (!result.success) {
        console.error("Validation error:", result.error);
        return c.json({ message: "Invalid request data" }, 400);
      }
    },
  ),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const { eventBy } = c.req.valid("query");

    const events = await db.query.eventsTable.findMany({
      where: eventBy ? { userId: { eq: eventBy } } : undefined,
      columns: {
        userId: false,
      },
      with: {
        organizer: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
      extras: {
        likes: (table) =>
          db.$count(eventLikesTable, eq(table.id, eventLikesTable.eventId)),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const likedEventIds = await db.query.eventLikesTable.findMany({
      where: { userId: { eq: userId } },
      columns: {
        eventId: true,
      },
    });

    const eventSet = events.map((event) => {
      const liked = likedEventIds.some((like) => like.eventId === event.id);
      return {
        ...event,
        liked,
      };
    });

    return c.json({ events: eventSet, count: eventSet.length }, 200);
  },
);

// Create a new event
eventRouter.post(
  "/",
  zValidator("json", eventSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const {
      title,
      dateTime,
      description,
      placeDisplayName,
      placeId,
      lat,
      lon,
      endAt,
    } = c.req.valid("json");

    const { sub: userId } = c.get("jwtPayload");

    const [newEvent] = await db
      .insert(eventsTable)
      .values({
        userId,
        title,
        dateTime,
        description,
        placeDisplayName,
        placeId,
        lat,
        lon,
        endAt,
      })
      .returning();

    const event = await db.query.eventsTable.findFirst({
      where: { id: { eq: newEvent.id } },
      columns: {
        userId: false,
      },
      with: {
        organizer: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return c.json({ event }, 201);
  },
);

// Get a single event by ID
eventRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { id: eventId } = c.req.valid("param");

    const { sub: userId } = c.get("jwtPayload");

    const event = await db.query.eventsTable.findFirst({
      where: { id: { eq: eventId } },
      columns: {
        userId: false,
      },
      with: {
        organizer: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
      extras: {
        likes: (table) =>
          db.$count(eventLikesTable, eq(table.id, eventLikesTable.eventId)),
      },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    const liked = !!(await db.query.eventLikesTable.findFirst({
      where: {
        AND: [{ eventId: { eq: eventId } }, { userId: { eq: userId } }],
      },
    }));

    if (event.organizer?.id === userId) {
      const likedBy = await db.query.eventLikesTable.findMany({
        where: { eventId: { eq: eventId } },
        columns: {},
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      });

      return c.json({ event, liked, likedBy }, 200);
    }

    return c.json({ event, liked }, 200);
  },
);

// Update an event by ID
eventRouter.patch(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  zValidator("json", eventSchema.partial(), (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { id: eventId } = c.req.valid("param");

    const { sub: userId } = c.get("jwtPayload");

    const updates = c.req.valid("json");

    const existing = await db.query.eventsTable.findFirst({
      where: { id: { eq: eventId } },
    });

    if (!existing) {
      return c.json({ message: "Event not found" }, 404);
    }

    if (existing.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const [updatedEvent] = await db
      .update(eventsTable)
      .set(updates)
      .where(eq(eventsTable.id, eventId))
      .returning();

    const event = await db.query.eventsTable.findFirst({
      where: { id: { eq: updatedEvent.id } },
      columns: {
        userId: false,
      },
      with: {
        organizer: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return c.json({ event }, 200);
  },
);

// Delete an event by ID
eventRouter.delete(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { id: eventId } = c.req.valid("param");

    const { sub: userId } = c.get("jwtPayload");

    const existing = await db.query.eventsTable.findFirst({
      where: { id: { eq: eventId } },
    });

    if (!existing) {
      return c.json({ message: "Event not found" }, 404);
    }

    if (existing.userId !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await db.delete(eventsTable).where(eq(eventsTable.id, eventId));

    return c.json({ message: "ok" }, 200);
  },
);

// Like or unlike an event (specifieke route - moet voor algemene /:id routes komen)
eventRouter.post(
  "/:id/like",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { id: eventId } = c.req.param();

    const { sub: userId } = c.get("jwtPayload");

    const event = await db.query.eventsTable.findFirst({
      where: { id: { eq: eventId } },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    const existing = await db.query.eventLikesTable.findFirst({
      where: {
        AND: [{ eventId: { eq: eventId } }, { userId: { eq: userId } }],
      },
    });

    if (existing) {
      await db
        .delete(eventLikesTable)
        .where(
          and(
            eq(eventLikesTable.userId, userId),
            eq(eventLikesTable.eventId, eventId),
          ),
        );
      return c.json({ message: "ok" }, 200);
    }

    await db.insert(eventLikesTable).values({
      userId,
      eventId,
    });

    return c.json({ message: "ok" }, 200);
  },
);

export default eventRouter;
