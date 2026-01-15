import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  unique,
  primaryKey,
  real,
  integer,
} from "drizzle-orm/pg-core";
import { send } from "node:process";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  username: text("username").notNull().unique(),
  bio: text("bio"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postTypeEnum = pgEnum("post_type", ["news", "tip"]);

export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: postTypeEnum("type").notNull().default("news"),
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
  price: real("price"),
  location: text("location").notNull(),
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
  placeDisplayName: text("place_display_name").notNull(),
  placeId: integer("place_id").notNull(),
  lat: text("lat").notNull(),
  lon: text("lon").notNull(),
  dateTime: timestamp("date_time", { mode: "date" }).notNull(),
  endAt: timestamp("end_at", { mode: "date" }),
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

export const messagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  receiverId: uuid("receiver_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postLikesTable = pgTable(
  "post_likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })]
);

export const eventLikesTable = pgTable(
  "event_likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.eventId] })]
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
  },
  (table) => [unique().on(table.userId, table.marketplaceItemId)]
);

export const eventAttendanceTable = pgTable(
  "event_attendance",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.eventId] })]
);
