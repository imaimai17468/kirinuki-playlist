import { relations } from "drizzle-orm";
import { authors } from "./authors";
import { videos } from "./videos";

export const videosRelations = relations(videos, ({ one }) => ({
  author: one(authors, {
    fields: [videos.authorId],
    references: [authors.id],
  }),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  videos: many(videos),
}));
