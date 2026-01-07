import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import authRouter from "./routes/auth.js";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDoc } from "./opeapi.js";
import { constants } from "./config.js";
import { Variables } from "./types.js";
import { logger } from "hono/logger";
import { getBaseUrl } from "./utils/env.js";

const app = new Hono<{ Variables: Variables }>();

app.use(logger());

app.use(cors());

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: constants.vercelEnv || "development",
    server: getBaseUrl(),
  });
});

app.route("/api/auth", authRouter);

app.notFound(() => {
  throw new HTTPException(404);
});

app.get("/doc", (c) => c.json(openApiDoc));

app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;
