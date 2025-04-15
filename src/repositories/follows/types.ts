import { z } from "zod";
import { baseResponseSchema } from "../types";

// UserCardコンポーネントと互換性を持つユーザー情報のスキーマ
const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconUrl: z.string().url(),
  // UserCardで利用できるように追加のフィールドを定義（オプショナル）
  createdAt: z.coerce.date().optional(),
  bio: z.string().nullable().optional(),
  followerCount: z.number().optional(),
  videoCount: z.number().optional(),
  playlistCount: z.number().optional(),
});

export const followersResponseSchema = baseResponseSchema.extend({
  followers: z.array(authorSchema),
});

export const followingResponseSchema = baseResponseSchema.extend({
  following: z.array(authorSchema),
});

export const isFollowingResponseSchema = baseResponseSchema.extend({
  isFollowing: z.boolean(),
});

// 以下の型はすでに定義されたスキーマから型を推論
export type FollowersResponse = z.infer<typeof followersResponseSchema>;
export type FollowingResponse = z.infer<typeof followingResponseSchema>;
export type IsFollowingResponse = z.infer<typeof isFollowingResponseSchema>;
// UserCardで利用できるユーザー型をエクスポート
export type UserWithCountsType = z.infer<typeof authorSchema>;
