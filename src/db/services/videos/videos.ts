import type { DbClient } from "@/db/config/hono";
import { and, eq, inArray } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { videoTags } from "../../models/relations";
import { tags } from "../../models/tags";
import type { Tag } from "../../models/tags";
import { videos } from "../../models/videos";
import type { VideoInsertWithTags } from "../../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";

// 基本的なビデオの型（内部使用のみ）
type VideoBase = InferSelectModel<typeof videos>;

// 著者情報を含むビデオの型（公開用）
export type Video = VideoBase & {
  author: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

// 著者情報とタグ情報を含むビデオの型（公開用）
export type VideoWithTagsAndAuthor = Video & {
  tags: Tag[];
};

export type VideoInsert = Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">;

export type VideoUpdate = Partial<Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">>;

// 依存性注入パターンを使ったビデオサービスの作成関数
export const createVideoService = (dbClient: DbClient) => ({
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
      // authorIdが含まれている場合、著者が存在するか確認
      if (data.authorId) {
        const author = await dbClient.select().from(authors).where(eq(authors.id, data.authorId)).get();
        if (!author) {
          throw new NotFoundError(`ID: ${data.authorId} の著者が見つかりません`);
        }
      }

      // まず、動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, id)).get();

      if (!video) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      // 更新データの準備（updatedAtは自動的に現在時刻に設定）
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

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

  // タグでビデオをフィルタリング
  async getVideosByTags(tagIds: string[]): Promise<VideoWithTagsAndAuthor[]> {
    if (tagIds.length === 0) {
      return this.getAllVideos();
    }

    try {
      // 指定されたタグを持つビデオIDを取得
      const videoIdsWithTags = await dbClient
        .select()
        .from(videoTags)
        .where(tagIds.length === 1 ? eq(videoTags.tagId, tagIds[0]) : inArray(videoTags.tagId, tagIds))
        .groupBy(videoTags.videoId)
        .all();

      const videoIds = videoIdsWithTags.map((row) => row.videoId);

      if (videoIds.length === 0) {
        return [];
      }

      // 取得したビデオIDに対応するビデオとタグを取得
      const videosWithTags = await Promise.all(videoIds.map((videoId) => this.getVideoById(videoId)));

      return videosWithTags;
    } catch (error) {
      throw new DatabaseError(
        `タグでのビデオ検索中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // タグ付きでビデオを作成
  async createVideoWithTags(data: VideoInsertWithTags): Promise<string> {
    const { tags: tagIds, ...videoData } = data;

    try {
      // 著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, videoData.authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${videoData.authorId} の著者が見つかりません`);
      }

      // タグが存在するか確認（トランザクション外で）
      if (tagIds && tagIds.length > 0) {
        for (const tagId of tagIds) {
          const tagExists = await dbClient.select().from(tags).where(eq(tags.id, tagId)).get();
          if (!tagExists) {
            throw new NotFoundError(`ID: ${tagId} のタグが見つかりません`);
          }
        }
      }

      // トランザクションを開始
      let videoId = "";
      await dbClient.transaction(async (tx) => {
        // 現在の日時
        const now = new Date();

        // nanoidを生成
        const id = nanoid();
        videoId = id;

        // ビデオをデータベースに挿入
        await tx.insert(videos).values({
          id,
          ...videoData,
          createdAt: now,
          updatedAt: now,
        });

        // タグを関連付け
        if (tagIds && tagIds.length > 0) {
          // 中間テーブルにレコードを挿入
          for (const tagId of tagIds) {
            await tx.insert(videoTags).values({
              videoId: id,
              tagId,
              createdAt: now,
              updatedAt: now,
            });
          }
        }
      });

      return videoId;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("この動画IDまたはタグIDの関連付けがすでに存在します");
        }

        throw new DatabaseError(`動画とタグの保存中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  // ビデオのタグを更新
  async updateVideoTags(id: string, tagIds: string[]): Promise<void> {
    try {
      await dbClient.transaction(async (tx) => {
        // まず、動画が存在するか確認
        const video = await tx.select().from(videos).where(eq(videos.id, id)).get();
        if (!video) {
          throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
        }

        // 指定されたタグが存在するか確認
        for (const tagId of tagIds) {
          const tagExists = await tx.select().from(tags).where(eq(tags.id, tagId)).get();
          if (!tagExists) {
            throw new NotFoundError(`ID: ${tagId} のタグが見つかりません`);
          }
        }

        // 現在のタグ関連付けをすべて削除
        await tx.delete(videoTags).where(eq(videoTags.videoId, id)).run();

        // 新しいタグ関連付けを追加
        const now = new Date();
        await Promise.all(
          tagIds.map((tagId) =>
            tx.insert(videoTags).values({
              videoId: id,
              tagId,
              createdAt: now,
              updatedAt: now,
            }),
          ),
        );
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`ビデオのタグ更新中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  // ビデオから特定のタグを削除
  async removeTagFromVideo(videoId: string, tagId: string): Promise<void> {
    try {
      // まず、動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, videoId)).get();
      if (!video) {
        throw new NotFoundError(`ID: ${videoId} の動画が見つかりません`);
      }

      // タグが存在するか確認
      const tag = await dbClient.select().from(tags).where(eq(tags.id, tagId)).get();
      if (!tag) {
        throw new NotFoundError(`ID: ${tagId} のタグが見つかりません`);
      }

      // 動画とタグの関連付けを削除
      await dbClient
        .delete(videoTags)
        .where(and(eq(videoTags.videoId, videoId), eq(videoTags.tagId, tagId)))
        .run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`ビデオからタグの削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  async deleteVideo(id: string): Promise<void> {
    try {
      // まず、動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, id)).get();

      if (!video) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      // トランザクションを開始
      await dbClient.transaction(async (tx) => {
        // 動画に関連するタグの関連付けを削除
        await tx.delete(videoTags).where(eq(videoTags.videoId, id)).run();

        // 動画を削除
        await tx.delete(videos).where(eq(videos.id, id)).run();
      });
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
