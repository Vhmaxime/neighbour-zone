import { jwt } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import { constants } from "../config/index.js";

const authMiddleware = createMiddleware(async (c, next) => {
  const jwtMiddleware = jwt({
    secret: constants.jwtSecret,
    alg: "HS256",
  });

  try {
    return await jwtMiddleware(c, next);
  } catch (err) {
    return c.json({ message: "Unauthorized" }, 401);
  }
});

export default authMiddleware;
