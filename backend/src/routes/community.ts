import { Hono } from "hono";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import { communitiesTable, communityMembersTable } from "../database/schema.js";
import { eq, and } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { communitySchema } from "../schemas/community.js";
import { idSchema } from "../schemas/index.js";
import authMiddleware from "../middleware/auth.js";

const communityRouter = new Hono<{ Variables: Variables }>();

communityRouter.use(authMiddleware);

// Get all communities with membership status for the current user
communityRouter.get("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const communities = await db.query.communitiesTable.findMany({
    with: {
      creator: { columns: { id: true, username: true } },
      members: { columns: { userId: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = communities.map((community) => {
    const membership = community.members.find((m) => m.userId === userId);
    return {
      ...community,
      memberCount: community.members.length,
      isMember: !!membership,
      role: membership?.role ?? null,
    };
  });

  return c.json({ communities: result, count: result.length }, 200);
});

// Create a new community
communityRouter.post(
  "/",
  zValidator("json", communitySchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { name, description } = c.req.valid("json");
    const { sub: creatorId } = c.get("jwtPayload");

    const [newCommunity] = await db
      .insert(communitiesTable)
      .values({ name, description, creatorId })
      .returning();

    // Creator automatically becomes admin member
    await db.insert(communityMembersTable).values({
      communityId: newCommunity.id,
      userId: creatorId,
      role: "admin",
    });

    const community = await db.query.communitiesTable.findFirst({
      where: { id: { eq: newCommunity.id } },
      with: {
        creator: { columns: { id: true, username: true } },
        members: { columns: { userId: true, role: true } },
      },
    });

    return c.json(
      {
        community: {
          ...community,
          memberCount: community!.members.length,
          isMember: true,
          role: "admin",
        },
      },
      201,
    );
  },
);

// Get community by ID (with posts, events, marketplace visible to members only)
communityRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const community = await db.query.communitiesTable.findFirst({
      where: { id: { eq: communityId } },
      with: {
        creator: { columns: { id: true, username: true } },
        members: {
          with: { user: { columns: { id: true, username: true } } },
          columns: { role: true, joinedAt: true },
        },
      },
    });

    if (!community) return c.json({ message: "Community not found" }, 404);

    const isMember = community.members.some(
      (m) => (m as any).user?.id === userId,
    );
    const role =
      community.members.find((m) => (m as any).user?.id === userId)?.role ??
      null;

    return c.json(
      {
        community: {
          ...community,
          memberCount: community.members.length,
          isMember,
          role,
        },
      },
      200,
    );
  },
);

// Update community (admin only)
communityRouter.patch(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  zValidator("json", communitySchema.partial(), (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");
    const data = c.req.valid("json");

    const membership = await db.query.communityMembersTable.findFirst({
      where: { communityId: { eq: communityId }, userId: { eq: userId } },
    });

    if (!membership || membership.role !== "admin") {
      return c.json({ message: "Forbidden" }, 403);
    }

    const [updated] = await db
      .update(communitiesTable)
      .set(data)
      .where(eq(communitiesTable.id, communityId))
      .returning();

    if (!updated) return c.json({ message: "Community not found" }, 404);

    return c.json({ community: updated }, 200);
  },
);

// Delete community (admin only)
communityRouter.delete(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const membership = await db.query.communityMembersTable.findFirst({
      where: { communityId: { eq: communityId }, userId: { eq: userId } },
    });

    if (!membership || membership.role !== "admin") {
      return c.json({ message: "Forbidden" }, 403);
    }

    await db
      .delete(communitiesTable)
      .where(eq(communitiesTable.id, communityId));

    return c.json({ message: "Community deleted" }, 200);
  },
);

// Join a community
communityRouter.post(
  "/:id/join",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const community = await db.query.communitiesTable.findFirst({
      where: { id: { eq: communityId } },
    });
    if (!community) return c.json({ message: "Community not found" }, 404);

    const existing = await db.query.communityMembersTable.findFirst({
      where: { communityId: { eq: communityId }, userId: { eq: userId } },
    });
    if (existing) return c.json({ message: "Already a member" }, 409);

    await db
      .insert(communityMembersTable)
      .values({ communityId, userId, role: "member" });

    return c.json({ message: "Joined community", isMember: true }, 200);
  },
);

