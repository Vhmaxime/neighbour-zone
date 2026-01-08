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
  zValidator("json", registerSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Bad Request" }, 400);
    }
  }),
  async (c) => {
    const { name, email, password } = c.req.valid("json");

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ message: "Email already in use" }, 409);
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

    return c.json({ accessToken }, 200);
  }
);

authRouter.post(
  "/login",
  zValidator("json", loginSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      return c.json({ message: "Invalid credentials" }, 401);
    }
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return c.json({ message: "Invalid credentials" }, 401);
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

    return c.json({ accessToken }, 200);
  }
);

authRouter.post("/refresh", async (c) => {
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

  return c.json({ accessToken: newAccessToken }, 200);
});

export default authRouter;
