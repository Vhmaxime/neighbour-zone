import { Hono } from "hono";
import { db } from "../database/index.js";

const searchRouter = new Hono();

searchRouter.get("/", async (c) => {
  const query = c.req.query("q") || "";

  const user = await db.query.usersTable.findMany({
    where: {
      username: {
        like: `%${query}%`,
      },
    },
  });
});

export default searchRouter;
