import type { DbClient } from "@/db/config/hono";
import { createBaseVideoBookmarkService } from "./base";
import type { BookmarkResult } from "./types";

// ビデオブックマークサービスの作成関数
export const createVideoBookmarkService = (dbClient: DbClient) => {
  const baseService = createBaseVideoBookmarkService(dbClient);

  return {
    // 基本操作
    ...baseService,
  };
};

// 型定義のエクスポート
export type { BookmarkResult };
