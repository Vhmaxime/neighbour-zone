import { Hono } from "hono";
import authMiddleware from "../middleware/auth";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";

const friendRouter = new Hono<{ Variables: Variables }>();

friendRouter.use(authMiddleware);

friendRouter.get("/list", async (c) => {
  
  return c.json({});
});

friendRouter.get("/requests ", async (c) => {
  return c.json({});
});

friendRouter.get("/sent ", async (c) => {
  return c.json({});
});

friendRouter.post("/request/:id ", async (c) => {
  return c.json({});
});

friendRouter.patch("/accept/:id ", async (c) => {
  return c.json({});
});

friendRouter.delete("/reject/:id ", async (c) => {
  return c.json({});
});

friendRouter.delete("/remove/:id ", async (c) => {
  return c.json({});
});

export default friendRouter;
