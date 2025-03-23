import { z } from "zod";
import { authorSchema } from "../authors/types";
import { baseResponseSchema } from "../types";
import { videoSchema } from "../videos/types";

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

export const playlistsResponseSchema = baseResponseSchema.extend({
  playlists: z.array(playlistSchema),
});

export const playlistResponseSchema = baseResponseSchema.extend({
  playlist: playlistSchema,
});

export type PlaylistsResponse = z.infer<typeof playlistsResponseSchema>;
export type PlaylistResponse = z.infer<typeof playlistResponseSchema>;
