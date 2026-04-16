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
    marketplaceSaves: r.many.marketplaceSavesTable(),
    eventAttendances: r.many.eventAttendanceTable(),
    friendshipsAsUser1: r.many.friendshipsTable({
      alias: "user1Friendships",
    }),
    friendshipsAsUser2: r.many.friendshipsTable({
      alias: "user2Friendships",
    }),
    communityMemberships: r.many.communityMembersTable(),
    createdCommunities: r.many.communitiesTable(),
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
    community: r.one.communitiesTable({
      from: r.postsTable.communityId,
      to: r.communitiesTable.id,
      optional: true,
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
    saves: r.many.marketplaceSavesTable({
      from: r.marketplaceItemsTable.id,
      to: r.marketplaceSavesTable.marketplaceItemId,
    }),
    community: r.one.communitiesTable({
      from: r.marketplaceItemsTable.communityId,
      to: r.communitiesTable.id,
      optional: true,
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
    community: r.one.communitiesTable({
      from: r.eventsTable.communityId,
      to: r.communitiesTable.id,
      optional: true,
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
  marketplaceSavesTable: {
    user: r.one.usersTable({
      from: r.marketplaceSavesTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
    marketplaceItem: r.one.marketplaceItemsTable({
      from: r.marketplaceSavesTable.marketplaceItemId,
      to: r.marketplaceItemsTable.id,
      optional: false,
    }),
  },
  communitiesTable: {
    creator: r.one.usersTable({
      from: r.communitiesTable.creatorId,
      to: r.usersTable.id,
      optional: false,
    }),
    members: r.many.communityMembersTable({
      from: r.communitiesTable.id,
      to: r.communityMembersTable.communityId,
    }),
    posts: r.many.postsTable({
      from: r.communitiesTable.id,
      to: r.postsTable.communityId,
    }),
    events: r.many.eventsTable({
      from: r.communitiesTable.id,
      to: r.eventsTable.communityId,
    }),
    marketplaceItems: r.many.marketplaceItemsTable({
      from: r.communitiesTable.id,
      to: r.marketplaceItemsTable.communityId,
    }),
  },
  communityMembersTable: {
    community: r.one.communitiesTable({
      from: r.communityMembersTable.communityId,
      to: r.communitiesTable.id,
      optional: false,
    }),
    user: r.one.usersTable({
      from: r.communityMembersTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
  },
}));
