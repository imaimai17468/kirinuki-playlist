import { z } from "zod";
import { baseResponseSchema } from "../types";

const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  iconUrl: z.string().url(),
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

export type FollowersResponse = z.infer<typeof followersResponseSchema>;
export type FollowingResponse = z.infer<typeof followingResponseSchema>;
export type IsFollowingResponse = z.infer<typeof isFollowingResponseSchema>;
