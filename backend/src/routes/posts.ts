import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { constants } from "../config.js";
import { Variables } from "../types";

const postRouter = new Hono<{ Variables: Variables }>();

// JWT Middleware
postRouter.use(jwt({ secret: constants.jwtSecret }));

postRouter.get("/", async (c) => {
  return c.json({ message: "Posts endpoint - protected route" });
});

postRouter.post("/", async (c) => {
  return c.json({ message: "Create a new post - protected route" });
});

postRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  return c.json({ message: `Get post with ID: ${id} - protected route` });
});

postRouter.put("/:id", async (c) => {
  const { id } = c.req.param();
  return c.json({ message: `Update post with ID: ${id} - protected route` });
});

postRouter.delete("/:id", (c) => {
  const { id } = c.req.param();
  return c.json({ message: `Delete post with ID: ${id} - protected route` });
});

export default postRouter;
