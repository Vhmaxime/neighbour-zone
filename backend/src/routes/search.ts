import { Hono } from "hono";
import { db } from "../database/index.js";
import authMiddleware from "../middleware/auth.js";
import { Variables } from "../types/index.js";

const searchRouter = new Hono<{ Variables: Variables }>();

searchRouter.use(authMiddleware);

// General search across users, posts, events, and marketplace items
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
    limit: 5,
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
    limit: 5,
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
    limit: 5,
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
    limit: 5,
  });
}

export default searchRouter;
