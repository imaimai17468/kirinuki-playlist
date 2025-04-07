import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import { cleanupTestData, insertTestAuthors, setupTestEnv } from "@/repositories/setup";
import { createAuthor, deleteAuthor, getAllAuthors, getAuthorById, updateAuthor } from "../authors";
import type { AuthorInsert, AuthorUpdate } from "./types";

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
        expect(authors.length).toBe(3);

        // 特定のプロパティが正しく含まれていることを確認
        expect(authors[0].id).toBe("author1");
        expect(authors[0].name).toBe("テスト著者1");
        expect(authors[1].id).toBe("author2");
        expect(authors[1].name).toBe("テスト著者2");
        expect(authors[2].id).toBe("author3");
        expect(authors[2].name).toBe("テスト著者3");
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

  describe("createAuthor", () => {
    it("著者を正しく作成できること", async () => {
      // テスト用の著者データ
      const authorData: AuthorInsert = {
        name: "新しい著者",
        iconUrl: "https://example.com/new-icon.jpg",
        bio: "新しい著者の説明",
      };

      // リポジトリ関数を呼び出し
      const result = await createAuthor(authorData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);
    });

    it("バリデーションエラーが発生した場合はエラーになること", async () => {
      // 不正なデータでリポジトリ関数を呼び出し
      const result = await createAuthor({
        name: "",
        iconUrl: "不正なURL",
      } as AuthorInsert);

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("badRequest");
      }
    });
  });

  describe("updateAuthor", () => {
    it("著者を正しく更新できること", async () => {
      // テスト用の更新データ
      const updateData: AuthorUpdate = {
        name: "更新された著者名",
        bio: "更新された説明",
      };

      // リポジトリ関数を呼び出し
      const result = await updateAuthor("author1", updateData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);
    });

    it("存在しない著者IDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await updateAuthor("non-existent-id", {
        name: "更新テスト",
      });

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("deleteAuthor", () => {
    it("著者を正しく削除できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await deleteAuthor("author1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);
    });

    it("存在しない著者IDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await deleteAuthor("non-existent-id");

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
