import type { DbClient } from "@/db/config/hono";
import { createBasePlaylistBookmarkService } from "./base";
import type { BookmarkResult } from "./types";

// プレイリストブックマークサービスの作成関数
export const createPlaylistBookmarkService = (dbClient: DbClient) => {
  const baseService = createBasePlaylistBookmarkService(dbClient);

  return {
    // 基本操作
    ...baseService,
  };
};

// 型定義のエクスポート
export type { BookmarkResult };
