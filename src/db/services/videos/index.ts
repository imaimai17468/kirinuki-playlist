import type { DbClient } from "@/db/config/hono";
import { createBaseVideoService } from "./base";
import { createVideoTagsService } from "./features/tags";
import type { Video, VideoBase, VideoInsert, VideoInsertWithTags, VideoUpdate, VideoWithTagsAndAuthor } from "./types";

// ビデオサービスの作成関数
export const createVideoService = (dbClient: DbClient) => {
  const baseService = createBaseVideoService(dbClient);
  const tagsService = createVideoTagsService(dbClient, baseService);

  return {
    // 基本CRUD操作とタグ関連操作
    ...tagsService,
  };
};

// 型定義のエクスポート
export type { Video, VideoBase, VideoInsert, VideoUpdate, VideoWithTagsAndAuthor, VideoInsertWithTags };
