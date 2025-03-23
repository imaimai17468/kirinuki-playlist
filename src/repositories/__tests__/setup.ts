import { setApiClient } from "@/db/config/client";
import { createHonoApp } from "@/db/config/hono";
import type { DbClient } from "@/db/config/hono";
import { createTestDbClient } from "@/db/config/test-database";
import { authors } from "@/db/models/authors";
import { testClient } from "hono/testing";

/**
 * リポジトリテスト用の環境をセットアップする
 * - テスト用DBクライアントとHonoアプリ作成
 * - 必要なテストデータの挿入
 * - APIクライアントにtestClientをセット
 */
export async function setupTestEnv() {
  // テスト用のDBクライアントを作成
  const dbClient = await createTestDbClient();

  // テスト用Honoアプリを作成
  const app = createHonoApp({
    dbClient,
  });

  // テスト用クライアントを作成
  const client = testClient(app);

  // 全てのテストデータをクリア
  await dbClient.delete(authors).run();

  // APIクライアントを設定
  setApiClient(client);

  return {
    dbClient,
    app,
    client,
  };
}

/**
 * テストデータを挿入する
 */
export async function insertTestAuthors(dbClient: DbClient) {
  // テスト著者データ
  const testAuthors = [
    {
      id: "author1",
      name: "テスト著者1",
      iconUrl: "https://example.com/icon1.jpg",
      bio: "テスト著者1の説明",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "author2",
      name: "テスト著者2",
      iconUrl: "https://example.com/icon2.jpg",
      bio: "テスト著者2の説明",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // 著者データを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values(author);
  }

  return testAuthors;
}

/**
 * テスト実行後のクリーンアップ
 */
export async function cleanupTestData(dbClient: DbClient) {
  await dbClient.delete(authors).run();
}
