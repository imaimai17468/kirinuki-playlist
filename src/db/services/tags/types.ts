import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { tags } from "../../models/tags";

// 基本的なタグの型
export type TagBase = InferSelectModel<typeof tags>;

// 動画情報を含むタグの型（公開用）
export type TagWithVideos = TagBase & {
  videos: {
    id: string;
    title: string;
    url: string;
    start: number | null;
    end: number | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      iconUrl: string;
      bio: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    tags: {
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];
};

export type TagInsert = Omit<InferInsertModel<typeof tags>, "id" | "createdAt" | "updatedAt">;

export type TagUpdate = Partial<Omit<InferInsertModel<typeof tags>, "id" | "createdAt" | "updatedAt">>;
