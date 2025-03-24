import { z } from "zod";
import { baseResponseSchema } from "../types";

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

// 著者作成用スキーマ
export const authorInsertSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  iconUrl: z.string().url("有効なURLを入力してください"),
  bio: z.string().max(500, "自己紹介は500文字以内で入力してください").optional(),
});

// 著者更新用スキーマ
export const authorUpdateSchema = authorInsertSchema.partial();

// APIレスポンスのZodスキーマ
export const authorsResponseSchema = baseResponseSchema.extend({
  authors: z.array(authorSchema),
});

export const authorResponseSchema = baseResponseSchema.extend({
  author: authorSchema,
});

// 著者作成レスポンススキーマ
export const authorCreateResponseSchema = baseResponseSchema.extend({
  id: z.string(),
  message: z.string().optional(),
});

// 著者更新・削除レスポンススキーマ
export const authorUpdateDeleteResponseSchema = baseResponseSchema.extend({
  message: z.string().optional(),
});

export type AuthorsResponse = z.infer<typeof authorsResponseSchema>;
export type AuthorResponse = z.infer<typeof authorResponseSchema>;
export type AuthorInsert = z.infer<typeof authorInsertSchema>;
export type AuthorUpdate = z.infer<typeof authorUpdateSchema>;
export type AuthorCreateResponse = z.infer<typeof authorCreateResponseSchema>;
export type AuthorUpdateDeleteResponse = z.infer<typeof authorUpdateDeleteResponseSchema>;
