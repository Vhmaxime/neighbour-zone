import { Hono } from "hono";
import { db } from "../database/index.js";
import authMiddleware from "../middleware/auth.js";
import { Variables } from "../types/index.js";

const searchRouter = new Hono<{ Variables: Variables }>();

searchRouter.use(authMiddleware);

searchRouter.get("/", async (c) => {
  const query = c.req.query("q");

  if (!query || query.trim() === "") {
    return c.json({ users: [], posts: [], events: [], marketplace: [] });
  }

  const user = await db.query.usersTable.findMany({
    where: {
      username: {
        ilike: `%${query}%`,
      },
    },
    columns: {
      id: true,
      username: true,
    },
  });

  const posts = await db.query.postsTable.findMany({
    where: {
      OR: [
        {
          title: {
            ilike: `%${query}%`,
          },
        },
        {
          content: {
            ilike: `%${query}%`,
          },
        },
      ],
    },
    columns: {
      id: true,
      title: true,
    },
  });

  const events = await db.query.eventsTable.findMany({
    where: {
      title: {
        ilike: `%${query}%`,
      },
    },
    columns: {
      id: true,
      title: true,
      dateTime: true,
    },
  });

  const marketplaceItems = await db.query.marketplaceItemsTable.findMany({
    where: {
      OR: [
        {
          title: {
            ilike: `%${query}%`,
          },
        },
        {
          description: {
            ilike: `%${query}%`,
          },
        },
      ],
    },
    columns: {
      id: true,
      title: true,
      description: true,
    },
  });

  return c.json({ users: user, posts, events, marketplace: marketplaceItems });
});

export default searchRouter;
