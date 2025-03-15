import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const authors = sqliteTable(
  "authors",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    iconUrl: text("icon_url").notNull(),
    bio: text("bio"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  () => [],
);

export type Author = typeof authors.$inferSelect;

export const authorSelectSchema = createSelectSchema(authors);
export const authorInsertSchema = createInsertSchema(authors, {
  id: z.undefined(),
  name: z.string().min(1, "名前は必須です"),
  iconUrl: z.string().url("有効なURLを入力してください"),
  bio: z.string().optional(),
  createdAt: z.undefined(),
  updatedAt: z.undefined(),
});
export const authorUpdateSchema = createUpdateSchema(authors);
