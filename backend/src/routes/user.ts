import { Hono } from "hono";
import { JwtPayload, Variables } from "../types/index.js";
import { db } from "../database/index.js";
import authMiddleware from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import { userSchema } from "../schemas/user.js";
import { usersTable } from "../database/schema.js";
import { hashPassword } from "../utils/password.js";
import { eq } from "drizzle-orm";

const userRouter = new Hono<{ Variables: Variables }>();

userRouter.use(authMiddleware);

// Get current user info
userRouter.get("/me", async (c) => {
  const { sub: id } = c.get("jwtPayload");

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

userRouter.patch(
  "/me",
  zValidator("json", userSchema, (result, c) => {
    if (!result.success) {
      console.error(result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { sub: id } = c.get("jwtPayload");
    const { name, email, password } = await c.req.valid("json");

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        name,
        email,
        password: password ? await hashPassword(password) : undefined,
      })
      .where(eq(usersTable.id, id))
      .returning();

    const user = await db.query.usersTable.findFirst({
      where: {
        id: { eq: updatedUser.id },
      },
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return c.json({ user }, 200);
  }
);

userRouter.delete("/me", async (c) => {
  const { sub: id } = c.get("jwtPayload");

  await db.delete(usersTable).where(eq(usersTable.id, id));

  return c.json({ message: "ok" }, 200);
});

export default userRouter;
