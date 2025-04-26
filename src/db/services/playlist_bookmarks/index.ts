import type { DbClient } from "@/db/config/hono";
import { createBasePlaylistBookmarkService } from "./base";
import { createRelationsPlaylistBookmarkService } from "./relations";
import type { BookmarkResult } from "./types";

// プレイリストブックマークサービスの作成関数
export const createPlaylistBookmarkService = (dbClient: DbClient) => {
  const baseService = createBasePlaylistBookmarkService(dbClient);
  const relationsService = createRelationsPlaylistBookmarkService(dbClient, baseService);

  return {
    // 基本操作
    ...baseService,

    // 関連データ操作
    ...relationsService,
  };
};

// 型定義のエクスポート
export type { BookmarkResult };
