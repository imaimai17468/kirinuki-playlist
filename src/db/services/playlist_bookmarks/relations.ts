import type { DbClient } from "@/db/config/hono";
import type { BasePlaylistBookmarkService } from "./types-internal";

// プレイリストブックマークの関連情報取得サービス
// 将来的な拡張用に用意（現時点では実装なし）
export const createRelationsPlaylistBookmarkService = (
  _dbClient: DbClient,
  _baseService: BasePlaylistBookmarkService,
) => ({
  // 将来的に関連データを取得するメソッドを追加する場合はここに実装
});
