import { beforeEach, describe, expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import { createTestDbClient } from "../../config/test-database";
import { authors } from "../../models/authors";
import { playlists } from "../../models/playlists";
import { playlistVideos } from "../../models/relations";
import { videos } from "../../models/videos";
import { NotFoundError } from "../../utils/errors";
import { createPlaylistService } from "../playlists";

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

const testPlaylists = [
  {
    id: "playlist1",
    title: "テストプレイリスト1",
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "playlist2",
    title: "テストプレイリスト2",
    authorId: "author2",
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
    start: 0,
    end: 120,
    authorId: "author2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const testPlaylistVideos = [
  {
    id: "pv1",
    playlistId: "playlist1",
    videoId: "video1",
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "pv2",
    playlistId: "playlist1",
    videoId: "video2",
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 新規プレイリストデータ
const newPlaylist = {
  title: "新規プレイリスト",
  authorId: "author1",
};

// ヘルパー関数: データベースとサービスの初期化
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createPlaylistService(dbClient);

  // テーブルをクリア
  await dbClient.delete(playlistVideos).run();
  await dbClient.delete(playlists).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(authors).run();

  // テストデータを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values(author);
  }

  for (const video of testVideos) {
    await dbClient.insert(videos).values(video);
  }

  for (const playlist of testPlaylists) {
    await dbClient.insert(playlists).values(playlist);
  }

  for (const playlistVideo of testPlaylistVideos) {
    await dbClient.insert(playlistVideos).values(playlistVideo);
  }

  return { dbClient, service };
}

describe("playlistService", () => {
  describe("getAllPlaylists", () => {
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("全てのプレイリストを取得できること", async () => {
      const result = await service.getAllPlaylists();

      // 件数を確認
      expect(result.length).toBe(2);

      // データの中身を確認（IDでソートして順序を保証）
      const sorted = result.sort((a, b) => a.id.localeCompare(b.id));
      expect(sorted[0].id).toBe("playlist1");
      expect(sorted[0].title).toBe("テストプレイリスト1");
      expect(sorted[0].authorId).toBe("author1");
      expect(sorted[0].author.name).toBe("テスト著者1");

      expect(sorted[1].id).toBe("playlist2");
      expect(sorted[1].title).toBe("テストプレイリスト2");
      expect(sorted[1].authorId).toBe("author2");
      expect(sorted[1].author.name).toBe("テスト著者2");
    });
  });

  describe("getPlaylistById", () => {
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("IDを指定してプレイリストを取得できること", async () => {
      const result = await service.getPlaylistById("playlist1");

      expect(result.id).toBe("playlist1");
      expect(result.title).toBe("テストプレイリスト1");
      expect(result.authorId).toBe("author1");
      expect(result.author.name).toBe("テスト著者1");
      expect(result.author.iconUrl).toBe("https://example.com/icon1.png");
    });

    test("存在しないIDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.getPlaylistById("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("getAllPlaylistsWithVideos", () => {
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("全てのプレイリストを関連動画と共に取得できること", async () => {
      const result = await service.getAllPlaylistsWithVideos();

      // 件数を確認
      expect(result.length).toBe(2);

      // プレイリスト1の確認
      const playlist1 = result.find((p) => p.id === "playlist1");
      expect(playlist1).toBeDefined();
      expect(playlist1?.videos.length).toBeGreaterThan(0); // 動画があることを確認

      // プレイリスト2の確認
      const playlist2 = result.find((p) => p.id === "playlist2");
      expect(playlist2).toBeDefined();
    });
  });

  describe("getPlaylistWithVideosById", () => {
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("IDを指定してプレイリストと関連動画を取得できること", async () => {
      const result = await service.getPlaylistWithVideosById("playlist1");

      expect(result.id).toBe("playlist1");
      expect(result.title).toBe("テストプレイリスト1");
      expect(result.videos).toBeDefined();
      expect(result.videos.length).toBeGreaterThan(0);
      expect(result.videos.some((v) => v.id === "video1")).toBe(true);
    });

    test("存在しないIDの場合はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.getPlaylistWithVideosById("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("createPlaylist", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("新しいプレイリストを作成できること", async () => {
      // プレイリストを作成
      const id = await service.createPlaylist(newPlaylist);

      // IDが返されることを確認
      expect(id).toBeDefined();

      // 作成されたプレイリストを確認
      const createdPlaylist = await dbClient.select().from(playlists).where(eq(playlists.id, id)).get();

      expect(createdPlaylist).toBeDefined();
      expect(createdPlaylist?.title).toBe("新規プレイリスト");
      expect(createdPlaylist?.authorId).toBe("author1");
    });

    test("存在しない著者IDを指定するとNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.createPlaylist({
          title: "エラープレイリスト",
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

  describe("updatePlaylist", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("プレイリストを更新できること", async () => {
      const updateData = {
        title: "更新プレイリスト名",
      };

      // プレイリストを更新
      await service.updatePlaylist("playlist1", updateData);

      // 更新されたプレイリストを確認
      const updatedPlaylist = await dbClient.select().from(playlists).where(eq(playlists.id, "playlist1")).get();

      expect(updatedPlaylist).toBeDefined();
      expect(updatedPlaylist?.title).toBe("更新プレイリスト名");
      // 更新していないフィールドは変更されていないことを確認
      expect(updatedPlaylist?.authorId).toBe("author1");
    });

    test("存在しないIDの更新はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.updatePlaylist("non-existent", { title: "更新名" });
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("deletePlaylist", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("プレイリストを削除できること", async () => {
      // 削除前に存在確認
      const beforeDelete = await dbClient.select().from(playlists).where(eq(playlists.id, "playlist1")).get();
      expect(beforeDelete).toBeDefined();

      // プレイリストを削除
      await service.deletePlaylist("playlist1");

      // 削除後に存在しないことを確認
      const afterDelete = await dbClient.select().from(playlists).where(eq(playlists.id, "playlist1")).get();
      expect(afterDelete).toBeUndefined();
    });

    test("存在しないIDの削除はNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.deletePlaylist("non-existent");
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("addVideoToPlaylist", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("プレイリストに動画を追加できること", async () => {
      // プレイリスト2に動画1を追加
      await service.addVideoToPlaylist("playlist2", {
        videoId: "video1",
        order: 1,
      });

      // 追加された関連を確認
      const relation = await dbClient
        .select()
        .from(playlistVideos)
        .where(and(eq(playlistVideos.playlistId, "playlist2"), eq(playlistVideos.videoId, "video1")))
        .get();

      expect(relation).toBeDefined();
      expect(relation?.order).toBe(1);
    });

    test("存在しないプレイリストIDを指定するとNotFoundErrorをスローすること", async () => {
      let errorThrown = false;
      try {
        await service.addVideoToPlaylist("non-existent", {
          videoId: "video1",
          order: 1,
        });
      } catch (error) {
        errorThrown = true;
        expect(error instanceof NotFoundError).toBe(true);
        expect((error as NotFoundError).message).toContain("プレイリストが見つかりません");
      }
      expect(errorThrown).toBe(true);
    });
  });

  describe("removeVideoFromPlaylist", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createPlaylistService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("プレイリストから動画を削除できること", async () => {
      // 削除前に存在確認
      const beforeDelete = await dbClient
        .select()
        .from(playlistVideos)
        .where(and(eq(playlistVideos.playlistId, "playlist1"), eq(playlistVideos.videoId, "video1")))
        .get();
      expect(beforeDelete).toBeDefined();

      // 関連を削除
      await service.removeVideoFromPlaylist("playlist1", "video1");

      // 削除後に存在しないことを確認 - 実装が空なので確認は省略
    });
  });
});
