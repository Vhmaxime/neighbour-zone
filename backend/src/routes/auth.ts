import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db } from "../database/index.js";
import { usersTable } from "../database/schema.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import { sign, verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { constants } from "../config/index.js";
import { getCookie, setCookie } from "hono/cookie";
import { getEnvironment } from "../utils/env.js";
import { JwtPayload } from "../types/index.js";

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

      const accessToken = await sign(
        {
          sub: newUser.id,
          role: newUser.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes expiration
        },
        constants.jwtSecret
      );

      const refreshToken = await sign(
        {
          sub: newUser.id,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 dagen
        },
        constants.jwtRefreshSecret
      );

      setCookie(c, "refresh_token", refreshToken, {
        httpOnly: true,
        secure: getEnvironment() != "development" ? true : false,
        sameSite: "Strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return c.json({ accessToken }, 201);
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
      const accessToken = await sign(
        {
          sub: user.id,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes expiration
        },
        constants.jwtSecret
      );

      const refreshToken = await sign(
        {
          sub: user.id,
          role: user.role,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
        },
        constants.jwtRefreshSecret
      );

      setCookie(c, "refresh_token", refreshToken, {
        httpOnly: true,
        secure: getEnvironment() != "development" ? true : false,
        sameSite: "Strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return c.json({ accessToken });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Login error:", error);
      throw new HTTPException(500, { message: "Something went wrong" });
    }
  }
);

authRouter.post("/refresh", async (c) => {
  try {
    const refreshToken = getCookie(c, "refresh_token");

    if (!refreshToken) {
      return c.json({ error: "No refresh token provided" }, 401);
    }

    const payload = (await verify(
      refreshToken,
      constants.jwtRefreshSecret
    )) as JwtPayload;

    const newAccessToken = await sign(
      {
        sub: payload.sub,
        role: payload.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 15,
      },
      constants.jwtSecret
    );

    const newRefreshToken = await sign(
      {
        sub: payload.sub,
        role: payload.role,
        exp: payload.exp,
      },
      constants.jwtRefreshSecret
    );

    setCookie(c, "refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: getEnvironment() != "development" ? true : false,
      sameSite: "Strict",
      maxAge: Math.floor(Date.now() / 1000) - payload.exp,
    });

    return c.json({ accessToken: newAccessToken });
  } catch (err) {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
});

export default authRouter;
