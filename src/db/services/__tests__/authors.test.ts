import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { createTestDbClient } from "../../config/test-database";
import { authors } from "../../models/authors";
import { NotFoundError } from "../../utils/errors";
import { type Author, createAuthorService } from "../authors";

// 各テストで使用するテストデータ
const testAuthors: Omit<Author, "createdAt" | "updatedAt">[] = [
  {
    id: "author1",
    name: "テスト著者1",
    iconUrl: "https://example.com/icon1.png",
    bio: "テスト著者1の自己紹介",
  },
  {
    id: "author2",
    name: "テスト著者2",
    iconUrl: "https://example.com/icon2.png",
    bio: "テスト著者2の自己紹介",
  },
];

// テスト用の新規著者データ
const newAuthor = {
  name: "新規著者",
  iconUrl: "https://example.com/new-icon.png",
  bio: "新規著者の自己紹介",
};

// ヘルパー関数: データベースとサービスの初期化
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createAuthorService(dbClient);

  // テーブルをクリア
  await dbClient.delete(authors).run();

  // テストデータを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values({
      ...author,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return { dbClient, service };
}

describe("authorService", () => {
  describe("getAllAuthors", () => {
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("全ての著者を取得できること", async () => {
      const result = await service.getAllAuthors();

      // 件数を確認
      expect(result.length).toBe(2);

      // データの中身を確認（IDでソートして順序を保証）
      const sorted = result.sort((a, b) => a.id.localeCompare(b.id));
      expect(sorted[0].id).toBe("author1");
      expect(sorted[0].name).toBe("テスト著者1");
      expect(sorted[1].id).toBe("author2");
      expect(sorted[1].name).toBe("テスト著者2");
    });
  });

  describe("getAuthorById", () => {
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("IDを指定して著者を取得できること", async () => {
      const result = await service.getAuthorById("author1");

      expect(result.id).toBe("author1");
      expect(result.name).toBe("テスト著者1");
      expect(result.iconUrl).toBe("https://example.com/icon1.png");
      expect(result.bio).toBe("テスト著者1の自己紹介");
    });

    test("存在しないIDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.getAuthorById("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("createAuthor", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("新しい著者を作成できること", async () => {
      // 著者を作成
      const id = await service.createAuthor(newAuthor);

      // IDが返されることを確認
      expect(id).toBeDefined();

      // 作成された著者を確認
      const createdAuthor = await dbClient.select().from(authors).where(eq(authors.id, id)).get();

      expect(createdAuthor).toBeDefined();
      expect(createdAuthor?.name).toBe("新規著者");
      expect(createdAuthor?.iconUrl).toBe("https://example.com/new-icon.png");
      expect(createdAuthor?.bio).toBe("新規著者の自己紹介");
    });
  });

  describe("updateAuthor", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("著者を更新できること", async () => {
      const updateData = {
        name: "更新著者名",
        bio: "更新された自己紹介",
      };

      // 著者を更新
      await service.updateAuthor("author1", updateData);

      // 更新された著者を確認
      const updatedAuthor = await dbClient.select().from(authors).where(eq(authors.id, "author1")).get();

      expect(updatedAuthor).toBeDefined();
      expect(updatedAuthor?.name).toBe("更新著者名");
      expect(updatedAuthor?.bio).toBe("更新された自己紹介");
      // 更新していないフィールドは変更されていないことを確認
      expect(updatedAuthor?.iconUrl).toBe("https://example.com/icon1.png");
    });

    test("存在しないIDの更新はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.updateAuthor("non-existent", { name: "更新名" });
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("deleteAuthor", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("著者を削除できること", async () => {
      // 削除前に存在確認
      const beforeDelete = await dbClient.select().from(authors).where(eq(authors.id, "author1")).get();
      expect(beforeDelete).toBeDefined();

      // 著者を削除
      await service.deleteAuthor("author1");

      // 削除後に存在しないことを確認
      const afterDelete = await dbClient.select().from(authors).where(eq(authors.id, "author1")).get();
      expect(afterDelete).toBeUndefined();
    });

    test("存在しないIDの削除はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.deleteAuthor("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });
});
