import { Hono } from "hono";
import authMiddleware from "../middleware/auth.js";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";

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

friendRouter.get("/requests ", async (c) => {
  return c.json({});
});

friendRouter.get("/sent ", async (c) => {
  return c.json({});
});

friendRouter.post("/request/:id ", async (c) => {
  return c.json({});
});

friendRouter.patch("/accept/:id ", async (c) => {
  return c.json({});
});

friendRouter.delete("/reject/:id ", async (c) => {
  return c.json({});
});

friendRouter.delete("/remove/:id ", async (c) => {
  return c.json({});
});

export default friendRouter;
