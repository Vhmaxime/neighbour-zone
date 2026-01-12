import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "../database/index.js";
import { usersTable } from "../database/schema.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import { sign, verify } from "hono/jwt";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { constants } from "../config/index.js";
import { getCookie, setCookie } from "hono/cookie";
import { getEnvironment } from "../utils/env.js";
import { JwtPayload } from "../types/index.js";

const authRouter = new Hono();

// Register a new user
authRouter.post(
  "/register",
  zValidator("json", registerSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad Request" }, 400);
    }
  }),
  async (c) => {
    const { firstname, lastname, email, password, username, phoneNumber } =
      c.req.valid("json");

    const existingEmail = await db.query.usersTable.findFirst({
      where: { email: { eq: email } },
    });

    if (existingEmail) {
      return c.json(
        { message: "An account with this email already exists" },
        409
      );
    }

    const existingUsername = await db.query.usersTable.findFirst({
      where: { username: { eq: username } },
    });

    if (existingUsername) {
      return c.json(
        { message: "An account with this username already exists" },
        409
      );
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(usersTable)
      .values({
        firstname,
        lastname,
        username,
        email,
        phoneNumber,
        password: hashedPassword,
      })
      .returning();

    const accessToken = await sign(
      {
        sub: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
      },
      constants.jwtSecret
    );

    const refreshToken = await sign(
      {
        sub: newUser.id,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 dagen expiration
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

// Login an existing user
authRouter.post(
  "/login",
  zValidator("json", loginSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const user = await db.query.usersTable.findFirst({
      where: { email: { eq: email } },
    });

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
        username: user.username,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
      },
      constants.jwtSecret
    );

    const refreshToken = await sign(
      {
        sub: user.id,
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

// Refresh access token
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
      username: payload.username,
      email: payload.email,
      role: payload.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 15,
    },
    constants.jwtSecret
  );

  const newRefreshToken = await sign(
    {
      sub: payload.sub,
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
