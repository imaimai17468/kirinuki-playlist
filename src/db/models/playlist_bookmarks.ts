import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { authors } from "./authors";
import { playlists } from "./playlists";

export const playlistBookmarks = sqliteTable(
  "playlist_bookmarks",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
    playlistId: text("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    authorPlaylistIdx: uniqueIndex("playlist_bookmark_author_playlist_idx").on(table.authorId, table.playlistId),
  }),
);

export const playlistBookmarkInsertSchema = createInsertSchema(playlistBookmarks, {
  id: z.undefined(),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});

export type PlaylistBookmark = typeof playlistBookmarks.$inferSelect;
export type PlaylistBookmarkInsert = z.infer<typeof playlistBookmarkInsertSchema>;
