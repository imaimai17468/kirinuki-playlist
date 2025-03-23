import { beforeEach, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { createTestDbClient } from "../../config/test-database";
import { authors } from "../../models/authors";
import { videos } from "../../models/videos";
import { NotFoundError } from "../../utils/errors";
import { createVideoService } from "./videos";

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
];

// 新規動画データ
const newVideo = {
  title: "新規動画",
  url: "https://example.com/new-video",
  start: 0,
  end: 90,
  authorId: "author1",
};

// ヘルパー関数: データベースとサービスの初期化
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createVideoService(dbClient);

  // テーブルをクリア
  await dbClient.delete(videos).run();
  await dbClient.delete(authors).run();

  // テストデータを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values(author);
  }

  for (const video of testVideos) {
    await dbClient.insert(videos).values(video);
  }

  return { dbClient, service };
}

describe("videoService", () => {
  describe("getAllVideos", () => {
    let service: ReturnType<typeof createVideoService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("全ての動画を取得できること", async () => {
      const result = await service.getAllVideos();

      // 件数を確認
      expect(result.length).toBe(2);

      // データの中身を確認（IDでソートして順序を保証）
      const sorted = result.sort((a, b) => a.id.localeCompare(b.id));
      expect(sorted[0].id).toBe("video1");
      expect(sorted[0].title).toBe("テスト動画1");
      expect(sorted[0].url).toBe("https://example.com/video1");
      expect(sorted[0].authorId).toBe("author1");
      expect(sorted[0].author.name).toBe("テスト著者1");

      expect(sorted[1].id).toBe("video2");
      expect(sorted[1].title).toBe("テスト動画2");
      expect(sorted[1].url).toBe("https://example.com/video2");
      expect(sorted[1].authorId).toBe("author2");
      expect(sorted[1].author.name).toBe("テスト著者2");
    });
  });

  describe("getVideoById", () => {
    let service: ReturnType<typeof createVideoService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("IDを指定して動画を取得できること", async () => {
      const result = await service.getVideoById("video1");

      expect(result.id).toBe("video1");
      expect(result.title).toBe("テスト動画1");
      expect(result.url).toBe("https://example.com/video1");
      expect(result.start).toBe(0);
      expect(result.end).toBe(60);
      expect(result.authorId).toBe("author1");
      expect(result.author.name).toBe("テスト著者1");
      expect(result.author.iconUrl).toBe("https://example.com/icon1.png");
    });

    test("存在しないIDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.getVideoById("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("createVideo", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createVideoService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("新しい動画を作成できること", async () => {
      // 動画を作成
      const id = await service.createVideo(newVideo);

      // IDが返されることを確認
      expect(id).toBeDefined();

      // 作成された動画を確認
      const createdVideo = await dbClient.select().from(videos).where(eq(videos.id, id)).get();

      expect(createdVideo).toBeDefined();
      expect(createdVideo?.title).toBe("新規動画");
      expect(createdVideo?.url).toBe("https://example.com/new-video");
      expect(createdVideo?.start).toBe(0);
      expect(createdVideo?.end).toBe(90);
      expect(createdVideo?.authorId).toBe("author1");
    });

    test("存在しない著者IDを指定するとNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.createVideo({
          title: "エラー動画",
          url: "https://example.com/error",
          start: 0,
          end: 30,
          authorId: "non-existent-author",
        });
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("著者が見つかりません");
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("updateVideo", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createVideoService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("動画を更新できること", async () => {
      const updateData = {
        title: "更新動画タイトル",
        start: 5,
        end: 65,
      };

      // 動画を更新
      await service.updateVideo("video1", updateData);

      // 更新された動画を確認
      const updatedVideo = await dbClient.select().from(videos).where(eq(videos.id, "video1")).get();

      expect(updatedVideo).toBeDefined();
      expect(updatedVideo?.title).toBe("更新動画タイトル");
      expect(updatedVideo?.start).toBe(5);
      expect(updatedVideo?.end).toBe(65);
      // 更新していないフィールドは変更されていないことを確認
      expect(updatedVideo?.url).toBe("https://example.com/video1");
      expect(updatedVideo?.authorId).toBe("author1");
    });

    test("存在しないIDの更新はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.updateVideo("non-existent", { title: "更新名" });
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("deleteVideo", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createVideoService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("動画を削除できること", async () => {
      // 削除前に存在確認
      const beforeDelete = await dbClient.select().from(videos).where(eq(videos.id, "video1")).get();
      expect(beforeDelete).toBeDefined();

      // 動画を削除
      await service.deleteVideo("video1");

      // 削除後に存在しないことを確認
      const afterDelete = await dbClient.select().from(videos).where(eq(videos.id, "video1")).get();
      expect(afterDelete).toBeUndefined();
    });

    test("存在しないIDの削除はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.deleteVideo("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });
});
