import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import type { Tag } from "./tags";

export const videos = sqliteTable(
  "videos",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    start: integer("start", { mode: "number" }).notNull(),
    end: integer("end", { mode: "number" }).notNull(),
    authorId: text("author_id").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  () => [],
);

export type Video = typeof videos.$inferSelect;
export type VideoWithTags = Video & { tags: Tag[] };

export const videoSelectSchema = createSelectSchema(videos);
export const videoInsertSchema = createInsertSchema(videos, {
  id: z.undefined(),
  title: z.string().min(1, "タイトルは必須です"),
  url: z.string().url("有効なURLを入力してください"),
  start: z.number().int().nonnegative("開始時間は0以上の整数である必要があります"),
  end: z.number().int().positive("終了時間は正の整数である必要があります"),
  authorId: z.string().min(1, "作成者IDは必須です"),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});
export const videoUpdateSchema = createUpdateSchema(videos);

// タグIDの配列を含むスキーマ
export const videoWithTagsSchema = videoInsertSchema.extend({
  tags: z.array(z.string()).optional(),
});

export type VideoInsertWithTags = z.infer<typeof videoWithTagsSchema>;
