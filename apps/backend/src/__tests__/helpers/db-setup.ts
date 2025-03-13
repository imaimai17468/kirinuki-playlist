import { createDbClient } from "../../config/database";
import type { Video } from "../../models";
import { videos } from "../../models/videos";
import type { Bindings } from "../../types";

// テーブルの作成
export const setupDatabase = async (env: Bindings): Promise<void> => {
  const client = createDbClient(env.DB);
  try {
    // テーブルが存在するか確認し、なければ作成
    await client.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        start INTEGER NOT NULL,
        end INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  } catch (error) {
    console.error("テーブル作成エラー:", error);
  }
};

// テストデータのシード
export const seedVideos = async (env: Bindings, videoList: Video[]): Promise<void> => {
  const client = createDbClient(env.DB);

  try {
    // テスト前にテーブルをクリア
    await client.delete(videos);
    // D1データベースに挿入
    for (const video of videoList) {
      // SQLiteの列名に合わせてデータを挿入
      await client.run(`
        INSERT INTO videos (id, title, url, start, end, created_at, updated_at)
        VALUES ('${video.id}', '${video.title}', '${video.url}', ${video.start}, ${
          video.end
        }, '${video.createdAt.toISOString()}', '${video.updatedAt.toISOString()}')
      `);
    }
  } catch (error) {
    console.error("シードエラー:", error);
  }
};

// レスポンスデータの型定義
export type ApiResponse<T> = {
  success: boolean;
  [key: string]: unknown;
  data?: T;
};
