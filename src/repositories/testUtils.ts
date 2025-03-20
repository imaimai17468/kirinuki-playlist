import type { SQL } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createTestDbClient } from "../db/config/database";
import type { authors } from "../db/models/authors";
import type { playlists } from "../db/models/playlists";
import type { playlistVideos } from "../db/models/relations";
import type { videos } from "../db/models/videos";

/**
 * テスト用のデータベースクライアントを作成します
 * @param migrationsPath マイグレーションフォルダのパス（デフォルト：'./drizzle'）
 */
export const createTestDb = async (migrationsPath = "./drizzle") => {
  return await createTestDbClient(migrationsPath);
};

/**
 * テスト用の著者データを作成します
 * @param overrides デフォルト値を上書きするデータ
 */
export const createTestAuthor = (overrides: Partial<typeof authors.$inferInsert> = {}) => {
  const now = new Date();
  return {
    id: nanoid(),
    name: "テスト著者",
    iconUrl: "https://example.com/icon.png",
    bio: "テスト用の著者です",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * テスト用の動画データを作成します
 * @param authorId 著者ID
 * @param overrides デフォルト値を上書きするデータ
 */
export const createTestVideo = (authorId: string, overrides: Partial<typeof videos.$inferInsert> = {}) => {
  const now = new Date();
  return {
    id: nanoid(),
    title: "テスト動画",
    url: "https://example.com/video.mp4",
    start: 0,
    end: 100,
    authorId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * テスト用のプレイリストデータを作成します
 * @param authorId 著者ID
 * @param overrides デフォルト値を上書きするデータ
 */
export const createTestPlaylist = (authorId: string, overrides: Partial<typeof playlists.$inferInsert> = {}) => {
  const now = new Date();
  return {
    id: nanoid(),
    title: "テストプレイリスト",
    authorId,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * テスト用のプレイリストと動画の関連データを作成します
 * @param playlistId プレイリストID
 * @param videoId 動画ID
 * @param order 順序
 */
export const createTestPlaylistToVideo = (
  playlistId: string,
  videoId: string,
  order: number,
): Omit<typeof playlistVideos.$inferInsert, "id" | "createdAt" | "updatedAt"> => {
  return {
    playlistId,
    videoId,
    order,
  };
};

/**
 * データベースにテストデータをシードします
 * @param db データベースクライアント
 * @param queries 実行するクエリの配列
 */
export const seedDatabase = async (db: Awaited<ReturnType<typeof createTestDb>>, queries: SQL[]) => {
  // トランザクション内で全てのクエリを実行
  for (const query of queries) {
    await db.run(query);
  }
};

/**
 * テスト用のリポジトリ環境をセットアップします
 * @param seedQueries 初期データ用のクエリ（オプション）
 */
export const setupTestRepository = async (seedQueries: SQL[] = []) => {
  // テスト用のデータベースクライアントを作成
  const db = await createTestDb();

  // シードデータを挿入（指定されている場合）
  if (seedQueries.length > 0) {
    await seedDatabase(db, seedQueries);
  }

  return { db };
};

/**
 * テスト終了後にリソースをクリーンアップします
 */
export const cleanupTestRepository = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _db: Awaited<ReturnType<typeof createTestDb>>,
) => {
  // インメモリDBなので自動的にクリーンアップされる
  // 将来的に必要があれば、ここにクリーンアップ処理を追加
};
