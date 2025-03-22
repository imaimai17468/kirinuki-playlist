import Database from "bun:sqlite";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { migrate as migrateSqlite } from "drizzle-orm/bun-sqlite/migrator";
/**
 * テスト環境用のデータベースクライアントを作成します
 * Edge環境対応版 - マイグレーションなし
 * libsqlサーバーに接続
 */
export const createTestDbClient = async (migrationsPath = "./drizzle") => {
  // テスト用のlibsqlサーバーに接続
  const client = new Database(":memory:");
  const db = drizzleSqlite(client);
  await migrateSqlite(db, { migrationsFolder: migrationsPath });

  return drizzleSqlite(client);
};
