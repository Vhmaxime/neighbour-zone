import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import authRouter from "./routes/auth.js";
import { swaggerUI } from "@hono/swagger-ui";
import { openApiDoc } from "./utils/opeapi.js";
import { constants } from "./config.js";

const app = new Hono();

app.use("*", cors({ origin: [constants.baseUrl, constants.productionUrl] }));

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

app.get("/doc", (c) => c.json(openApiDoc));

app.get("/ui", swaggerUI({ url: "/doc" }));

export default app;
