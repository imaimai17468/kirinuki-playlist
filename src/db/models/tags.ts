import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const tags = sqliteTable(
  "tags",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  () => [],
);

export type Tag = typeof tags.$inferSelect;

export const tagSelectSchema = createSelectSchema(tags);
export const tagInsertSchema = createInsertSchema(tags, {
  id: z.undefined(),
  name: z.string().min(1, "タグ名は必須です"),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});
export const tagUpdateSchema = createUpdateSchema(tags);

// タグIDのみのスキーマ（API用）
export const tagIdSchema = z.object({
  tagId: z.string(),
});
