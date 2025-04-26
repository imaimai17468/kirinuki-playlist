import type { DbClient } from "@/db/config/hono";
import { videoTags } from "@/db/models/relations";
import type { BaseTagService } from "@/db/services/tags/types-internal";
import { DatabaseError } from "@/db/utils/errors";
import { eq, inArray } from "drizzle-orm";

export const createSearchTagService = (dbClient: DbClient, _baseService: BaseTagService) => ({
  // 複数のタグIDで動画を取得
  async getVideosByTagIds(tagIds: string[]): Promise<string[]> {
    if (tagIds.length === 0) {
      return [];
    }

    try {
      // 指定されたタグを持つビデオIDを取得
      const videoIdsWithTags = await dbClient
        .select()
        .from(videoTags)
        .where(tagIds.length === 1 ? eq(videoTags.tagId, tagIds[0]) : inArray(videoTags.tagId, tagIds))
        .groupBy(videoTags.videoId)
        .all();

      return videoIdsWithTags.map((row) => row.videoId);
    } catch (error) {
      throw new DatabaseError(
        `タグによる動画IDの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 指定した複数のタグをすべて持つ動画IDを取得
  async getVideosByAllTags(tagIds: string[]): Promise<string[]> {
    if (tagIds.length === 0) {
      return [];
    }

    try {
      // 各タグごとに動画IDを取得し、共通するIDのみを抽出
      const results = await Promise.all(
        tagIds.map(async (tagId) => {
          const videoTagsResult = await dbClient.select().from(videoTags).where(eq(videoTags.tagId, tagId)).all();
          return videoTagsResult.map((row) => row.videoId);
        }),
      );

      // すべてのタグに共通する動画IDを抽出（セット演算）
      if (results.length === 0) return [];

      let commonVideoIds = results[0];
      for (let i = 1; i < results.length; i++) {
        commonVideoIds = commonVideoIds.filter((id) => results[i].includes(id));
      }

      return commonVideoIds;
    } catch (error) {
      throw new DatabaseError(
        `複数タグによる共通動画の検索中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },
});
