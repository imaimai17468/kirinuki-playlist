import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { authors } from "./authors";
import { follows } from "./follows";
import { playlists } from "./playlists";
import { tags } from "./tags";
import { videoBookmarks } from "./video_bookmarks";
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

export const videoTags = sqliteTable(
  "video_tags",
  {
    videoId: text("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.videoId, table.tagId] }),
  }),
);

export const videosRelations = relations(videos, ({ one, many }) => ({
  author: one(authors, {
    fields: [videos.authorId],
    references: [authors.id],
  }),
  playlistVideos: many(playlistVideos),
  videoTags: many(videoTags),
  bookmarks: many(videoBookmarks),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  videos: many(videos),
  playlists: many(playlists),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  videoBookmarks: many(videoBookmarks),
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

export const tagsRelations = relations(tags, ({ many }) => ({
  videoTags: many(videoTags),
}));

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
  video: one(videos, {
    fields: [videoTags.videoId],
    references: [videos.id],
  }),
  tag: one(tags, {
    fields: [videoTags.tagId],
    references: [tags.id],
  }),
}));

export const playlistVideoInsertSchema = createInsertSchema(playlistVideos, {
  id: z.undefined(),
  playlistId: z.undefined(),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});

// プレイリスト内の動画更新用スキーマ
// videoIdはパスパラメータから取得するため含めない
export const playlistVideoUpdateSchema = z.object({
  order: z.number().int().min(0),
});

export type PlaylistVideoUpdate = z.infer<typeof playlistVideoUpdateSchema>;

export const videoTagInsertSchema = createInsertSchema(videoTags, {
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(authors, {
    fields: [follows.followerId],
    references: [authors.id],
    relationName: "follower",
  }),
  following: one(authors, {
    fields: [follows.followingId],
    references: [authors.id],
    relationName: "following",
  }),
}));

export const videoBookmarksRelations = relations(videoBookmarks, ({ one }) => ({
  author: one(authors, {
    fields: [videoBookmarks.authorId],
    references: [authors.id],
  }),
  video: one(videos, {
    fields: [videoBookmarks.videoId],
    references: [videos.id],
  }),
}));
