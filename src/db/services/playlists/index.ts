import type { DbClient } from "@/db/config/hono";
import { createBasePlaylistService } from "@/db/services/playlists/base";
import { createRelationsPlaylistService } from "@/db/services/playlists/features/relations";
import { createVideosPlaylistService } from "@/db/services/playlists/features/videos";
import type {
  PlaylistInsert,
  PlaylistUpdate,
  PlaylistVideoInsert,
  PlaylistVideoUpdate,
  PlaylistWithAuthor,
  PlaylistWithAuthorAndVideos,
} from "./types";

// プレイリストサービスの作成関数
export const createPlaylistService = (dbClient: DbClient) => {
  const baseService = createBasePlaylistService(dbClient);
  const relationsService = createRelationsPlaylistService(dbClient, baseService);
  const videosService = createVideosPlaylistService(dbClient, baseService);

  return {
    // 基本CRUD操作
    ...baseService,

    // 関連データ取得メソッド
    ...relationsService,

    // 動画操作メソッド
    ...videosService,
  };
};

// エクスポートする型定義
export type {
  PlaylistInsert,
  PlaylistUpdate,
  PlaylistVideoInsert,
  PlaylistVideoUpdate,
  PlaylistWithAuthor,
  PlaylistWithAuthorAndVideos,
};
