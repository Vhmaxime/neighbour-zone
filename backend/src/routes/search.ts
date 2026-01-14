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

  const users = await usersSearch(query);
  const posts = await postsSearch(query);
  const events = await eventsSearch(query);
  const marketplaceItems = await marketplaceSearch(query);

  return c.json({ users, posts, events, marketplace: marketplaceItems });
});

searchRouter.get("/users", async (c) => {
  const query = c.req.query("q");

  if (!query || query.trim() === "") {
    return c.json({ users: [] });
  }

  const users = await usersSearch(query);

  return c.json({ users });
});

async function usersSearch(query: string) {
  return db.query.usersTable.findMany({
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
}

async function postsSearch(query: string) {
  return db.query.postsTable.findMany({
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
}

async function eventsSearch(query: string) {
  return db.query.eventsTable.findMany({
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
}

async function marketplaceSearch(query: string) {
  return db.query.marketplaceItemsTable.findMany({
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
}

export default searchRouter;
