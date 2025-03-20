import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const playlists = sqliteTable(
  "playlists",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    authorId: text("author_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  () => [],
);

export type Playlist = typeof playlists.$inferSelect;

export const playlistSelectSchema = createSelectSchema(playlists);
export const playlistInsertSchema = createInsertSchema(playlists, {
  id: z.undefined(),
  title: z.string().min(1, "タイトルは必須です"),
  authorId: z.string().min(1, "作成者IDは必須です"),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});
export const playlistUpdateSchema = createUpdateSchema(playlists);
