import type { DbClient } from "@/db/config/hono";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { videos } from "../../models/videos";
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

  // 公開APIメソッド（著者情報あり）
  async getAllVideos(): Promise<Video[]> {
    try {
      // Drizzle ORMのクエリビルダーを使用
      const results = await dbClient.select().from(videos).innerJoin(authors, eq(videos.authorId, authors.id)).all();

      // 結果を適切な形式に変換
      return results.map((row) => ({
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
      }));
    } catch (error) {
      throw new DatabaseError(
        `動画一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 公開APIメソッド（著者情報あり）
  async getVideoById(id: string): Promise<Video> {
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

  async deleteVideo(id: string): Promise<void> {
    try {
      // まず、動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, id)).get();

      if (!video) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      // データベースから削除
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