// Leave a community
communityRouter.delete(
  "/:id/leave",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const membership = await db.query.communityMembersTable.findFirst({
      where: { communityId: { eq: communityId }, userId: { eq: userId } },
    });
    if (!membership) return c.json({ message: "Not a member" }, 404);

    if (membership.role === "admin") {
      // Check if there are other admins
      const otherAdmins = await db.query.communityMembersTable.findMany({
        where: { communityId: { eq: communityId }, role: { eq: "admin" } },
      });
      if (otherAdmins.length <= 1) {
        return c.json(
          {
            message:
              "Cannot leave: you are the only admin. Delete the community or promote another member first.",
          },
          400,
        );
      }
    }

    await db
      .delete(communityMembersTable)
      .where(
        and(
          eq(communityMembersTable.communityId, communityId),
          eq(communityMembersTable.userId, userId),
        ),
      );

    return c.json({ message: "Left community", isMember: false }, 200);
  },
);

// Get community posts (members only)
communityRouter.get(
  "/:id/posts",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const membership = await db.query.communityMembersTable.findFirst({
      where: { communityId: { eq: communityId }, userId: { eq: userId } },
    });
    if (!membership)
      return c.json({ message: "Not a member of this community" }, 403);

    const { postsTable, postLikesTable } = await import(
      "../database/schema.js"
    );
    const posts = await db.query.postsTable.findMany({
      where: { communityId: { eq: communityId } },
      columns: { authorId: false },
      with: {
        author: { columns: { id: true, username: true } },
      },
      extras: {
        likes: (table) =>
          db.$count(postLikesTable, eq(table.id, postLikesTable.postId)),
      },
      orderBy: { createdAt: "desc" },
    });

    const likedPostIds = await db.query.postLikesTable.findMany({
      where: { userId: { eq: userId } },
      columns: { postId: true },
    });

    const result = posts.map((post) => ({
      ...post,
      liked: likedPostIds.some((l) => l.postId === post.id),
    }));

    return c.json({ posts: result, count: result.length }, 200);
  },
);

// Get community events (members only)
communityRouter.get(
  "/:id/events",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const membership = await db.query.communityMembersTable.findFirst({
      where: { communityId: { eq: communityId }, userId: { eq: userId } },
    });
    if (!membership)
      return c.json({ message: "Not a member of this community" }, 403);

    const { eventLikesTable } = await import("../database/schema.js");
    const events = await db.query.eventsTable.findMany({
      where: { communityId: { eq: communityId } },
      columns: { userId: false },
      with: {
        organizer: { columns: { id: true, username: true } },
      },
      extras: {
        likes: (table) =>
          db.$count(eventLikesTable, eq(table.id, eventLikesTable.eventId)),
      },
      orderBy: { dateTime: "asc" },
    });

    const likedEventIds = await db.query.eventLikesTable.findMany({
      where: { userId: { eq: userId } },
      columns: { eventId: true },
    });

    const result = events.map((event) => ({
      ...event,
      liked: likedEventIds.some((l) => l.eventId === event.id),
    }));

    return c.json({ events: result, count: result.length }, 200);
  },
);

// Get community marketplace items (members only)
communityRouter.get(
  "/:id/marketplace",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success)
      return c.json({ message: "Invalid request data" }, 400);
  }),
  async (c) => {
    const { id: communityId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const membership = await db.query.communityMembersTable.findFirst({
      where: { communityId: { eq: communityId }, userId: { eq: userId } },
    });
    if (!membership)
      return c.json({ message: "Not a member of this community" }, 403);

    const { marketplaceApplicationsTable, marketplaceSavesTable } =
      await import("../database/schema.js");

    const items = await db.query.marketplaceItemsTable.findMany({
      where: { communityId: { eq: communityId } },
      columns: { userId: false },
      with: {
        provider: { columns: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const appliedIds = await db.query.marketplaceApplicationsTable.findMany({
      where: { userId: { eq: userId } },
      columns: { marketplaceItemId: true },
    });

    const savedIds = await db.query.marketplaceSavesTable.findMany({
      where: { userId: { eq: userId } },
      columns: { marketplaceItemId: true },
    });

    const result = items.map((item) => ({
      ...item,
      applied: appliedIds.some((a) => a.marketplaceItemId === item.id),
      saved: savedIds.some((s) => s.marketplaceItemId === item.id),
    }));

    return c.json({ marketplace: result, count: result.length }, 200);
  },
);

export default communityRouter;
