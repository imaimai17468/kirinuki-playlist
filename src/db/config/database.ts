import { Database } from "bun:sqlite";
import type { D1Database } from "@cloudflare/workers-types";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { migrate as migrateSqlite } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/d1";

/**
 * 本番環境用のデータベースクライアントを作成します
 * Cloudflare WorkersのD1データベースを使用
 */
export const createDbClient = (db: D1Database) => {
  // @ts-ignore D1Database types mismatch between @cloudflare/workers-types and @miniflare/d1
  return drizzle(db);
};

/**
 * 開発環境用のデータベースクライアントを作成します
 * ファイルベースのSQLiteデータベースを使用
 * @param dbPath データベースファイルのパス（デフォルト：'./dev.db'）
 * @param migrationsPath マイグレーションフォルダのパス（デフォルト：'./drizzle'）
 */
export const createDevDbClient = async (dbPath = "./dev.db", migrationsPath = "./drizzle") => {
  // Bunに組み込まれたSQLiteを使用
  const sqlite = new Database(dbPath);

  // Drizzle ORMのクライアントを作成
  const db = drizzleSqlite(sqlite);

  // マイグレーションを実行
  await migrateSqlite(db, { migrationsFolder: migrationsPath });

  return db;
};

/**
 * テスト環境用のデータベースクライアントを作成します
 * インメモリのSQLiteデータベースを使用
 * @param migrationsPath マイグレーションフォルダのパス（デフォルト：'./drizzle'）
 */
export const createTestDbClient = async (migrationsPath = "./drizzle") => {
  // インメモリデータベースを作成（":memory:"を指定）
  const sqlite = new Database(":memory:");

  // Drizzle ORMのクライアントを作成
  const db = drizzleSqlite(sqlite);

  // マイグレーションを実行
  await migrateSqlite(db, { migrationsFolder: migrationsPath });

  return db;
};

/**
 * 環境変数に基づいて適切なデータベースクライアントを作成します
 * @param env 環境変数オブジェクト
 */
export const createClient = (env: {
  D1_INSTANCE?: D1Database;
  NODE_ENV?: string;
}) => {
  // 本番/ステージング環境の場合
  if (env.D1_INSTANCE) {
    return createDbClient(env.D1_INSTANCE);
  }

  // 開発環境の場合
  if (env.NODE_ENV === "development") {
    return createDevDbClient();
  }

  // テスト環境の場合
  if (env.NODE_ENV === "test") {
    return createTestDbClient();
  }

  // デフォルトはテスト環境
  return createTestDbClient();
};
