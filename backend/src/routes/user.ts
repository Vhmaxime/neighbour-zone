import { Hono } from "hono";
import { JwtPayload, Variables } from "../types/index.js";
import { jwt } from "hono/jwt";
import { constants } from "../config/index.js";
import { db } from "../database/index.js";
import { usersTable } from "../database/schema.js";
import { eq } from "drizzle-orm";

const userRouter = new Hono<{ Variables: Variables }>();

// JWT Middleware
userRouter.use(jwt({ secret: constants.jwtSecret }));

// Get current user info
userRouter.get("/me", async (c) => {
  const { sub } = c.get("jwtPayload") as JwtPayload;

  const [{ id, name, email, role }] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sub))
    .limit(1);

  return c.json({ id, name, email, role }, 200);
});

export default userRouter;
