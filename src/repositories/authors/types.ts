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

// APIレスポンスのZodスキーマ
export const authorsResponseSchema = baseResponseSchema.extend({
  authors: z.array(authorSchema),
});

export const authorResponseSchema = baseResponseSchema.extend({
  author: authorSchema,
});

export type AuthorsResponse = z.infer<typeof authorsResponseSchema>;
export type AuthorResponse = z.infer<typeof authorResponseSchema>;
