import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { authors } from "./authors";
import { playlists } from "./playlists";
import { videos } from "./videos";

export const playlistVideos = sqliteTable(
  "playlist_videos",
  {
    id: text("id").primaryKey(),
    playlistId: text("playlist_id").notNull(),
    videoId: text("video_id").notNull(),
    order: integer("order").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  () => [],
);

export const videosRelations = relations(videos, ({ one, many }) => ({
  author: one(authors, {
    fields: [videos.authorId],
    references: [authors.id],
  }),
  playlistVideos: many(playlistVideos),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  videos: many(videos),
  playlists: many(playlists),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  author: one(authors, {
    fields: [playlists.authorId],
    references: [authors.id],
  }),
  playlistVideos: many(playlistVideos),
}));

export const playlistVideosRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));

export const playlistVideoInsertSchema = createInsertSchema(playlistVideos, {
  id: z.undefined(),
  playlistId: z.undefined(),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});
