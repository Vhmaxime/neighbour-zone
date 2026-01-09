import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import authRouter from "./routes/auth.js";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDoc } from "./config/opeapi.js";
import { constants } from "./config/index.js";
import { Variables } from "./types/index.js";
import { getBaseUrl } from "./utils/env.js";
import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import marketplaceRouter from "./routes/marketplace.js";
import eventRouter from "./routes/event.js";
import { timeout } from "hono/timeout";
import { logger } from "hono/logger";

const app = new Hono<{ Variables: Variables }>().basePath("/api");

// Middleware
app.use(cors());
app.use(timeout(5000));
app.use(logger());

// Health Check Endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: constants.vercelEnv || "development",
    origin: getBaseUrl(),
  });
});

//Routes
app.route("/auth", authRouter);
app.route("/user", userRouter);
app.route("/post", postRouter);
app.route("/marketplace", marketplaceRouter);
app.route("/event", eventRouter);

// Swagger UI and OpenAPI Document
app.get("/doc", (c) => c.json(openApiDoc));
app.get("/ui", swaggerUI({ url: "/api/doc" }));

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error("Unhandled Error:", err);
  return c.json({ message: "Internal Server Error" }, 500);
});

export default app;
