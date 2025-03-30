import { z } from "zod";
import { authorSchema } from "../authors/types";
import { baseResponseSchema } from "../types";
import { videoSchema } from "../videos/types";

export const playlistVideoSchema = videoSchema.extend({
  order: z.number(),
});

export const playlistSchema = z.object({
  id: z.string(),
  title: z.string(),
  authorId: z.string(),
  createdAt: z
    .number()
    .or(z.string())
    .transform((val) => (typeof val === "string" ? new Date(val) : new Date(val))),
  updatedAt: z
    .number()
    .or(z.string())
    .transform((val) => (typeof val === "string" ? new Date(val) : new Date(val))),
  // 関連するauthorフィールドがAPIから返される場合は以下を追加
  author: authorSchema,
  // 関連するvideoフィールドがAPIから返される場合は以下を追加
  videos: z.array(playlistVideoSchema).optional(),
});

export const playlistsResponseSchema = baseResponseSchema.extend({
  playlists: z.array(playlistSchema),
});

export const playlistResponseSchema = baseResponseSchema.extend({
  playlist: playlistSchema,
});

// プレイリスト作成用スキーマ
export const playlistInsertSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  authorId: z.string().min(1, "著者IDは必須です"),
});

// プレイリスト更新用スキーマ
export const playlistUpdateSchema = playlistInsertSchema.partial();

// プレイリスト動画追加用スキーマ
export const playlistVideoInsertSchema = z.object({
  videoId: z.string().min(1, "動画IDは必須です"),
  order: z.number().int(),
});

// プレイリスト動画更新用スキーマ
export const playlistVideoUpdateSchema = z.object({
  order: z.number().int().min(0, "順序は0以上の整数である必要があります"),
});

// プレイリスト作成レスポンススキーマ
export const playlistCreateResponseSchema = baseResponseSchema.extend({
  id: z.string(),
  message: z.string().optional(),
});

// プレイリスト更新・削除レスポンススキーマ
export const playlistUpdateDeleteResponseSchema = baseResponseSchema.extend({
  message: z.string().optional(),
});

export type Playlist = z.infer<typeof playlistSchema>;
export type PlaylistVideo = z.infer<typeof playlistVideoSchema>;
export type PlaylistsResponse = z.infer<typeof playlistsResponseSchema>;
export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;
export type PlaylistInsert = z.infer<typeof playlistInsertSchema>;
export type PlaylistUpdate = z.infer<typeof playlistUpdateSchema>;
export type PlaylistVideoInsert = z.infer<typeof playlistVideoInsertSchema>;
export type PlaylistVideoUpdate = z.infer<typeof playlistVideoUpdateSchema>;
export type PlaylistCreateResponse = z.infer<typeof playlistCreateResponseSchema>;
export type PlaylistUpdateDeleteResponse = z.infer<typeof playlistUpdateDeleteResponseSchema>;
