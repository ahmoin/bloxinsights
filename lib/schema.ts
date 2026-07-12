import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
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

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
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
    index("gameCcu_universeId_timestamp_idx").on(
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
