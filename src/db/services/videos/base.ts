import type { DbClient } from "@/db/config/hono";
import { authors } from "@/db/models/authors";
import { videoTags } from "@/db/models/relations";
import { tags } from "@/db/models/tags";
import { videos } from "@/db/models/videos";
import type { VideoBase, VideoInsert, VideoUpdate, VideoWithTagsAndAuthor } from "@/db/services/videos/types";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export const createBaseVideoService = (dbClient: DbClient) => ({
  // 内部使用のメソッド（著者情報なし）
  async _getVideosWithoutAuthors(): Promise<VideoBase[]> {
    try {
      return await dbClient.select().from(videos).all();
    } catch (_) {
      throw new DatabaseError("動画一覧の取得に失敗しました");
    }
  },

  // 内部使用のメソッド（著者情報なし）
  async _getVideoByIdWithoutAuthor(id: string): Promise<VideoBase> {
    try {
      const video = await dbClient.select().from(videos).where(eq(videos.id, id)).get();

      if (!video) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      return video;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `動画の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 公開APIメソッド（著者情報とタグ情報あり）
  async getAllVideos(): Promise<VideoWithTagsAndAuthor[]> {
    try {
      // Drizzle ORMのクエリビルダーを使用
      const results = await dbClient.select().from(videos).innerJoin(authors, eq(videos.authorId, authors.id)).all();

      // 結果を適切な形式に変換し、タグ情報を追加
      const videosWithTags = await Promise.all(
        results.map(async (row) => {
          const videoTagsResult = await dbClient
            .select()
            .from(videoTags)
            .innerJoin(tags, eq(videoTags.tagId, tags.id))
            .where(eq(videoTags.videoId, row.videos.id))
            .all();

          return {
            id: row.videos.id,
            title: row.videos.title,
            url: row.videos.url,
            start: row.videos.start,
            end: row.videos.end,
            authorId: row.videos.authorId,
            createdAt: row.videos.createdAt,
            updatedAt: row.videos.updatedAt,
            author: {
              id: row.authors.id,
              name: row.authors.name,
              iconUrl: row.authors.iconUrl,
              bio: row.authors.bio,
              createdAt: row.authors.createdAt,
              updatedAt: row.authors.updatedAt,
            },
            tags: videoTagsResult.map((tagRow) => tagRow.tags),
          };
        }),
      );

      return videosWithTags;
    } catch (error) {
      throw new DatabaseError(
        `動画一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 公開APIメソッド（著者情報とタグ情報あり）
  async getVideoById(id: string): Promise<VideoWithTagsAndAuthor> {
    try {
      // Drizzle ORMのクエリビルダーを使用
      const result = await dbClient
        .select()
        .from(videos)
        .innerJoin(authors, eq(videos.authorId, authors.id))
        .where(eq(videos.id, id))
        .get();

      if (!result) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      // ビデオに関連するタグを取得
      const videoTagsResult = await dbClient
        .select()
        .from(videoTags)
        .innerJoin(tags, eq(videoTags.tagId, tags.id))
        .where(eq(videoTags.videoId, id))
        .all();

      return {
        id: result.videos.id,
        title: result.videos.title,
        url: result.videos.url,
        start: result.videos.start,
        end: result.videos.end,
        authorId: result.videos.authorId,
        createdAt: result.videos.createdAt,
        updatedAt: result.videos.updatedAt,
        author: {
          id: result.authors.id,
          name: result.authors.name,
          iconUrl: result.authors.iconUrl,
          bio: result.authors.bio,
          createdAt: result.authors.createdAt,
          updatedAt: result.authors.updatedAt,
        },
        tags: videoTagsResult.map((row) => row.tags),
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `動画の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async createVideo(data: VideoInsert): Promise<string> {
    // 現在の日時
    const now = new Date();

    // nanoidを生成
    const id = nanoid();

    try {
      // 著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, data.authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${data.authorId} の著者が見つかりません`);
      }

      // データベースに挿入
      await dbClient.insert(videos).values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("この動画IDはすでに使用されています");
        }

        throw new DatabaseError("動画の保存中にエラーが発生しました");
      }

      throw error;
    }
  },

  async updateVideo(id: string, data: VideoUpdate): Promise<void> {
    try {
      // 更新データの準備（updatedAtは自動的に現在時刻に設定）
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // まず、ビデオが存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, id)).get();

      if (!video) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      // データベースを更新
      await dbClient.update(videos).set(updateData).where(eq(videos.id, id)).run();
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`動画の更新中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async deleteVideo(id: string): Promise<void> {
    try {
      // まず、ビデオが存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, id)).get();

      if (!video) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      // 関連するビデオタグを削除
      await dbClient.delete(videoTags).where(eq(videoTags.videoId, id)).run();

      // ビデオを削除
      await dbClient.delete(videos).where(eq(videos.id, id)).run();
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`動画の削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },
});
