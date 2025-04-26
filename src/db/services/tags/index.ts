import type { DbClient } from "@/db/config/hono";
import { createBaseTagService } from "./base";
import { createRelationsTagService } from "./features/relations";
import { createSearchTagService } from "./features/search";
import type { TagBase, TagInsert, TagUpdate, TagWithVideos } from "./types";

// タグサービスの作成関数
export const createTagService = (dbClient: DbClient) => {
  const baseService = createBaseTagService(dbClient);
  const relationsService = createRelationsTagService(dbClient, baseService);
  const searchService = createSearchTagService(dbClient, baseService);

  return {
    // 基本操作
    _getTagsWithoutVideos: baseService._getTagsWithoutVideos,
    _getTagByIdWithoutVideos: baseService._getTagByIdWithoutVideos,
    createTag: baseService.createTag,
    updateTag: baseService.updateTag,
    deleteTag: baseService.deleteTag,

    // 関連データ取得
    getTagById: relationsService.getTagById,
    getAllTags: relationsService.getAllTags,

    // 検索機能
    getVideosByTagIds: searchService.getVideosByTagIds,
    getVideosByAllTags: searchService.getVideosByAllTags,
  };
};

// エクスポートする型定義
export type { TagBase, TagInsert, TagUpdate, TagWithVideos };
