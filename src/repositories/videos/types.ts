import { z } from "zod";
import { authorSchema } from "../authors/types";
import { baseResponseSchema } from "../types";

// タグスキーマの追加
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
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
  author: authorSchema,
  tags: z.array(tagSchema),
});

// 動画作成用スキーマ
export const videoInsertSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  url: z.string().url("有効なURLを入力してください"),
  authorId: z.string().min(1, "著者IDは必須です"),
  start: z.number().int(),
  end: z.number().int(),
  // タグIDリストの追加（オプショナル）
  tagIds: z.array(z.string()).optional(),
});

// 動画更新用スキーマ
export const videoUpdateSchema = videoInsertSchema.partial();

// APIレスポンスのZodスキーマ
export const videosResponseSchema = baseResponseSchema.extend({
  videos: z.array(videoSchema),
});

export const videoResponseSchema = baseResponseSchema.extend({
  video: videoSchema,
});

// 動画作成レスポンススキーマ
export const videoCreateResponseSchema = baseResponseSchema.extend({
  id: z.string(),
  message: z.string().optional(),
});

// 動画更新・削除レスポンススキーマ
export const videoUpdateDeleteResponseSchema = baseResponseSchema.extend({
  message: z.string().optional(),
});

// タグ操作レスポンススキーマ
export const videoTagsResponseSchema = baseResponseSchema.extend({
  message: z.string().optional(),
});

export type Tag = z.infer<typeof tagSchema>;
export type Video = z.infer<typeof videoSchema>;
export type VideosResponse = z.infer<typeof videosResponseSchema>;
export type VideoResponse = z.infer<typeof videoResponseSchema>;
export type VideoInsert = z.infer<typeof videoInsertSchema>;
export type VideoUpdate = z.infer<typeof videoUpdateSchema>;
export type VideoCreateResponse = z.infer<typeof videoCreateResponseSchema>;
export type VideoUpdateDeleteResponse = z.infer<typeof videoUpdateDeleteResponseSchema>;
export type VideoTagsResponse = z.infer<typeof videoTagsResponseSchema>;
