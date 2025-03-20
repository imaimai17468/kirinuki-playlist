import { z } from "zod";

// APIエラーの型定義
export type ApiError =
  | { type: "network"; message: string }
  | { type: "notFound"; message: string }
  | { type: "badRequest"; message: string }
  | { type: "serverError"; message: string };

// 基本的なAPIレスポンスのスキーマ
export const baseResponseSchema = z.object({
  success: z.boolean(),
});

// 各エンティティのZodスキーマの定義
export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconUrl: z.string().url(),
  bio: z.string().nullable().optional(),
  createdAt: z
    .number()
    .or(z.string())
    .transform((val) => (typeof val === "string" ? new Date(val) : new Date(val))),
  updatedAt: z
    .number()
    .or(z.string())
    .transform((val) => (typeof val === "string" ? new Date(val) : new Date(val))),
});

export const videoSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  start: z.number(),
  end: z.number(),
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
  author: authorSchema.optional(),
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
  author: authorSchema.optional(),
  // 関連するvideoフィールドがAPIから返される場合は以下を追加
  videos: z.array(videoSchema).optional(),
});

// APIレスポンスのZodスキーマ
export const authorsResponseSchema = baseResponseSchema.extend({
  authors: z.array(authorSchema),
});

export const authorResponseSchema = baseResponseSchema.extend({
  author: authorSchema,
});

export const videosResponseSchema = baseResponseSchema.extend({
  videos: z.array(videoSchema),
});

export const videoResponseSchema = baseResponseSchema.extend({
  video: videoSchema,
});

export const playlistsResponseSchema = baseResponseSchema.extend({
  playlists: z.array(playlistSchema),
});

export const playlistResponseSchema = baseResponseSchema.extend({
  playlist: playlistSchema,
});

// レスポンスの型定義
export type AuthorsResponse = z.infer<typeof authorsResponseSchema>;
export type AuthorResponse = z.infer<typeof authorResponseSchema>;
export type VideosResponse = z.infer<typeof videosResponseSchema>;
export type VideoResponse = z.infer<typeof videoResponseSchema>;
export type PlaylistsResponse = z.infer<typeof playlistsResponseSchema>;
export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;
