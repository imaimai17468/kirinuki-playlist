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

export const videosResponseSchema = baseResponseSchema.extend({
  videos: z.array(videoSchema),
});

export const videoResponseSchema = baseResponseSchema.extend({
  video: videoSchema,
});

export type VideosResponse = z.infer<typeof videosResponseSchema>;
export type VideoResponse = z.infer<typeof videoResponseSchema>;
