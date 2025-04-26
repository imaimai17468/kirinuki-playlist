import type { Tag } from "@/db/models/tags";
import type { videos } from "@/db/models/videos";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// 基本的なビデオの型
export type VideoBase = InferSelectModel<typeof videos>;

// 著者情報を含むビデオの型（公開用）
export type Video = VideoBase & {
  author: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

// 著者情報とタグ情報を含むビデオの型（公開用）
export type VideoWithTagsAndAuthor = Video & {
  tags: Tag[];
};

export type VideoInsert = Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">;

export type VideoUpdate = Partial<Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">>;

// タグを含むビデオ挿入型
export type VideoInsertWithTags = VideoInsert & {
  tags: string[];
};
