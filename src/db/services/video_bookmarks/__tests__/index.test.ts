import { beforeEach, describe, expect, test } from "bun:test";
import { createTestDbClient } from "@/db/config/test-database";
import { authors } from "@/db/models/authors";
import { videoBookmarks } from "@/db/models/video_bookmarks";
import { videos } from "@/db/models/videos";
import { createVideoBookmarkService } from "@/db/services/video_bookmarks";
import { NotFoundError } from "@/db/utils/errors";
import { and, eq } from "drizzle-orm";

// 各テストで使用するテストデータ
const testAuthors = [
  {
    id: "author1",
    name: "テスト著者1",
    iconUrl: "https://example.com/icon1.png",
    bio: "テスト著者1の自己紹介",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "author2",
    name: "テスト著者2",
    iconUrl: "https://example.com/icon2.png",
    bio: "テスト著者2の自己紹介",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const testVideos = [
  {
    id: "video1",
    title: "テスト動画1",
    url: "https://example.com/video1",
    start: 0,
    end: 60,
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "video2",
    title: "テスト動画2",
    url: "https://example.com/video2",
    start: 10,
    end: 120,
    authorId: "author2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "video3",
    title: "テスト動画3",
    url: "https://example.com/video3",
    start: 5,
    end: 90,
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const testBookmarks = [
  {
    id: "bookmark1",
    authorId: "author1",
    videoId: "video2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "bookmark2",
    authorId: "author2",
    videoId: "video1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ヘルパー関数: データベースとサービスの初期化
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createVideoBookmarkService(dbClient);

  // テーブルをクリア
  await dbClient.delete(videoBookmarks).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(authors).run();

  // テストデータを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values(author);
  }

  for (const video of testVideos) {
    await dbClient.insert(videos).values(video);
  }

  for (const bookmark of testBookmarks) {
    await dbClient.insert(videoBookmarks).values(bookmark);
  }

  return { dbClient, service };
}

describe("videoBookmarkService", () => {
  describe("getBookmarksByAuthorId", () => {
    let service: ReturnType<typeof createVideoBookmarkService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("著者のブックマーク一覧を取得できること", async () => {
      const result = await service.getBookmarksByAuthorId("author1");

      // author1は video2 をブックマークしている
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("video2");
      expect(result[0].title).toBe("テスト動画2");
      expect(result[0].authorId).toBe("author2");
    });

    test("著者が実際に存在しブックマークも持っている場合のテスト", async () => {
      // author2は video1 をブックマークしている
      const result = await service.getBookmarksByAuthorId("author2");
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("video1");
    });

    test("ブックマークがない著者の場合は空配列を返すこと", async () => {
      // テスト用の新しい著者を追加（ブックマークなし）
      const dbClient = await createTestDbClient();
      await dbClient.insert(authors).values({
        id: "author3",
        name: "ブックマークなし著者",
        iconUrl: "https://example.com/icon3.png",
        bio: "ブックマークを持たない著者",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service = createVideoBookmarkService(dbClient);
      const result = await service.getBookmarksByAuthorId("author3");
      expect(result.length).toBe(0);
    });

    test("存在しない著者IDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.getBookmarksByAuthorId("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("getAuthorsByBookmarkedVideoId", () => {
    let service: ReturnType<typeof createVideoBookmarkService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("動画をブックマークした著者一覧を取得できること", async () => {
      const result = await service.getAuthorsByBookmarkedVideoId("video1");

      // video1をブックマークしているのはauthor2
      expect(result.length).toBe(1);
      expect(result[0]).toBe("author2");
    });

    test("ブックマークされていない動画の場合は空配列を返すこと", async () => {
      const result = await service.getAuthorsByBookmarkedVideoId("video3");
      expect(result.length).toBe(0);
    });

    test("存在しない動画IDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.getAuthorsByBookmarkedVideoId("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("createBookmark", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createVideoBookmarkService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("新しいブックマークを作成できること", async () => {
      // 新しい組み合わせでブックマークを作成
      const result = await service.createBookmark("author1", "video3");

      // 結果を確認
      expect(result.authorId).toBe("author1");
      expect(result.videoId).toBe("video3");
      expect(result.id).toBeDefined();

      // データベースに正しく保存されたか確認
      const savedBookmark = await dbClient
        .select()
        .from(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, "author1"), eq(videoBookmarks.videoId, "video3")))
        .get();

      expect(savedBookmark).toBeDefined();
      expect(savedBookmark?.authorId).toBe("author1");
      expect(savedBookmark?.videoId).toBe("video3");
    });

    test("既存のブックマークを作成しようとすると既存の情報を返すこと", async () => {
      // 既に存在する組み合わせでブックマークを作成
      const result = await service.createBookmark("author1", "video2");

      // 結果を確認（既存のブックマーク情報が返される）
      expect(result.authorId).toBe("author1");
      expect(result.videoId).toBe("video2");
      expect(result.id).toBe("bookmark1");

      // 重複したレコードが作成されていないことを確認
      const bookmarks = await dbClient
        .select()
        .from(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, "author1"), eq(videoBookmarks.videoId, "video2")))
        .all();

      expect(bookmarks.length).toBe(1);
    });

    test("存在しない著者IDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.createBookmark("non-existent", "video1");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("著者が見つかりません");
      }
      expect(errorThrown).toBe(true);
    });

    test("存在しない動画IDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.createBookmark("author1", "non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("動画が見つかりません");
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("deleteBookmark", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createVideoBookmarkService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("ブックマークを削除できること", async () => {
      // 削除前の状態を確認
      const beforeDelete = await dbClient
        .select()
        .from(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, "author1"), eq(videoBookmarks.videoId, "video2")))
        .get();
      expect(beforeDelete).toBeDefined();

      // ブックマークを削除
      await service.deleteBookmark("author1", "video2");

      // 削除後の状態を確認
      const afterDelete = await dbClient
        .select()
        .from(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, "author1"), eq(videoBookmarks.videoId, "video2")))
        .get();
      expect(afterDelete).toBeUndefined();
    });

    test("存在しないブックマークを削除しようとするとNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        // 存在しない組み合わせ
        await service.deleteBookmark("author1", "video1");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("ブックマークが見つかりません");
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("hasBookmarked", () => {
    let service: ReturnType<typeof createVideoBookmarkService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("ブックマークが存在する場合はtrueを返すこと", async () => {
      const result = await service.hasBookmarked("author1", "video2");
      expect(result).toBe(true);
    });

    test("ブックマークが存在しない場合はfalseを返すこと", async () => {
      const result = await service.hasBookmarked("author1", "video1");
      expect(result).toBe(false);
    });

    test("存在しない著者と動画の組み合わせでもエラーをスローせずfalseを返すこと", async () => {
      const result = await service.hasBookmarked("author1", "non-existent");
      expect(result).toBe(false);
    });
  });
});
