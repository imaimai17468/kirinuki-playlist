import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createDbClient } from "../config/database";
import { videos } from "../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../utils/errors";
import type { D1Database } from "@cloudflare/workers-types";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Video = InferSelectModel<typeof videos>;
export type VideoInsert = Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">;
export type VideoUpdate = Partial<Omit<InferInsertModel<typeof videos>, "id" | "createdAt" | "updatedAt">>;

export const videoService = {
  async getAllVideos(db: D1Database): Promise<Video[]> {
    const client = createDbClient(db);
    try {
      return await client.select().from(videos).all();
    } catch (_) {
      throw new DatabaseError("動画一覧の取得に失敗しました");
    }
  },

  async getVideoById(db: D1Database, id: string): Promise<Video> {
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

  async createVideo(db: D1Database, data: VideoInsert): Promise<string> {
    const client = createDbClient(db);

    // 現在の日時
    const now = new Date();

    // nanoidを生成
    const id = nanoid();

    try {
      // データベースに挿入
      await client.insert(videos).values({
        id,
        ...data,
        createdAt: now,
        updatedAt: now,
      });

      return id;
    } catch (error: unknown) {
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
