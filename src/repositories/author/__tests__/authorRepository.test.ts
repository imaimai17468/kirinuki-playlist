import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { authors } from "../../../db/models/authors";
import { cleanupTestRepository, createTestAuthor, setupTestRepository } from "../../testUtils";
import { authorRepository } from "../authorRepository";

describe("authorRepository", () => {
  let db: Awaited<ReturnType<typeof setupTestRepository>>["db"];

  beforeEach(async () => {
    // テスト用データベースをセットアップ
    const setup = await setupTestRepository();
    db = setup.db;
  });

  afterEach(async () => {
    // テスト後のクリーンアップ
    await cleanupTestRepository(db);
  });

  describe("findAll", () => {
    it("全ての著者を取得できること", async () => {
      // テストデータを準備
      const author1 = createTestAuthor({ name: "著者1" });
      const author2 = createTestAuthor({ name: "著者2" });

      // データをデータベースに挿入
      await db.insert(authors).values([author1, author2]);

      // テスト対象の関数を実行
      const result = await authorRepository.findAll(db);

      // 結果を検証
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const authorsResult = result.value;
        expect(authorsResult).toHaveLength(2);
        expect(authorsResult.map((a: { name: string }) => a.name)).toContain("著者1");
        expect(authorsResult.map((a: { name: string }) => a.name)).toContain("著者2");
      }
    });

    it("データベースエラーが発生した場合はエラーを返すこと", async () => {
      // DBクライアントをモックしてエラーをシミュレート
      const mockDb = {
        ...db,
        select: () => {
          throw new Error("データベースエラー");
        },
      } as unknown as typeof db;

      // テスト対象の関数を実行
      const result = await authorRepository.findAll(mockDb);

      // 結果を検証
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("serverError");
      }
    });
  });

  describe("findById", () => {
    it("IDで著者を取得できること", async () => {
      // テストデータを準備
      const author = createTestAuthor({ name: "テスト著者" });

      // データをデータベースに挿入
      await db.insert(authors).values(author);

      // テスト対象の関数を実行
      const result = await authorRepository.findById(db, author.id);

      // 結果を検証
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(author.id);
        expect(result.value.name).toBe("テスト著者");
      }
    });

    it("存在しないIDの場合はNotFoundエラーを返すこと", async () => {
      // テスト対象の関数を実行
      const result = await authorRepository.findById(db, "non-existent-id");

      // 結果を検証
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("notFound");
      }
    });
  });

  describe("create", () => {
    it("新しい著者を作成できること", async () => {
      // 新しい著者データ
      const newAuthor = {
        name: "新しい著者",
        iconUrl: "https://example.com/new-icon.png",
        bio: "新しい著者の紹介文",
      };

      // テスト対象の関数を実行
      const result = await authorRepository.create(db, newAuthor);

      // 結果を検証
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const authorId = result.value;
        expect(authorId).toBeDefined();

        // データベースから取得して検証
        const findResult = await authorRepository.findById(db, authorId);
        expect(findResult.isOk()).toBe(true);
        if (findResult.isOk()) {
          const savedAuthor = findResult.value;
          expect(savedAuthor.name).toBe("新しい著者");
          expect(savedAuthor.iconUrl).toBe("https://example.com/new-icon.png");
          expect(savedAuthor.bio).toBe("新しい著者の紹介文");
        }
      }
    });
  });

  describe("update", () => {
    it("著者情報を更新できること", async () => {
      // テストデータを準備
      const author = createTestAuthor({ name: "更新前" });

      // データをデータベースに挿入
      await db.insert(authors).values(author);

      // 更新データ
      const updateData = {
        name: "更新後",
        bio: "更新された紹介文",
      };

      // テスト対象の関数を実行
      const result = await authorRepository.update(db, author.id, updateData);

      // 結果を検証
      expect(result.isOk()).toBe(true);

      // データベースから取得して検証
      const findResult = await authorRepository.findById(db, author.id);
      expect(findResult.isOk()).toBe(true);
      if (findResult.isOk()) {
        const updatedAuthor = findResult.value;
        expect(updatedAuthor.name).toBe("更新後");
        expect(updatedAuthor.bio).toBe("更新された紹介文");
        // 更新していない項目は元の値が保持されていること
        expect(updatedAuthor.iconUrl).toBe(author.iconUrl);
      }
    });

    it("存在しないIDの場合はNotFoundエラーを返すこと", async () => {
      // テスト対象の関数を実行
      const result = await authorRepository.update(db, "non-existent-id", {
        name: "更新されない",
      });

      // 結果を検証
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("notFound");
      }
    });
  });

  describe("delete", () => {
    it("著者を削除できること", async () => {
      // テストデータを準備
      const author = createTestAuthor();

      // データをデータベースに挿入
      await db.insert(authors).values(author);

      // テスト対象の関数を実行
      const result = await authorRepository.delete(db, author.id);

      // 結果を検証
      expect(result.isOk()).toBe(true);

      // 削除されたことを確認
      const findResult = await authorRepository.findById(db, author.id);
      expect(findResult.isErr()).toBe(true);
      if (findResult.isErr()) {
        expect(findResult.error.type).toBe("notFound");
      }
    });

    it("存在しないIDの場合はNotFoundエラーを返すこと", async () => {
      // テスト対象の関数を実行
      const result = await authorRepository.delete(db, "non-existent-id");

      // 結果を検証
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("notFound");
      }
    });
  });
});
