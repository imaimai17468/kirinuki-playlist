import type { DbClient } from "@/db/config/hono";
import { and, eq, inArray } from "drizzle-orm";
import { videoTags } from "../../../models/relations";
import { tags } from "../../../models/tags";
import { DatabaseError, NotFoundError } from "../../../utils/errors";
import type { VideoInsertWithTags, VideoWithTagsAndAuthor } from "../types";
import type { BaseVideoService } from "../types-internal";

export const createVideoTagsService = (dbClient: DbClient, baseService: BaseVideoService) => {
  return {
    // 基本サービスのメソッドを継承
    ...baseService,

    // タグIDによる動画の検索
    async getVideosByTags(tagIds: string[]): Promise<VideoWithTagsAndAuthor[]> {
      try {
        // タグIDの重複を排除
        const uniqueTagIds = Array.from(new Set(tagIds));

        // タグが指定されていない場合は全ての動画を返す
        if (uniqueTagIds.length === 0) {
          return await baseService.getAllVideos();
        }

        // ビデオタグの関連を検索
        const videoTagsResult = await dbClient
          .select()
          .from(videoTags)
          .where(inArray(videoTags.tagId, uniqueTagIds))
          .all();

        // 一意のビデオIDを抽出
        const videoIds = Array.from(new Set(videoTagsResult.map((row) => row.videoId)));

        // ビデオIDがない場合は空配列を返す
        if (videoIds.length === 0) {
          return [];
        }

        // 関連する動画を取得（すべての動画を取得してフィルタリング）
        const allVideos = await baseService.getAllVideos();
        return allVideos.filter((video) => videoIds.includes(video.id));
      } catch (error) {
        throw new DatabaseError(
          `タグによる動画検索中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        );
      }
    },

    // タグ付きの動画作成
    async createVideoWithTags(data: VideoInsertWithTags): Promise<string> {
      const { tags: tagIds, ...videoData } = data;

      try {
        // トランザクションを使用して一連の操作を実行
        const videoId = await baseService.createVideo(videoData);

        // タグが指定されている場合は関連付けを作成
        if (tagIds && tagIds.length > 0) {
          // 一意のタグIDを取得
          const uniqueTagIds = Array.from(new Set(tagIds));

          // 各タグが存在するか確認
          for (const tagId of uniqueTagIds) {
            const tagExists = await dbClient.select().from(tags).where(eq(tags.id, tagId)).get();
            if (!tagExists) {
              throw new NotFoundError(`ID: ${tagId} のタグが見つかりません`);
            }
          }

          // タグと動画の関連付けを作成
          const now = new Date();
          await Promise.all(
            uniqueTagIds.map((tagId) =>
              dbClient.insert(videoTags).values({
                videoId,
                tagId,
                createdAt: now,
                updatedAt: now,
              }),
            ),
          );
        }

        return videoId;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        throw new DatabaseError(
          `タグ付き動画の作成中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        );
      }
    },

    // 動画のタグを更新
    async updateVideoTags(id: string, tagIds: string[]): Promise<void> {
      try {
        // 動画が存在するか確認
        await baseService._getVideoByIdWithoutAuthor(id);

        // 既存のタグ関連をすべて削除
        await dbClient.delete(videoTags).where(eq(videoTags.videoId, id)).run();

        // タグが指定されている場合は新しい関連を作成
        if (tagIds && tagIds.length > 0) {
          // 一意のタグIDを取得
          const uniqueTagIds = Array.from(new Set(tagIds));

          // 各タグが存在するか確認
          for (const tagId of uniqueTagIds) {
            const tagExists = await dbClient.select().from(tags).where(eq(tags.id, tagId)).get();
            if (!tagExists) {
              throw new NotFoundError(`ID: ${tagId} のタグが見つかりません`);
            }
          }

          // タグと動画の関連付けを作成
          const now = new Date();
          await Promise.all(
            uniqueTagIds.map((tagId) =>
              dbClient.insert(videoTags).values({
                videoId: id,
                tagId,
                createdAt: now,
                updatedAt: now,
              }),
            ),
          );
        }
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        throw new DatabaseError(
          `動画タグの更新中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        );
      }
    },

    // 動画からタグを削除
    async removeTagFromVideo(videoId: string, tagId: string): Promise<void> {
      try {
        // 動画が存在するか確認
        await baseService._getVideoByIdWithoutAuthor(videoId);

        // タグが存在するか確認
        const tagExists = await dbClient.select().from(tags).where(eq(tags.id, tagId)).get();
        if (!tagExists) {
          throw new NotFoundError(`ID: ${tagId} のタグが見つかりません`);
        }

        // タグと動画の関連付けを削除
        await dbClient
          .delete(videoTags)
          .where(and(eq(videoTags.videoId, videoId), eq(videoTags.tagId, tagId)))
          .run();
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }

        throw new DatabaseError(
          `動画からのタグ削除中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        );
      }
    },
  };
};
