import type { D1Database } from "@cloudflare/workers-types";
import { eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDbClient } from "../config/database";
import { authors } from "../models/authors";
import { videos } from "../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../utils/errors";

// 基本的なビデオの型（内部使用のみ）
type VideoBase = InferSelectModel<typeof videos>;

// 著者情報を含むビデオの型（公開用）
export type Video = VideoBase & {
  author: {
    id: string;
    name: string;
    iconUrl: string;
    bio: string | null;
  };
};

export type VideoInsert = Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">;

export type VideoUpdate = Partial<Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">>;

export const videoService = {
  // 内部使用のメソッド（著者情報なし）
  async _getVideosWithoutAuthors(db: D1Database): Promise<VideoBase[]> {
    const client = createDbClient(db);
    try {
      return await client.select().from(videos).all();
    } catch (_) {
      throw new DatabaseError("動画一覧の取得に失敗しました");
    }
  },

  // 内部使用のメソッド（著者情報なし）
  async _getVideoByIdWithoutAuthor(db: D1Database, id: string): Promise<VideoBase> {
    const client = createDbClient(db);
    try {
      const video = await client.select().from(videos).where(eq(videos.id, id)).get();

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
  async getAllVideos(db: D1Database): Promise<Video[]> {
    const client = createDbClient(db);
    try {
      // Drizzle ORMのクエリビルダーを使用
      const results = await client
        .select({
          video: videos,
          author: authors,
        })
        .from(videos)
        .innerJoin(authors, eq(videos.authorId, authors.id))
        .all();

      // 結果を適切な形式に変換
      return results.map((row) => ({
        id: row.video.id,
        title: row.video.title,
        url: row.video.url,
        start: row.video.start,
        end: row.video.end,
        authorId: row.video.authorId,
        createdAt: row.video.createdAt,
        updatedAt: row.video.updatedAt,
        author: {
          id: row.author.id,
          name: row.author.name,
          iconUrl: row.author.iconUrl,
          bio: row.author.bio,
        },
      }));
    } catch (error) {
      throw new DatabaseError(
        `動画一覧の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 公開APIメソッド（著者情報あり）
  async getVideoById(db: D1Database, id: string): Promise<Video> {
    const client = createDbClient(db);
    try {
      // Drizzle ORMのクエリビルダーを使用
      const result = await client
        .select({
          video: videos,
          author: authors,
        })
        .from(videos)
        .innerJoin(authors, eq(videos.authorId, authors.id))
        .where(eq(videos.id, id))
        .get();

      if (!result) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }

      return {
        id: result.video.id,
        title: result.video.title,
        url: result.video.url,
        start: result.video.start,
        end: result.video.end,
        authorId: result.video.authorId,
        createdAt: result.video.createdAt,
        updatedAt: result.video.updatedAt,
        author: {
          id: result.author.id,
          name: result.author.name,
          iconUrl: result.author.iconUrl,
          bio: result.author.bio,
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

  async createVideo(db: D1Database, data: VideoInsert): Promise<string> {
    const client = createDbClient(db);

    // 現在の日時
    const now = new Date();

    // nanoidを生成
    const id = nanoid();

    try {
      // 著者が存在するか確認
      const author = await client.select().from(authors).where(eq(authors.id, data.authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${data.authorId} の著者が見つかりません`);
      }

      // データベースに挿入
      await client.insert(videos).values({
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

  async updateVideo(db: D1Database, id: string, data: VideoUpdate): Promise<void> {
    const client = createDbClient(db);

    try {
      // authorIdが含まれている場合、著者が存在するか確認
      if (data.authorId) {
        const author = await client.select().from(authors).where(eq(authors.id, data.authorId)).get();
        if (!author) {
          throw new NotFoundError(`ID: ${data.authorId} の著者が見つかりません`);
        }
      }

      // 更新データの準備（updatedAtは自動的に現在時刻に設定）
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // データベースを更新
      const result = await client.update(videos).set(updateData).where(eq(videos.id, id)).run();

      // 影響を受けた行数が0の場合、リソースが存在しない
      if (result.meta.changes === 0) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }
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

  async deleteVideo(db: D1Database, id: string): Promise<void> {
    const client = createDbClient(db);

    try {
      // データベースから削除
      const result = await client.delete(videos).where(eq(videos.id, id)).run();

      // 影響を受けた行数が0の場合、リソースが存在しない
      if (result.meta.changes === 0) {
        throw new NotFoundError(`ID: ${id} の動画が見つかりません`);
      }
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
};
