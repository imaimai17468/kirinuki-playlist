import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { authors } from "./authors";

// フォロー関係を表すテーブル
export const follows = sqliteTable(
  "follows",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => authors.id, {
        onDelete: "cascade",
      }),
    followingId: text("following_id")
      .notNull()
      .references(() => authors.id, {
        onDelete: "cascade",
      }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }),
);

export type Follow = typeof follows.$inferSelect;

export const followSelectSchema = createSelectSchema(follows);
export const followInsertSchema = createInsertSchema(follows, {
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});
