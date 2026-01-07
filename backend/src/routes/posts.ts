import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import { postsTable, postLikesTable, usersTable } from "../database/schema.js";
import { count, desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { postIdSchema, postSchema } from "../schemas/post.js";
import { constants } from "../config/index.js";

const postRouter = new Hono<{ Variables: Variables }>();

// JWT Middleware
postRouter.use(jwt({ secret: constants.jwtSecret }));

postRouter.get("/", async (c) => {
  try {
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
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new HTTPException(500, { message: "Error fetching posts" });
  }
});

postRouter.post(
  "/",
  zValidator("json", postSchema, (result) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  async (c) => {
    try {
      const { title, content, type } = c.req.valid("json");
      const { sub: authorId } = c.get("jwtPayload");
      console.log(c.get("jwtPayload"));
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
    } catch (error) {
      console.error("Error creating post:", error);
      throw new HTTPException(500, { message: "Error creating post" });
    }
  }
);

postRouter.get(
  "/:id",
  zValidator("param", postIdSchema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  async (c) => {
    try {
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
        throw new HTTPException(404, { message: "Post not found" });
      }
      return c.json({ post });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error fetching post:", error);
      throw new HTTPException(500, { message: "Error fetching post" });
    }
  }
);

postRouter.patch(
  "/:id",
  zValidator("param", postIdSchema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  zValidator("json", postSchema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  async (c) => {
    try {
      const { id: postId } = c.req.valid("param");
      const { sub: authorId } = c.get("jwtPayload");
      const updates = c.req.valid("json");

      const [existingPost] = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, postId))
        .limit(1);

      if (!existingPost) {
        throw new HTTPException(404, { message: "Post not found" });
      }

      if (existingPost.authorId !== authorId) {
        throw new HTTPException(403, {
          message: "Unauthorized to update this post",
        });
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
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error updating post:", error);
      throw new HTTPException(500, { message: "Error updating post" });
    }
  }
);

postRouter.delete(
  "/:id",
  zValidator("param", postIdSchema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: "Invalid request",
      });
    }
  }),
  async (c) => {
    try {
      const { id: postId } = c.req.valid("param");
      const { sub: authorId } = c.get("jwtPayload");
      const [existingPost] = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, postId))
        .limit(1);
      if (!existingPost) {
        throw new HTTPException(404, { message: "Post not found" });
      }
      if (existingPost.authorId !== authorId) {
        throw new HTTPException(403, {
          message: "Unauthorized to delete this post",
        });
      }
      await db.delete(postsTable).where(eq(postsTable.id, postId));
      return c.json({ message: "Post deleted successfully" });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error("Error deleting post:", error);
      throw new HTTPException(500, { message: "Error deleting post" });
    }
  }
);

export default postRouter;
