import { Hono } from "hono";
import { or, ilike } from "drizzle-orm";
import { db } from "../database/index.js";
import {
  usersTable,
  postsTable,
  eventsTable,
  marketplaceItemsTable,
} from "../database/schema.js";

const searchRouter = new Hono();

searchRouter.get("/", async (c) => {
  const query = c.req.query("q");

  if (!query || query.trim() === "") {
    return c.json(
      {
        users: [],
        posts: [],
        events: [],
        marketplace: [],
      },
      200
    );
  }

  const searchPattern = `%${query}%`;

  const user = await db
    .select()
    .from(usersTable)
    .where(
      or(
        ilike(usersTable.username, searchPattern),
        ilike(usersTable.firstname, searchPattern),
        ilike(usersTable.lastname, searchPattern),
        ilike(usersTable.bio, searchPattern)
      )
    )
    .limit(20);

  const posts = await db
    .select()
    .from(postsTable)
    .where(
      or(
        ilike(postsTable.title, searchPattern),
        ilike(postsTable.content, searchPattern)
      )
    )
    .limit(20);

  const events = await db
    .select()
    .from(eventsTable)
    .where(
      or(
        ilike(eventsTable.title, searchPattern),
        ilike(eventsTable.description, searchPattern),
        ilike(eventsTable.location, searchPattern)
      )
    )
    .limit(20);

  const marketplace = await db
    .select()
    .from(marketplaceItemsTable)
    .where(
      or(
        ilike(marketplaceItemsTable.title, searchPattern),
        ilike(marketplaceItemsTable.description, searchPattern),
        ilike(marketplaceItemsTable.location, searchPattern)
      )
    )
    .limit(20);

  return c.json({
    users: user,
    posts: posts,
    events: events,
    marketplace: marketplace,
  });
});

export default searchRouter;
