import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import authRouter from "./routes/auth.js";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDoc } from "./opeapi.js";
import { constants } from "./config/index.js";
import { Variables } from "./types/index.js";
import { logger } from "hono/logger";
import { getBaseUrl } from "./utils/env.js";
import userRouter from "./routes/user.js";
import postRouter from "./routes/posts.js";
import marketplaceRouter from "./routes/marketplace.js";

const app = new Hono<{ Variables: Variables }>().basePath("/api");

// Logger Middleware
app.use(logger());

// CORS Middleware
app.use(cors());

// Health Check Endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: constants.vercelEnv || "development",
    origin: getBaseUrl(),
  });
});

app.route("/auth", authRouter);
app.route("/user", userRouter);
app.route("/post", postRouter);
app.route("/marketplace", marketplaceRouter);

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
