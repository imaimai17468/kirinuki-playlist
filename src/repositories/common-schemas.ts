import { z } from "zod";

/**
 * 共通スキーマ定義
 * 循環参照を避けるための基本的なスキーマ定義を集約します
 */

// タイムスタンプのトランスフォーム関数
export const dateTransformer = (val: string | number) => (typeof val === "string" ? new Date(val) : new Date(val));

// 基本的なタグスキーマ
export const basicTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number().or(z.string()).transform(dateTransformer),
  updatedAt: z.number().or(z.string()).transform(dateTransformer),
});

// 基本的な著者スキーマ
export const basicAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconUrl: z.string().url(),
  bio: z.string().nullable().optional(),
  createdAt: z.number().or(z.string()).transform(dateTransformer),
  updatedAt: z.number().or(z.string()).transform(dateTransformer),
});

// 基本的な動画スキーマ
// 注: 著者とタグの基本情報を含む
export const basicVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  start: z.number(),
  end: z.number(),
  authorId: z.string(),
  createdAt: z.number().or(z.string()).transform(dateTransformer),
  updatedAt: z.number().or(z.string()).transform(dateTransformer),
  author: basicAuthorSchema,
  tags: z.array(basicTagSchema),
});

// 基本的なプレイリスト動画スキーマ（順序情報を含む）
export const basicPlaylistVideoSchema = basicVideoSchema.extend({
  order: z.number(),
});

// 基本的なプレイリストスキーマ
export const basicPlaylistSchema = z.object({
  id: z.string(),
  title: z.string(),
  authorId: z.string(),
  createdAt: z.number().or(z.string()).transform(dateTransformer),
  updatedAt: z.number().or(z.string()).transform(dateTransformer),
  author: basicAuthorSchema,
  videos: z.array(basicPlaylistVideoSchema).optional(),
});

// 基本的な型定義をエクスポート
export type BasicTag = z.infer<typeof basicTagSchema>;
export type BasicAuthor = z.infer<typeof basicAuthorSchema>;
export type BasicVideo = z.infer<typeof basicVideoSchema>;
export type BasicPlaylistVideo = z.infer<typeof basicPlaylistVideoSchema>;
export type BasicPlaylist = z.infer<typeof basicPlaylistSchema>;
