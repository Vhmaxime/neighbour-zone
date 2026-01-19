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
      optional: false,
    }),
    likes: r.many.postLikesTable({
      from: r.postsTable.id,
      to: r.postLikesTable.postId,
    }),
  },
  marketplaceItemsTable: {
    provider: r.one.usersTable({
      from: r.marketplaceItemsTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
    applications: r.many.marketplaceApplicationsTable({
      from: r.marketplaceItemsTable.id,
      to: r.marketplaceApplicationsTable.marketplaceItemId,
    }),
  },
  eventsTable: {
    organizer: r.one.usersTable({
      from: r.eventsTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
    likes: r.many.eventLikesTable({
      from: r.eventsTable.id,
      to: r.eventLikesTable.eventId,
    }),
    attendances: r.many.eventAttendanceTable({
      from: r.eventsTable.id,
      to: r.eventAttendanceTable.eventId,
    }),
  },
  friendshipsTable: {
    user1: r.one.usersTable({
      from: r.friendshipsTable.userId1,
      to: r.usersTable.id,
      alias: "user1Friendships",
      optional: false,
    }),
    user2: r.one.usersTable({
      from: r.friendshipsTable.userId2,
      to: r.usersTable.id,
      alias: "user2Friendships",
      optional: false,
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
      optional: false,
    }),
    participant2: r.one.usersTable({
      from: r.conversationsTable.participant2Id,
      to: r.usersTable.id,
      optional: false,
    }),
  },
  messagesTable: {
    sender: r.one.usersTable({
      from: r.messagesTable.senderId,
      to: r.usersTable.id,
      optional: false,
    }),
    conversation: r.one.conversationsTable({
      from: r.messagesTable.conversationId,
      to: r.conversationsTable.id,
      optional: false,
    }),
  },
  postLikesTable: {
    user: r.one.usersTable({
      from: r.postLikesTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
    post: r.one.postsTable({
      from: r.postLikesTable.postId,
      to: r.postsTable.id,
      optional: false,
    }),
  },
  eventLikesTable: {
    user: r.one.usersTable({
      from: r.eventLikesTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
    event: r.one.eventsTable({
      from: r.eventLikesTable.eventId,
      to: r.eventsTable.id,
      optional: false,
    }),
  },
  marketplaceApplicationsTable: {
    user: r.one.usersTable({
      from: r.marketplaceApplicationsTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
    marketplaceItem: r.one.marketplaceItemsTable({
      from: r.marketplaceApplicationsTable.marketplaceItemId,
      to: r.marketplaceItemsTable.id,
      optional: false,
    }),
  },
  eventAttendanceTable: {
    user: r.one.usersTable({
      from: r.eventAttendanceTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
    event: r.one.eventsTable({
      from: r.eventAttendanceTable.eventId,
      to: r.eventsTable.id,
      optional: false,
    }),
  },
}));
