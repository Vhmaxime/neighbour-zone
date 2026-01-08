import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import { postsTable, postLikesTable, usersTable } from "../database/schema.js";
import { count, desc, eq, and } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { postSchema } from "../schemas/post.js";
import { constants } from "../config/index.js";
import { idSchema } from "../schemas/index.js";

const postRouter = new Hono<{ Variables: Variables }>();

// JWT Middleware
postRouter.use(jwt({ secret: constants.jwtSecret }));

postRouter.get("/", async (c) => {
  const posts = await db
    .select({
      id: postsTable.id,
      author: usersTable.name,
      authorId: postsTable.authorId,
      title: postsTable.title,
      content: postsTable.content,
      type: postsTable.type,
      createdAt: postsTable.createdAt,
      likes: count(postLikesTable.postId),
    })
    .from(postsTable)
    .leftJoin(postLikesTable, eq(postsTable.id, postLikesTable.postId))
    .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
    .groupBy(postsTable.id, usersTable.name)
    .orderBy(desc(postsTable.createdAt));

  return c.json({ posts });
});

postRouter.post(
  "/",
  zValidator("json", postSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { title, content, type } = c.req.valid("json");
    const { sub: authorId } = c.get("jwtPayload");
    const [newPost] = await db
      .insert(postsTable)
      .values({
        authorId,
        title,
        content,
        type,
      })
      .returning();

    const [post] = await db
      .select({
        id: postsTable.id,
        author: usersTable.name,
        authorId: postsTable.authorId,
        title: postsTable.title,
        content: postsTable.content,
        type: postsTable.type,
        createdAt: postsTable.createdAt,
        likes: count(postLikesTable.postId),
      })
      .from(postsTable)
      .where(eq(postsTable.id, newPost.id))
      .leftJoin(postLikesTable, eq(postsTable.id, postLikesTable.postId))
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .groupBy(postsTable.id, usersTable.name)
      .limit(1);

    return c.json({ post }, 201);
  }
);

postRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.valid("param");

    const [post] = await db
      .select({
        id: postsTable.id,
        author: usersTable.name,
        authorId: postsTable.authorId,
        title: postsTable.title,
        content: postsTable.content,
        type: postsTable.type,
        createdAt: postsTable.createdAt,
        likes: count(postLikesTable.postId),
      })
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .leftJoin(postLikesTable, eq(postsTable.id, postLikesTable.postId))
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .groupBy(postsTable.id, usersTable.name)
      .limit(1);

    if (!post) {
      return c.json({ message: "Not found" }, 404);
    }
    return c.json({ post });
  }
);

postRouter.patch(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  zValidator("json", postSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.valid("param");

    const { sub: authorId } = c.get("jwtPayload");

    const updates = c.req.valid("json");

    const [existingPost] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .limit(1);

    if (!existingPost) {
      return c.json({ message: "Not found" }, 404);
    }

    if (existingPost.authorId !== authorId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const [updatedPost] = await db
      .update(postsTable)
      .set(updates)
      .where(eq(postsTable.id, postId))
      .returning();

    const [post] = await db
      .select({
        id: postsTable.id,
        author: usersTable.name,
        authorId: postsTable.authorId,
        title: postsTable.title,
        content: postsTable.content,
        type: postsTable.type,
        createdAt: postsTable.createdAt,
        likes: count(postLikesTable.postId),
      })
      .from(postsTable)
      .where(eq(postsTable.id, updatedPost.id))
      .leftJoin(postLikesTable, eq(postsTable.id, postLikesTable.postId))
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .groupBy(postsTable.id, usersTable.name)
      .limit(1);

    return c.json({ post });
  }
);

postRouter.delete(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.valid("param");

    const { sub: authorId } = c.get("jwtPayload");

    const [existingPost] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .limit(1);

    if (!existingPost) {
      return c.json({ message: "Not found" }, 404);
    }

    if (existingPost.authorId !== authorId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await db.delete(postsTable).where(eq(postsTable.id, postId));

    return c.json({ message: "ok" }, 200);
  }
);

postRouter.post(
  "/:id/like",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.param();

    const { sub: userId } = c.get("jwtPayload");

    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .limit(1);

    if (!post) {
      return c.json({ message: "Not found" }, 404);
    }

    const existingLike = await db
      .select()
      .from(postLikesTable)
      .where(
        and(
          eq(postLikesTable.userId, userId),
          eq(postLikesTable.postId, postId)
        )
      )
      .limit(1);

    if (existingLike.length > 0) {
      await db
        .delete(postLikesTable)
        .where(
          and(
            eq(postLikesTable.userId, userId),
            eq(postLikesTable.postId, postId)
          )
        );
      return c.json({ message: "ok" }, 200);
    }

    await db.insert(postLikesTable).values({
      userId,
      postId,
    });

    return c.json({ message: "ok" }, 200);
  }
);

export default postRouter;
