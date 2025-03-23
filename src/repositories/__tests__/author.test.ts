import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import { getAllAuthors, getAuthorById } from "../author";
import { cleanupTestData, insertTestAuthors, setupTestEnv } from "./setup";

// テスト用の状態を保持する変数
let dbClient: DbClient;

describe("著者リポジトリのテスト", () => {
  // 各テストの前に実行するセットアップ
  beforeEach(async () => {
    // テスト環境をセットアップ
    const env = await setupTestEnv();
    dbClient = env.dbClient;

    // テストデータを挿入
    await insertTestAuthors(dbClient);
  });

  // 各テストの後に実行するクリーンアップ
  afterEach(async () => {
    await cleanupTestData(dbClient);
  });

  describe("getAllAuthors", () => {
    it("著者一覧を正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getAllAuthors();

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const authors = result.value;

        // 正しい数の著者が取得できていることを確認
        expect(authors.length).toBe(2);

        // 特定のプロパティが正しく含まれていることを確認
        expect(authors[0].id).toBe("author1");
        expect(authors[0].name).toBe("テスト著者1");
        expect(authors[1].id).toBe("author2");
        expect(authors[1].name).toBe("テスト著者2");
      }
    });
  });

  describe("getAuthorById", () => {
    it("存在する著者IDで正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getAuthorById("author1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const author = result.value;

        // 取得した著者の情報が正しいことを確認
        expect(author.id).toBe("author1");
        expect(author.name).toBe("テスト著者1");
        expect(author.iconUrl).toBe("https://example.com/icon1.jpg");
        expect(author.bio).toBe("テスト著者1の説明");
      }
    });

    it("存在しない著者IDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await getAuthorById("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("serverError");
      }
    });
  });
});
