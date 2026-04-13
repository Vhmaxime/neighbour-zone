import { Hono } from "hono";
import { Variables } from "../types/index.js";
import authMiddleware from "../middleware/auth.js";
import { db } from "../database/index.js";
import { zValidator } from "@hono/zod-validator";
import { conversationsTable, messagesTable } from "../database/schema.js";
import { idSchema } from "../schemas/index.js";
import { eq, and } from "drizzle-orm";
import { messageSchema } from "../schemas/message.js";
import { supabase } from "../config/supabase.js";
import { z } from "zod";

const messagesRouter = new Hono<{ Variables: Variables }>();

messagesRouter.use(authMiddleware);

// Get all messages for a conversation
messagesRouter.get(
  "/:conversationId",
  zValidator("param", z.object({ conversationId: z.uuid() }), (result, c) => {
    if (!result.success) {
      return c.json({ message: "Invalid conversation ID" }, 400);
    }
  }),
  async (c) => {
    const { conversationId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    // Verify user is part of conversation
    const conversation = await db.query.conversationsTable.findFirst({
      where: {
        id: { eq: conversationId },
      },
    });

    if (!conversation) {
      return c.json({ message: "Conversation not found" }, 404);
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    // Get messages from database
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId));

    return c.json({ messages, count: messages.length }, 200);
  }
);

// Send a message
messagesRouter.post(
  "/:conversationId",
  zValidator("param", z.object({ conversationId: z.uuid() }), (result, c) => {
    if (!result.success) {
      return c.json({ message: "Invalid conversation ID" }, 400);
    }
  }),
  zValidator("json", messageSchema, (result, c) => {
    if (!result.success) {
      return c.json({ message: "Invalid message data" }, 400);
    }
  }),
  async (c) => {
    const { conversationId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");
    const { message } = c.req.valid("json");

    // Verify user is part of conversation
    const conversation = await db.query.conversationsTable.findFirst({
      where: {
        id: { eq: conversationId },
      },
    });

    if (!conversation) {
      return c.json({ message: "Conversation not found" }, 404);
    }

    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    // Insert message into database
    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        conversationId,
        senderId: userId,
        content: message,
      })
      .returning();

    // Broadcast via Supabase real-time
    await supabase
      .channel(`conversation:${conversationId}`)
      .send({
        type: "broadcast",
        event: "new_message",
        payload: {
          message: newMessage,
        },
      });

    return c.json(newMessage, 201);
  }
);

// Mark message as read
messagesRouter.put(
  "/:messageId/read",
  zValidator("param", idSchema.extend({ messageId: idSchema.shape.id }), (result, c) => {
    if (!result.success) {
      return c.json({ message: "Invalid message ID" }, 400);
    }
  }),
  async (c) => {
    const { messageId } = c.req.valid("param");
    const { sub: userId } = c.get("jwtPayload");

    // Get the message
    const messageRecord = await db.query.messagesTable.findFirst({
      where: {
        id: { eq: messageId },
      },
      with: {
        conversation: true,
      },
    });

    if (!messageRecord) {
      return c.json({ message: "Message not found" }, 404);
    }

    // Verify user is part of conversation
    const conversation = messageRecord.conversation;
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      return c.json({ message: "Forbidden" }, 403);
    }

    // Update message read status
    const [updatedMessage] = await db
      .update(messagesTable)
      .set({
        readAt: new Date(),
      })
      .where(eq(messagesTable.id, messageId))
      .returning();

    // Broadcast via Supabase real-time
    await supabase
      .channel(`conversation:${conversation.id}`)
      .send({
        type: "broadcast",
        event: "message_read",
        payload: {
          messageId: messageId,
          readAt: updatedMessage.readAt,
        },
      });

    return c.json(updatedMessage, 200);
  }
);

// Delete a message
messagesRouter.delete(
  "/:messageId",
  zValidator("param", z.object({ messageId: z.uuid() }), (result, c) => {
    if (!result.success) {
      return c.json({ message: "Invalid message ID" }, 400);
    }
  }),
  async (c) => {
    try {
      const { messageId } = c.req.valid("param");
      const { sub: userId } = c.get("jwtPayload");

      // Get the message
      const messageRecord = await db.query.messagesTable.findFirst({
        where: {
          id: { eq: messageId },
        },
        with: {
          conversation: true,
        },
      });

      if (!messageRecord) {
        return c.json({ message: "Message not found" }, 404);
      }

      // Check if user is the sender (only sender can delete)
      if (messageRecord.senderId !== userId) {
        return c.json({ message: "You can only delete your own messages" }, 403);
      }

      // Delete the message
      await db
        .delete(messagesTable)
        .where(eq(messagesTable.id, messageId));

      // Broadcast deletion via Supabase real-time
      await supabase
        .channel(`conversation:${messageRecord.conversationId}`)
        .send({
          type: "broadcast",
          event: "message_deleted",
          payload: {
            messageId: messageId,
          },
        });

      return c.json({ message: "Message deleted" }, 200);
    } catch (error) {
      return c.json({ message: "Failed to delete message" }, 500);
    }
  }
);

export default messagesRouter;
