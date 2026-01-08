import { Hono } from "hono";
import { JwtPayload, Variables } from "../types/index.js";
import { db } from "../database/index.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = new Hono<{ Variables: Variables }>();

userRouter.use(authMiddleware);

// Get current user info
userRouter.get("/me", async (c) => {
  const { sub: id } = c.get("jwtPayload") as JwtPayload;

  const user = await db.query.usersTable.findFirst({
    where: {
      id: { eq: id },
    },
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return c.json({ message: "Not found" }, 404);
  }

  return c.json({ user }, 200);
});

export default userRouter;
