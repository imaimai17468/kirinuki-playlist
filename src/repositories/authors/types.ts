import { basicAuthorSchema, basicPlaylistSchema, basicVideoSchema } from "@/repositories/common-schemas";
import { z } from "zod";
import { baseResponseSchema } from "../types";

// 著者スキーマを共通スキーマを元に定義
export const authorSchema = basicAuthorSchema;

// 著者作成用スキーマ
export const authorInsertSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  iconUrl: z.string().url("有効なURLを入力してください"),
  bio: z.string().max(500, "自己紹介は500文字以内で入力してください").optional(),
});

// 著者更新用スキーマ
export const authorUpdateSchema = authorInsertSchema.partial();

// 著者と動画を含む拡張スキーマ
export const authorWithVideosSchema = authorSchema.extend({
  videos: z.array(basicVideoSchema),
});

// 著者とプレイリストを含む拡張スキーマ
export const authorWithPlaylistsSchema = authorSchema.extend({
  playlists: z.array(basicPlaylistSchema),
});

// 著者と動画、プレイリストを含む拡張スキーマ
export const authorWithVideosAndPlaylistsSchema = authorSchema.extend({
  videos: z.array(basicVideoSchema),
  playlists: z.array(basicPlaylistSchema),
});

// 著者とカウント情報を含む拡張スキーマ
export const authorWithCountsSchema = authorSchema.extend({
  followerCount: z.number(),
  videoCount: z.number(),
  playlistCount: z.number(),
});

// 著者と動画、プレイリスト、カウント情報を含む拡張スキーマ
export const authorWithVideosPlaylistsAndCountsSchema = authorWithVideosAndPlaylistsSchema.extend({
  followerCount: z.number(),
  videoCount: z.number(),
  playlistCount: z.number(),
});

// APIレスポンスのZodスキーマ
export const authorsResponseSchema = baseResponseSchema.extend({
  authors: z.array(authorSchema),
});

// カウント情報を含む著者一覧レスポンススキーマ
export const authorsWithCountsResponseSchema = baseResponseSchema.extend({
  authors: z.array(authorWithCountsSchema),
});

export const authorResponseSchema = baseResponseSchema.extend({
  author: z.union([
    authorSchema,
    authorWithVideosSchema,
    authorWithPlaylistsSchema,
    authorWithVideosAndPlaylistsSchema,
    authorWithCountsSchema,
    authorWithVideosPlaylistsAndCountsSchema,
  ]),
});

// 動画を含む著者レスポンス専用のスキーマ
export const authorWithVideosResponseSchema = baseResponseSchema.extend({
  author: authorWithVideosSchema,
});

// プレイリストを含む著者レスポンス専用のスキーマ
export const authorWithPlaylistsResponseSchema = baseResponseSchema.extend({
  author: authorWithPlaylistsSchema,
});

// 動画とプレイリストを含む著者レスポンス専用のスキーマ
export const authorWithVideosAndPlaylistsResponseSchema = baseResponseSchema.extend({
  author: authorWithVideosAndPlaylistsSchema,
});

// カウント情報を含む著者レスポンス専用のスキーマ
export const authorWithCountsResponseSchema = baseResponseSchema.extend({
  author: authorWithCountsSchema,
});

// 全ての情報を含む著者レスポンス専用のスキーマ
export const authorWithVideosPlaylistsAndCountsResponseSchema = baseResponseSchema.extend({
  author: authorWithVideosPlaylistsAndCountsSchema,
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
export type AuthorsWithCountsResponse = z.infer<typeof authorsWithCountsResponseSchema>;
export type AuthorResponse = z.infer<typeof authorResponseSchema>;
export type AuthorInsert = z.infer<typeof authorInsertSchema>;
export type AuthorUpdate = z.infer<typeof authorUpdateSchema>;
export type AuthorWithVideos = z.infer<typeof authorWithVideosSchema>;
export type AuthorWithPlaylists = z.infer<typeof authorWithPlaylistsSchema>;
export type AuthorWithVideosAndPlaylists = z.infer<typeof authorWithVideosAndPlaylistsSchema>;
export type AuthorWithCounts = z.infer<typeof authorWithCountsSchema>;
export type AuthorWithVideosPlaylistsAndCounts = z.infer<typeof authorWithVideosPlaylistsAndCountsSchema>;
export type AuthorCreateResponse = z.infer<typeof authorCreateResponseSchema>;
export type AuthorUpdateDeleteResponse = z.infer<typeof authorUpdateDeleteResponseSchema>;
