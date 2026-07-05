import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const game = sqliteTable("game", {
  universeId: integer("universeId").primaryKey(),
  rootPlaceId: integer("rootPlaceId").notNull(),
  name: text("name").notNull(),
  playerCount: integer("playerCount").notNull().default(0),
  totalUpVotes: integer("totalUpVotes").notNull().default(0),
  totalDownVotes: integer("totalDownVotes").notNull().default(0),
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
