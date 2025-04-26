import type { DbClient } from "@/db/config/hono";
import { authors } from "@/db/models/authors";
import { videoTags } from "@/db/models/relations";
import { tags } from "@/db/models/tags";
import { videos } from "@/db/models/videos";
import type { TagWithVideos } from "@/db/services/tags/types";
import type { BaseTagService } from "@/db/services/tags/types-internal";
import { DatabaseError, NotFoundError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";

export const createRelationsTagService = (dbClient: DbClient, baseService: BaseTagService) => ({
  async getTagById(id: string): Promise<TagWithVideos> {
    try {
      const tag = await baseService._getTagByIdWithoutVideos(id);

      // タグに関連する動画を取得
      const videoTagsResult = await dbClient
        .select()
        .from(videoTags)
        .innerJoin(videos, eq(videoTags.videoId, videos.id))
        .where(eq(videoTags.tagId, id))
        .all();

      // 動画の著者情報とタグ情報を含める
      const videosWithAuthor = await Promise.all(
        videoTagsResult.map(async (row) => {
          // 著者情報の取得
          const author = await dbClient.select().from(authors).where(eq(authors.id, row.videos.authorId)).get();

          if (!author) {
            throw new NotFoundError(`ID: ${row.videos.authorId} の著者が見つかりません`);
          }

          // 動画に関連するタグ情報の取得
          const tagResults = await dbClient
            .select()
            .from(videoTags)
            .innerJoin(tags, eq(videoTags.tagId, tags.id))
            .where(eq(videoTags.videoId, row.videos.id))
            .all();

          // タグデータを抽出して整形
          const relatedTags = tagResults.map((result) => ({
            id: result.tags.id,
            name: result.tags.name,
            createdAt: result.tags.createdAt,
            updatedAt: result.tags.updatedAt,
          }));

          return {
            ...row.videos,
            author: author,
            tags: relatedTags,
          };
        }),
      );

      return {
        ...tag,
        videos: videosWithAuthor,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `タグの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAllTags(): Promise<TagWithVideos[]> {
    try {
      const allTags = await baseService._getTagsWithoutVideos();

      const tagsWithVideos = await Promise.all(
        allTags.map(async (tag) => {
          return this.getTagById(tag.id);
        }),
      );

      return tagsWithVideos;
    } catch (error) {
      throw new DatabaseError(
        `タグ一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },
});
