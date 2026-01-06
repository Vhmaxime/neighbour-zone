import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../database/index.js";
import { usersTable } from "../database/schema.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { hashPassword, verifyPassword } from "../utils/password.js";

const authRouter = new Hono();

authRouter.post(
  "/register",
  zValidator("json", registerSchema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  async (c) => {
    const { name, email, password } = c.req.valid("json");

    try {
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new HTTPException(409, { message: "Email already in use" });
      }

      const hashedPassword = await hashPassword(password);

      const [newUser] = await db
        .insert(usersTable)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning();

      const token = await sign(
        {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          exp: Math.floor(Date.now() / 1000) + 60 * 1, // 1 minute expiration
        },
        process.env.JWT_SECRET!
      );

      const response = {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      };

      return c.json(response, 201);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Registration error:", error);
      throw new HTTPException(500, { message: "Something went wrong" });
    }
  }
);

authRouter.post(
  "/login",
  zValidator("json", loginSchema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");

    try {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (!user) {
        throw new HTTPException(401, { message: "Invalid credentials" });
      }
      const isPasswordValid = await verifyPassword(password, user.password);

      if (!isPasswordValid) {
        throw new HTTPException(401, { message: "Invalid credentials" });
      }
      const token = await sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
        },
        process.env.JWT_SECRET!
      );

      const response = {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
      return c.json(response);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Login error:", error);
      throw new HTTPException(500, { message: "Something went wrong" });
    }
  }
);

export default authRouter;
