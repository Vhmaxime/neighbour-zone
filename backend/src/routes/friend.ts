import { Hono } from "hono";
import authMiddleware from "../middleware/auth.js";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import { zValidator } from "@hono/zod-validator";
import { idSchema } from "../schemas/index.js";
import { friendshipsTable } from "../database/schema.js";
import { eq } from "drizzle-orm";

const friendRouter = new Hono<{ Variables: Variables }>();

friendRouter.use(authMiddleware);

friendRouter.get("/list", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const friends = await db.query.friendshipsTable.findMany({
    where: {
      AND: [
        {
          OR: [{ userId1: { eq: userId } }, { userId2: { eq: userId } }],
        },
        {
          status: { eq: "accepted" },
        },
      ],
    },
    columns: {},
    with: {
      user1: {
        columns: {
          id: true,
          username: true,
        },
      },
      user2: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  });

  const friendList = friends.map((friendship) => {
    if (friendship.user1?.id === userId) {
      return friendship.user2;
    } else {
      return friendship.user1;
    }
  });

  return c.json({ friends: friendList });
});

friendRouter.get("/requests", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  console.log("tzst");

  const requests = await db.query.friendshipsTable.findMany({
    where: {
      AND: [{ userId2: { eq: userId } }, { status: { eq: "pending" } }],
    },
    columns: {},
    with: {
      user1: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  });

  const requestList = requests.map((friendship) => friendship.user1);

  return c.json({ requests: requestList }, 200);
});

friendRouter.get("/sent", async (c) => {
  const { sub: userId } = c.get("jwtPayload");
  const sentRequests = await db.query.friendshipsTable.findMany({
    where: {
      AND: [{ userId1: { eq: userId } }, { status: { eq: "pending" } }],
    },
    columns: {},
    with: {
      user2: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
  });

  const sentList = sentRequests.map((friendship) => friendship.user2);
  return c.json({ sent: sentList });
});

friendRouter.post(
  "/request/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.log(result.error);
      return c.json({ message: "Bad Request" }, 400);
    }
  }),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const { id: friendId } = c.req.valid("param");

    const existingFriendship = await db.query.friendshipsTable.findFirst({
      where: {
        OR: [
          { AND: [{ userId1: { eq: userId } }, { userId2: { eq: friendId } }] },
          { AND: [{ userId1: { eq: friendId } }, { userId2: { eq: userId } }] },
        ],
      },
    });

    if (existingFriendship && existingFriendship.status === "pending") {
      return c.json({ message: "Friend request already pending" }, 400);
    }

    if (existingFriendship && existingFriendship.status === "accepted") {
      return c.json({ message: "You are already friends" }, 400);
    }

    await db.insert(friendshipsTable).values({
      userId1: userId,
      userId2: friendId,
      status: "pending",
    });

    return c.json({ message: "ok" }, 200);
  }
);

friendRouter.delete(
  "/request/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.log(result.error);
      return c.json({ message: "Bad Request" }, 400);
    }
  }),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const { id: friendId } = c.req.valid("param");

    const friendship = await db.query.friendshipsTable.findFirst({
      where: {
        AND: [
          { userId1: { eq: userId } },
          { userId2: { eq: friendId } },
          { status: { eq: "pending" } },
        ],
      },
    });

    if (!friendship) {
      return c.json({ message: "No pending friend request found" }, 404);
    }

    await db
      .delete(friendshipsTable)
      .where(eq(friendshipsTable.id, friendship.id));

    return c.json({ message: "ok" }, 200);
  }
);

friendRouter.patch(
  "/accept/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.log(result.error);
      return c.json({ message: "Bad Request" }, 400);
    }
  }),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const { id: friendId } = c.req.valid("param");

    const friendship = await db.query.friendshipsTable.findFirst({
      where: {
        AND: [
          { userId1: { eq: friendId } },
          { userId2: { eq: userId } },
          { status: { eq: "pending" } },
        ],
      },
    });

    if (!friendship) {
      return c.json({ message: "No pending friend request found" }, 404);
    }
    await db
      .update(friendshipsTable)
      .set({ status: "accepted" })
      .where(eq(friendshipsTable.id, friendship.id));

    return c.json({ message: "ok" }, 200);
  }
);

friendRouter.delete(
  "/reject/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.log(result.error);
      return c.json({ message: "Bad Request" }, 400);
    }
  }),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const { id: friendId } = c.req.valid("param");

    const friendship = await db.query.friendshipsTable.findFirst({
      where: {
        AND: [
          { userId1: { eq: friendId } },
          { userId2: { eq: userId } },
          { status: { eq: "pending" } },
        ],
      },
    });

    if (!friendship) {
      return c.json({ message: "No pending friend request found" }, 404);
    }

    await db
      .delete(friendshipsTable)
      .where(eq(friendshipsTable.id, friendship.id));

    return c.json({ message: "ok" }, 200);
  }
);

friendRouter.delete(
  "/remove/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.log(result.error);
      return c.json({ message: "Bad Request" }, 400);
    }
  }),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");
    const { id: friendId } = c.req.valid("param");

    const friendship = await db.query.friendshipsTable.findFirst({
      where: {
        OR: [
          { AND: [{ userId1: { eq: userId } }, { userId2: { eq: friendId } }] },
          { AND: [{ userId1: { eq: friendId } }, { userId2: { eq: userId } }] },
        ],
      },
    });
    if (!friendship) {
      return c.json({ message: "Not found" }, 404);
    }

    await db
      .delete(friendshipsTable)
      .where(eq(friendshipsTable.id, friendship.id));

    return c.json({ message: "ok" }, 200);
  }
);

export default friendRouter;
