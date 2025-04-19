import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { authors } from "./authors";
import { videos } from "./videos";

export const videoBookmarks = sqliteTable(
  "video_bookmarks",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    authorVideoIdx: uniqueIndex("video_bookmark_author_video_idx").on(table.authorId, table.videoId),
  }),
);

export const videoBookmarkInsertSchema = createInsertSchema(videoBookmarks, {
  id: z.undefined(),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});

export type VideoBookmark = typeof videoBookmarks.$inferSelect;
export type VideoBookmarkInsert = z.infer<typeof videoBookmarkInsertSchema>;
