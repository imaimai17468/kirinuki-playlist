import { z } from "zod";
import { authorSchema } from "../authors/types";
import { baseResponseSchema } from "../types";

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

// 動画作成用スキーマ
export const videoInsertSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  url: z.string().url("有効なURLを入力してください"),
  authorId: z.string().min(1, "著者IDは必須です"),
  start: z.number().int(),
  end: z.number().int(),
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

export type VideosResponse = z.infer<typeof videosResponseSchema>;
export type VideoResponse = z.infer<typeof videoResponseSchema>;
export type VideoInsert = z.infer<typeof videoInsertSchema>;
export type VideoUpdate = z.infer<typeof videoUpdateSchema>;
export type VideoCreateResponse = z.infer<typeof videoCreateResponseSchema>;
export type VideoUpdateDeleteResponse = z.infer<typeof videoUpdateDeleteResponseSchema>;
