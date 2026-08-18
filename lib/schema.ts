import { relations } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  creditBalance: integer("creditBalance").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
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

export const account = sqliteTable(
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
    accessTokenExpiresAt: integer("accessTokenExpiresAt", {
      mode: "timestamp",
    }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
      mode: "timestamp",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const creditTransaction = sqliteTable(
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
    createdAt: integer("createdAt", { mode: "timestamp" })
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

export const game = sqliteTable("game", {
  universeId: integer("universeId").primaryKey(),
  rootPlaceId: integer("rootPlaceId").notNull(),
  name: text("name").notNull(),
  playerCount: integer("playerCount").notNull().default(0),
  totalUpVotes: integer("totalUpVotes").notNull().default(0),
  totalDownVotes: integer("totalDownVotes").notNull().default(0),
  visits: integer("visits").notNull().default(0),
  favoritedCount: integer("favoritedCount").notNull().default(0),
  genre: text("genre"),
  dateCreated: integer("dateCreated", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
});

export const gameCcu = sqliteTable(
  "gameCcu",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    universeId: integer("universeId")
      .notNull()
      .references(() => game.universeId, { onDelete: "cascade" }),
    playerCount: integer("playerCount").notNull(),
    timestamp: integer("timestamp", { mode: "timestamp" })
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

export const thumbnail = sqliteTable(
  "thumbnail",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    imagePath: text("imagePath").notNull(),
    referenceImagePaths: text("referenceImagePaths", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    prompt: text("prompt").notNull(),
    model: text("model").notNull(),
    kind: text("kind").notNull().default("thumbnail"),
    createdAt: integer("createdAt", { mode: "timestamp" })
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

export const asset = sqliteTable(
  "asset",
  {
    id: text("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    name: text("name").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" })
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

export const notification = sqliteTable(
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
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("createdAt", { mode: "timestamp" })
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

export const notificationPreference = sqliteTable("notificationPreference", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  productUpdates: integer("productUpdates", { mode: "boolean" })
    .notNull()
    .default(true),
  ccuAlerts: integer("ccuAlerts", { mode: "boolean" }).notNull().default(true),
  emailNotifications: integer("emailNotifications", { mode: "boolean" })
    .notNull()
    .default(true),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
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

export const contactMessage = sqliteTable("contactMessage", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});
