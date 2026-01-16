import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.js";

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    posts: r.many.postsTable(),
    marketplaceItems: r.many.marketplaceItemsTable(),
    events: r.many.eventsTable(),
    postLikes: r.many.postLikesTable(),
    eventLikes: r.many.eventLikesTable(),
    marketplaceApplications: r.many.marketplaceApplicationsTable(),
    eventAttendances: r.many.eventAttendanceTable(),
    friendshipsAsUser1: r.many.friendshipsTable({
      alias: "user1Friendships",
    }),
    friendshipsAsUser2: r.many.friendshipsTable({
      alias: "user2Friendships",
    }),
  },
  postsTable: {
    author: r.one.usersTable({
      from: r.postsTable.authorId,
      to: r.usersTable.id,
    }),
    likes: r.many.postLikesTable(),
  },
  marketplaceItemsTable: {
    provider: r.one.usersTable({
      from: r.marketplaceItemsTable.userId,
      to: r.usersTable.id,
    }),
    applications: r.many.marketplaceApplicationsTable(),
  },
  eventsTable: {
    organizer: r.one.usersTable({
      from: r.eventsTable.userId,
      to: r.usersTable.id,
    }),
    likes: r.many.eventLikesTable(),
    attendances: r.many.eventAttendanceTable(),
  },
  friendshipsTable: {
    user1: r.one.usersTable({
      from: r.friendshipsTable.userId1,
      to: r.usersTable.id,
      alias: "user1Friendships",
    }),
    user2: r.one.usersTable({
      from: r.friendshipsTable.userId2,
      to: r.usersTable.id,
      alias: "user2Friendships",
    }),
  },
  conversationsTable: {
    messages: r.many.messagesTable({
      from: r.conversationsTable.id,
      to: r.messagesTable.conversationId,
    }),
    participant1: r.one.usersTable({
      from: r.conversationsTable.participant1Id,
      to: r.usersTable.id,
    }),
    participant2: r.one.usersTable({
      from: r.conversationsTable.participant2Id,
      to: r.usersTable.id,
    }),
    marketplaceItem: r.one.marketplaceItemsTable({
      from: r.conversationsTable.marketplaceItemId,
      to: r.marketplaceItemsTable.id,
    }),
  },
  messagesTable: {
    sender: r.one.usersTable({
      from: r.messagesTable.senderId,
      to: r.usersTable.id,
    }),
    conversation: r.one.conversationsTable({
      from: r.messagesTable.conversationId,
      to: r.conversationsTable.id,
    }),
  },
  postLikesTable: {
    user: r.one.usersTable({
      from: r.postLikesTable.userId,
      to: r.usersTable.id,
    }),
    post: r.one.postsTable({
      from: r.postLikesTable.postId,
      to: r.postsTable.id,
    }),
  },
  eventLikesTable: {
    user: r.one.usersTable({
      from: r.eventLikesTable.userId,
      to: r.usersTable.id,
    }),
    event: r.one.eventsTable({
      from: r.eventLikesTable.eventId,
      to: r.eventsTable.id,
    }),
  },
  marketplaceApplicationsTable: {
    user: r.one.usersTable({
      from: r.marketplaceApplicationsTable.userId,
      to: r.usersTable.id,
    }),
    marketplaceItem: r.one.marketplaceItemsTable({
      from: r.marketplaceApplicationsTable.marketplaceItemId,
      to: r.marketplaceItemsTable.id,
    }),
  },
  eventAttendanceTable: {
    user: r.one.usersTable({
      from: r.eventAttendanceTable.userId,
      to: r.usersTable.id,
    }),
    event: r.one.eventsTable({
      from: r.eventAttendanceTable.eventId,
      to: r.eventsTable.id,
    }),
  },
}));
