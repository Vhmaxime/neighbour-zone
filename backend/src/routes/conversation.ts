import { Hono } from "hono";
import { Variables } from "../types/index.js";
import authMiddleware from "../middleware/auth.js";
import { db } from "../database/index.js";
import { zValidator } from "@hono/zod-validator";
import { conversationSchema } from "../schemas/conversationSchema.js";
import { conversationsTable } from "../database/schema.js";
import { idSchema } from "../schemas/index.js";
import { eq } from "drizzle-orm";

const conversationRouter = new Hono<{ Variables: Variables }>();

conversationRouter.use(authMiddleware);

// Get all conversations for the authenticated user
conversationRouter.get("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const conversations = await db.query.conversationsTable.findMany({
    where: {
      OR: [
        {
          participant1Id: {
            eq: userId,
          },
        },
        {
          participant2Id: {
            eq: userId,
          },
        },
      ],
    },
    columns: {
      id: true,
    },
    with: {
      marketplaceItem: {
        columns: {
          id: true,
          title: true,
          price: true,
          placeDisplayName: true,
          category: true,
          description: true,
        },
      },
      participant1: {
        columns: {
          id: true,
          username: true,
        },
      },
      participant2: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return c.json({ conversations }, 200);
});

// Create a new conversation
conversationRouter.post(
  "/",
  zValidator("json", conversationSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ error: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { sub: userId } = c.get("jwtPayload");

    const { participantId, marketplaceItemId } = c.req.valid("json");

    const [newConversation] = await db
      .insert(conversationsTable)
      .values({
        participant1Id: userId,
        participant2Id: participantId,
        marketplaceItemId,
      })
      .returning();

    const conversation = await db.query.conversationsTable.findFirst({
      where: { id: { eq: newConversation.id } },
      columns: {
        id: true,
      },
      with: {
        marketplaceItem: {
          columns: {
            id: true,
            title: true,
            price: true,
            placeDisplayName: true,
            category: true,
            description: true,
          },
        },
        participant1: {
          columns: {
            id: true,
            username: true,
          },
        },
        participant2: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });

    return c.json({ conversation }, 201);
  }
);

// Get a specific conversation by ID
conversationRouter.get(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const conversation = await db.query.conversationsTable.findFirst({
      where: {
        id: { eq: id },
      },
      columns: {
        id: true,
      },
      with: {
        marketplaceItem: {
          columns: {
            id: true,
            title: true,
            price: true,
            placeDisplayName: true,
            category: true,
            description: true,
          },
        },
        participant1: {
          columns: {
            id: true,
            username: true,
          },
        },
        participant2: {
          columns: {
            id: true,
            username: true,
          },
        },
        messages: {
          columns: {
            content: true,
            senderId: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!conversation) {
      return c.json({ message: "Conversation not found" }, 404);
    }

    if (
      conversation.participant1.id !== userId &&
      conversation.participant2.id !== userId
    ) {
      return c.json({ message: "Forbidden" }, 403);
    }

    return c.json({ conversation }, 200);
  }
);

conversationRouter.delete(
  "/:id",
  zValidator("param", idSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation error:", result.error);
      return c.json({ message: "Invalid request data" }, 400);
    }
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    const conversation = await db.query.conversationsTable.findFirst({
      where: {
        id: { eq: id },
      },
    });

    if (!conversation) {
      return c.json({ message: "Conversation not found" }, 404);
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return c.json({ message: "Forbidden" }, 403);
    }

    await db
      .delete(conversationsTable)
      .where(eq(conversationsTable.id, conversation.id));

    return c.json({ message: "ok" }, 200);
  }
);

// conversationRouter.post(
//   "/:id/message",
//   zValidator("param", idSchema, (result, c) => {
//     if (!result.success) {
//       console.error("Validation error:", result.error);
//       return c.json({ message: "Invalid request data" }, 400);
//     }
//   }),
//   zValidator("json", conversationSchema, (result, c) => {
//   ,
//   async (c) => {
//     const { id: conversationId } = c.req.param();
//     const { sub: userId } = c.get("jwtPayload");
//     const { content } = await c.req.json();
//   }
// );

export default conversationRouter;
