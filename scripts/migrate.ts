import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

/**
 * libsqlサーバーに対してマイグレーションを実行
 * サーバーモードでのマイグレーション（開発環境用）
 * @param url libsqlサーバーのURL
 * @param migrationsPath マイグレーションフォルダのパス
 */
async function runMigrationWithLibSqlServer(url: string, migrationsPath = "./drizzle") {
  console.log(`[libsql-server] ${url}にマイグレーションを実行中...`);
  const client = createClient({
    url,
  });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: migrationsPath });
  console.log("[libsql-server] マイグレーション完了");
}

async function main() {
  try {
    const url = process.env.LIBSQL_URL || "http://localhost:8080";
    await runMigrationWithLibSqlServer(url);
  } catch (error) {
    console.error("マイグレーション中にエラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合のみmain()を呼び出す
if (require.main === module) {
  main().catch(console.error);
}

// 他のファイルからインポートできるようにエクスポート
export { runMigrationWithLibSqlServer };
