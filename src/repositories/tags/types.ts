import { z } from "zod";
import { baseResponseSchema } from "../types";
import { videoSchema } from "../videos/types";

// タグスキーマ - videos/types.tsのタグスキーマと一致させる
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

// タグ詳細スキーマ - 関連動画を含む
export const tagWithVideosSchema = tagSchema.extend({
  videos: z.array(videoSchema),
});

// タグ作成スキーマ
export const tagInsertSchema = z.object({
  name: z.string().min(1, "タグ名は必須です"),
});

// タグ更新スキーマ
export const tagUpdateSchema = tagInsertSchema.partial();

// APIレスポンススキーマ
export const tagsResponseSchema = baseResponseSchema.extend({
  tags: z.array(tagSchema),
});

export const tagResponseSchema = baseResponseSchema.extend({
  tag: tagWithVideosSchema,
});

// タグ作成レスポンススキーマ
export const tagCreateResponseSchema = baseResponseSchema.extend({
  id: z.string(),
  message: z.string().optional(),
});

// タグ更新・削除レスポンススキーマ
export const tagUpdateDeleteResponseSchema = baseResponseSchema.extend({
  message: z.string().optional(),
});

// 関連動画IDを取得するレスポンススキーマ
export const tagVideosResponseSchema = baseResponseSchema.extend({
  videoIds: z.array(z.string()),
  message: z.string().optional(),
});

// 型エクスポート
export type Tag = z.infer<typeof tagSchema>;
export type TagWithVideos = z.infer<typeof tagWithVideosSchema>;
export type TagsResponse = z.infer<typeof tagsResponseSchema>;
export type TagResponse = z.infer<typeof tagResponseSchema>;
export type TagInsert = z.infer<typeof tagInsertSchema>;
export type TagUpdate = z.infer<typeof tagUpdateSchema>;
export type TagCreateResponse = z.infer<typeof tagCreateResponseSchema>;
export type TagUpdateDeleteResponse = z.infer<typeof tagUpdateDeleteResponseSchema>;
export type TagVideosResponse = z.infer<typeof tagVideosResponseSchema>;
