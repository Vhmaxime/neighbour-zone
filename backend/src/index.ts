import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import authRouter from "./routes/auth.js";

const app = new Hono();

app.use("*", cors());

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.route("/api/auth", authRouter);

app.notFound(() => {
  throw new HTTPException(404);
});

export default app;
