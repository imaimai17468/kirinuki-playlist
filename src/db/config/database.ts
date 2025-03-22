import type { D1Database } from "@cloudflare/workers-types";
import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/libsql";

/**
 * 本番環境用のデータベースクライアントを作成します
 * Cloudflare WorkersのD1データベースを使用
 */
export const createDbClient = (db: D1Database) => {
  return drizzle(db);
};

/**
 * 開発環境用のデータベースクライアントを作成します
 * Edge環境対応版 - マイグレーションなし
 * libsqlサーバーに接続
 * @param options 接続オプション
 */
export const createDevDbClient = async () => {
  // WebクライアントでlibsqlサーバーにHTTP接続
  const url = process.env.LIBSQL_URL || "http://localhost:8080";
  const client = createClient({
    url,
  });

  // Drizzle ORMのクライアントを作成 - マイグレーションなし
  return drizzleSqlite(client);
};
