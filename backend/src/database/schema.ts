import {
  pgTable,
  text,
  uuid,
  timestamp,
  decimal,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedPostTypeEnum = pgEnum("feed_post_type", ["news", "tip"]);

export const feedPostsTable = pgTable("feed_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: feedPostTypeEnum("type").notNull().default("news"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceCategoryEnum = pgEnum("marketplace_category", [
  "wanted",
  "offered",
]);

export const marketplaceItemsTable = pgTable("marketplace_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }), // Optioneel
  category: marketplaceCategoryEnum("category").notNull().default("offered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  dateTime: timestamp("date_time").notNull(),
  endAt: timestamp("end_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
]);

export const friendshipsTable = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId1: uuid("user_id_1")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    userId2: uuid("user_id_2")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId1, table.userId2)]
);

export const postLikesTable = pgTable(
  "post_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => feedPostsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.postId)]
);

export const eventLikesTable = pgTable(
  "event_likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.eventId)]
);

export const marketplaceApplicationsTable = pgTable(
  "marketplace_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    marketplaceItemId: uuid("marketplace_item_id")
      .notNull()
      .references(() => marketplaceItemsTable.id, { onDelete: "cascade" }),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export const eventAttendanceTable = pgTable(
  "event_attendance",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.userId, table.eventId)]
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  feedPosts: many(feedPostsTable),
  marketplaceItems: many(marketplaceItemsTable),
  events: many(eventsTable),
  postLikes: many(postLikesTable),
  eventLikes: many(eventLikesTable),
  marketplaceApplications: many(marketplaceApplicationsTable),
  eventAttendances: many(eventAttendanceTable),
  friendshipsAsUser1: many(friendshipsTable),
  friendshipsAsUser2: many(friendshipsTable),
}));

export const feedPostsRelations = relations(
  feedPostsTable,
  ({ one, many }) => ({
    author: one(usersTable, {
      fields: [feedPostsTable.userId],
      references: [usersTable.id],
    }),
    likes: many(postLikesTable),
  })
);

export const marketplaceItemsRelations = relations(
  marketplaceItemsTable,
  ({ one, many }) => ({
    provider: one(usersTable, {
      fields: [marketplaceItemsTable.userId],
      references: [usersTable.id],
    }),
    applications: many(marketplaceApplicationsTable),
  })
);

export const eventsRelations = relations(eventsTable, ({ one, many }) => ({
  organizer: one(usersTable, {
    fields: [eventsTable.userId],
    references: [usersTable.id],
  }),
  likes: many(eventLikesTable),
  attendances: many(eventAttendanceTable),
}));

export const friendshipsRelations = relations(friendshipsTable, ({ one }) => ({
  user1: one(usersTable, {
    fields: [friendshipsTable.userId1],
    references: [usersTable.id],
    relationName: "user1Friendships",
  }),
  user2: one(usersTable, {
    fields: [friendshipsTable.userId2],
    references: [usersTable.id],
    relationName: "user2Friendships",
  }),
}));

export const postLikesRelations = relations(postLikesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [postLikesTable.userId],
    references: [usersTable.id],
  }),
  post: one(feedPostsTable, {
    fields: [postLikesTable.postId],
    references: [feedPostsTable.id],
  }),
}));

export const eventLikesRelations = relations(eventLikesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [eventLikesTable.userId],
    references: [usersTable.id],
  }),
  event: one(eventsTable, {
    fields: [eventLikesTable.eventId],
    references: [eventsTable.id],
  }),
}));

export const marketplaceApplicationsRelations = relations(
  marketplaceApplicationsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [marketplaceApplicationsTable.userId],
      references: [usersTable.id],
    }),
    marketplaceItem: one(marketplaceItemsTable, {
      fields: [marketplaceApplicationsTable.marketplaceItemId],
      references: [marketplaceItemsTable.id],
    }),
  })
);

export const eventAttendanceRelations = relations(
  eventAttendanceTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [eventAttendanceTable.userId],
      references: [usersTable.id],
    }),
    event: one(eventsTable, {
      fields: [eventAttendanceTable.eventId],
      references: [eventsTable.id],
    }),
  })
);
