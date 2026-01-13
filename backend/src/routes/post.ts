import { Hono } from "hono";
import { Variables } from "../types/index.js";
import { db } from "../database/index.js";
import { postsTable, postLikesTable } from "../database/schema.js";
import { eq, and } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { postSchema } from "../schemas/post.js";
import { idSchema } from "../schemas/index.js";
import authMiddleware from "../middleware/auth.js";

const postRouter = new Hono<{ Variables: Variables }>();

postRouter.use(authMiddleware);

// Get all posts
postRouter.get("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const posts = await db.query.postsTable.findMany({
    columns: {
      authorId: false,
    },
    with: {
      author: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
    extras: {
      likes: (table) =>
        db.$count(postLikesTable, eq(table.id, postLikesTable.postId)),
    },
  });

  const likedPostIds = await db.query.postLikesTable.findMany({
    where: { userId: { eq: userId } },
    columns: {
      postId: true,
    },
  });

  const postSet = posts.map((post) => {
    const liked = likedPostIds.some((like) => like.postId === post.id);
    return {
      ...post,
      liked,
    };
  });

  return c.json({ posts: postSet }, 200);
});

// Create a new post
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

    const post = await db.query.postsTable.findFirst({
      where: { id: { eq: newPost.id } },
      columns: {
        authorId: false,
      },
      with: {
        author: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return c.json({ post }, 201);
  }
);

// Get a single post by ID
postRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.valid("param");

    const { sub: userId } = c.get("jwtPayload");

    const post = await db.query.postsTable.findFirst({
      where: { id: { eq: postId } },
      columns: {
        authorId: false,
      },
      with: {
        author: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
      extras: {
        likes: (table) =>
          db.$count(postLikesTable, eq(table.id, postLikesTable.postId)),
      },
    });

    if (!post) {
      return c.json({ message: "Not found" }, 404);
    }

    const liked = !!(await db.query.postLikesTable.findFirst({
      where: {
        AND: [{ postId: { eq: postId } }, { userId: { eq: userId } }],
      },
    }));

    if (post.author?.id === userId) {
      const likedBy = await db.query.postLikesTable.findMany({
        where: { postId: { eq: postId } },
        columns: {},
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      });

      return c.json({ ...post, liked, likedBy }, 200);
    }

    return c.json({ ...post, liked }, 200);
  }
);

// Update a post by ID
postRouter.patch(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  zValidator("json", postSchema.partial(), (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.valid("param");

    const { sub: authorId } = c.get("jwtPayload");

    const updates = c.req.valid("json");

    const existing = await db.query.postsTable.findFirst({
      where: { id: { eq: postId } },
    });

    if (!existing) {
      return c.json({ message: "Not found" }, 404);
    }

    if (existing.authorId !== authorId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    const [updatedPost] = await db
      .update(postsTable)
      .set(updates)
      .where(eq(postsTable.id, postId))
      .returning();

    const post = await db.query.postsTable.findFirst({
      where: { id: { eq: updatedPost.id } },
      columns: {
        authorId: false,
      },
      with: {
        author: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return c.json({ post }, 200);
  }
);

// Delete a post by ID
postRouter.delete(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.valid("param");

    const { sub: authorId } = c.get("jwtPayload");

    const existing = await db.query.postsTable.findFirst({
      where: { id: { eq: postId } },
    });

    if (!existing) {
      return c.json({ message: "Not found" }, 404);
    }

    if (existing.authorId !== authorId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await db.delete(postsTable).where(eq(postsTable.id, postId));

    return c.json({ message: "ok" }, 200);
  }
);

// Like or unlike a post
postRouter.post(
  "/:id/like",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: postId } = c.req.param();

    const { sub: userId } = c.get("jwtPayload");

    const post = await db.query.postsTable.findFirst({
      where: { id: { eq: postId } },
    });

    if (!post) {
      return c.json({ message: "Not found" }, 404);
    }

    const existing = await db.query.postLikesTable.findFirst({
      where: {
        AND: [{ postId: { eq: postId } }, { userId: { eq: userId } }],
      },
    });

    if (existing) {
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

postRouter.get(
  "/user/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Bad request" }, 400);
    }
  }),
  async (c) => {
    const { id: userId } = c.req.valid("param");

    const user = await db.query.usersTable.findFirst({
      where: {
        id: { eq: userId },
      },
    });

    if (!user) {
      return c.json({ message: "Not found" }, 404);
    }

    const posts = await db.query.postsTable.findMany({
      columns: {
        authorId: false,
      },
      with: {
        author: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
      extras: {
        likes: (table) =>
          db.$count(postLikesTable, eq(table.id, postLikesTable.postId)),
      },
    });

    const likedPostIds = await db.query.postLikesTable.findMany({
      where: { userId: { eq: userId } },
      columns: {
        postId: true,
      },
    });

    const postSet = posts.map((post) => {
      const liked = likedPostIds.some((like) => like.postId === post.id);
      return {
        ...post,
        liked,
      };
    });

    return c.json({ posts: postSet }, 200);
  }
);

export default postRouter;
