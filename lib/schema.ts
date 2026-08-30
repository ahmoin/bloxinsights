import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  creditBalance: integer("creditBalance").notNull().default(0),
  createdAt: timestamp("createdAt")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updatedAt")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updatedAt")
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const creditTransaction = pgTable(
  "creditTransaction",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    balanceAfter: integer("balanceAfter").notNull(),
    type: text("type", {
      enum: ["purchase", "thumbnail_generation", "refund", "grant"],
    }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("creditTransaction_userId_createdAt_idx").on(
      table.userId,
      table.createdAt
    ),
  ]
);

export const creditTransactionRelations = relations(
  creditTransaction,
  ({ one }) => ({
    user: one(user, {
      fields: [creditTransaction.userId],
      references: [user.id],
    }),
  })
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  creditTransactions: many(creditTransaction),
  notifications: many(notification),
  notificationPreference: one(notificationPreference, {
    fields: [user.id],
    references: [notificationPreference.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const game = pgTable("game", {
  universeId: bigint("universeId", { mode: "number" }).primaryKey(),
  rootPlaceId: bigint("rootPlaceId", { mode: "number" }).notNull(),
  name: text("name").notNull(),
  playerCount: integer("playerCount").notNull().default(0),
  totalUpVotes: bigint("totalUpVotes", { mode: "number" }).notNull().default(0),
  totalDownVotes: bigint("totalDownVotes", { mode: "number" })
    .notNull()
    .default(0),
  visits: bigint("visits", { mode: "number" }).notNull().default(0),
  favoritedCount: bigint("favoritedCount", { mode: "number" })
    .notNull()
    .default(0),
  genre: text("genre"),
  dateCreated: timestamp("dateCreated"),
  createdAt: timestamp("createdAt")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updatedAt")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const gameCcu = pgTable(
  "gameCcu",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    universeId: bigint("universeId", { mode: "number" })
      .notNull()
      .references(() => game.universeId, { onDelete: "cascade" }),
    playerCount: integer("playerCount").notNull(),
    timestamp: timestamp("timestamp")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("gameCcu_universeId_timestamp_idx").on(
      table.universeId,
      table.timestamp
    ),
    index("gameCcu_timestamp_idx").on(table.timestamp),
  ]
);

export const gameRelations = relations(game, ({ many }) => ({
  ccuHistory: many(gameCcu),
}));

export const gameCcuRelations = relations(gameCcu, ({ one }) => ({
  game: one(game, {
    fields: [gameCcu.universeId],
    references: [game.universeId],
  }),
}));

export const thumbnail = pgTable(
  "thumbnail",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    imagePath: text("imagePath").notNull(),
    referenceImagePaths: json("referenceImagePaths")
      .$type<string[]>()
      .notNull()
      .default([]),
    prompt: text("prompt").notNull(),
    model: text("model").notNull(),
    kind: text("kind").notNull().default("thumbnail"),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("thumbnail_userId_createdAt_idx").on(table.userId, table.createdAt),
  ]
);

export const thumbnailRelations = relations(thumbnail, ({ one }) => ({
  user: one(user, {
    fields: [thumbnail.userId],
    references: [user.id],
  }),
}));

export const asset = pgTable(
  "asset",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("asset_userId_createdAt_idx").on(table.userId, table.createdAt),
  ]
);

export const assetRelations = relations(asset, ({ one }) => ({
  user: one(user, {
    fields: [asset.userId],
    references: [user.id],
  }),
}));

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["system", "product_update", "billing", "ccu_alert"],
    }).notNull(),
    title: text("title").notNull(),
    body: text("body"),
    url: text("url"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("createdAt")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("notification_userId_createdAt_idx").on(
      table.userId,
      table.createdAt
    ),
    index("notification_userId_read_idx").on(table.userId, table.read),
  ]
);

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));

export const notificationPreference = pgTable("notificationPreference", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  productUpdates: boolean("productUpdates").notNull().default(true),
  ccuAlerts: boolean("ccuAlerts").notNull().default(true),
  emailNotifications: boolean("emailNotifications").notNull().default(true),
  updatedAt: timestamp("updatedAt")
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const notificationPreferenceRelations = relations(
  notificationPreference,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationPreference.userId],
      references: [user.id],
    }),
  })
);

export const contactMessage = pgTable("contactMessage", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt")
    .$defaultFn(() => new Date())
    .notNull(),
});
