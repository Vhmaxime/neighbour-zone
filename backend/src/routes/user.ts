import { Hono } from "hono";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import authMiddleware from "../middleware/auth.js";
import { zValidator } from "@hono/zod-validator";
import { userSchema } from "../schemas/user.js";
import { usersTable } from "../database/schema.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { eq } from "drizzle-orm";
import {
  idSchema,
  passwordSchema,
  passwordUpdateSchema,
} from "../schemas/index.js";

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
      username: true,
      firstname: true,
      lastname: true,
      bio: true,
      email: true,
      phoneNumber: true,
      role: true,
    },
  });

  return c.json({ user }, 200);
});

userRouter.patch(
  "/me",
  zValidator("json", userSchema.partial(), (result, c) => {
    if (!result.success) {
      console.error(result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { sub: id } = c.get("jwtPayload");
    const { username, firstname, lastname, bio, email } = await c.req.valid(
      "json"
    );

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        username,
        firstname,
        lastname,
        bio,
        email,
      })
      .where(eq(usersTable.id, id))
      .returning();

    const user = await db.query.usersTable.findFirst({
      where: {
        id: { eq: updatedUser.id },
      },
      columns: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        bio: true,
        email: true,
        phoneNumber: true,
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

userRouter.patch(
  "/me/password",
  zValidator("json", passwordUpdateSchema, (result, c) => {
    if (!result.success) {
      console.error(result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { sub: id } = c.get("jwtPayload");
    const { currentPassword, newPassword } = await c.req.valid("json");

    const hashedPassword = await hashPassword(newPassword);

    const user = await db.query.usersTable.findFirst({
      where: {
        id: { eq: id },
      },
    });

    if (!user) {
      return c.json({ message: "Not found" }, 404);
    }

    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return c.json({ message: "Current password is incorrect" }, 400);
    }

    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, id));

    return c.json({ message: "ok" }, 200);
  }
);

userRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error(result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const user = await db.query.usersTable.findFirst({
      where: {
        id: { eq: id },
      },
    });

    if (!user) {
      return c.json({ message: "Not found" }, 404);
    }

    return c.json(
      {
        user: {
          id: user.id,
          username: user.username,
          bio: user.bio,
        },
      },
      200
    );
  }
);

export default userRouter;
