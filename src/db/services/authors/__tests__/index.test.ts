import { beforeEach, describe, expect, test } from "bun:test";
import { createTestDbClient } from "@/db/config/test-database";
import { authors } from "@/db/models/authors";
import { follows } from "@/db/models/follows";
import { playlistBookmarks } from "@/db/models/playlist_bookmarks";
import { playlists } from "@/db/models/playlists";
import { videoBookmarks } from "@/db/models/video_bookmarks";
import { videos } from "@/db/models/videos";
import { type Author, createAuthorService } from "@/db/services/authors";
import { createPlaylistService } from "@/db/services/playlists";
import { createVideoService } from "@/db/services/videos";
import { NotFoundError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";

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

// テスト用の動画データ
const testVideos = [
  {
    id: "video1",
    title: "テスト動画1",
    description: "テスト動画1の説明",
    url: "https://example.com/videos/1",
    thumbnailUrl: "https://example.com/thumbnails/1",
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
    start: 0, // videoモデルに必要なプロパティ
    end: 0, // videoモデルに必要なプロパティ
  },
  {
    id: "video2",
    title: "テスト動画2",
    description: "テスト動画2の説明",
    url: "https://example.com/videos/2",
    thumbnailUrl: "https://example.com/thumbnails/2",
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
    start: 0,
    end: 0,
  },
];

// テスト用のプレイリストデータ
const testPlaylists = [
  {
    id: "playlist1",
    title: "テストプレイリスト1",
    description: "テストプレイリスト1の説明",
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "playlist2",
    title: "テストプレイリスト2",
    description: "テストプレイリスト2の説明",
    authorId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// テスト用のフォローデータ
const testFollows = [
  {
    id: "follow1",
    followerId: "author2",
    followingId: "author1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// テスト用の動画ブックマークデータ
const testVideoBookmarks = [
  {
    id: "vbookmark1",
    authorId: "author1",
    videoId: "video2",
    createdAt: new Date(),
    updatedAt: new Date(), // 必須プロパティ
  },
];

// テスト用のプレイリストブックマークデータ
const testPlaylistBookmarks = [
  {
    id: "pbookmark1",
    authorId: "author1",
    playlistId: "playlist2",
    createdAt: new Date(),
    updatedAt: new Date(), // 必須プロパティ
  },
];

// ヘルパー関数: データベースとサービスの初期化
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createAuthorService(dbClient);
  const videoService = createVideoService(dbClient);
  const playlistService = createPlaylistService(dbClient);

  // テーブルをクリア
  await dbClient.delete(playlistBookmarks).run();
  await dbClient.delete(videoBookmarks).run();
  await dbClient.delete(playlists).run();
  await dbClient.delete(videos).run();
  await dbClient.delete(follows).run();
  await dbClient.delete(authors).run();

  // テストデータを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values({
      ...author,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 必要に応じて他のテストデータを挿入
  for (const video of testVideos) {
    await dbClient.insert(videos).values(video);
  }

  for (const playlist of testPlaylists) {
    await dbClient.insert(playlists).values(playlist);
  }

  for (const follow of testFollows) {
    await dbClient.insert(follows).values(follow);
  }

  for (const bookmark of testVideoBookmarks) {
    await dbClient.insert(videoBookmarks).values(bookmark);
  }

  for (const bookmark of testPlaylistBookmarks) {
    await dbClient.insert(playlistBookmarks).values(bookmark);
  }

  return { dbClient, service, videoService, playlistService };
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

  // カウント関連メソッドのテスト
  describe("カウント関連メソッド", () => {
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("getAllAuthorsWithCounts: 全著者のカウント情報を取得できること", async () => {
      const authors = await service.getAllAuthorsWithCounts();

      // 件数を確認
      expect(authors.length).toBe(2);

      // データの中身を確認（IDでソートして順序を保証）
      const sorted = authors.sort((a, b) => a.id.localeCompare(b.id));

      // author1 のカウント情報を確認
      expect(sorted[0].id).toBe("author1");
      expect(sorted[0].followerCount).toBe(1); // フォロワー1人
      expect(sorted[0].videoCount).toBe(2); // 動画2件
      expect(sorted[0].playlistCount).toBe(2); // プレイリスト2件

      // author2 のカウント情報を確認
      expect(sorted[1].id).toBe("author2");
      expect(sorted[1].followerCount).toBe(0); // フォロワー0人
      expect(sorted[1].videoCount).toBe(0); // 動画0件
      expect(sorted[1].playlistCount).toBe(0); // プレイリスト0件
    });

    test("getAuthorWithCounts: 特定著者のカウント情報を取得できること", async () => {
      const author = await service.getAuthorWithCounts("author1");

      expect(author.id).toBe("author1");
      expect(author.name).toBe("テスト著者1");
      expect(author.followerCount).toBe(1); // フォロワー1人
      expect(author.videoCount).toBe(2); // 動画2件
      expect(author.playlistCount).toBe(2); // プレイリスト2件
    });

    test("getAuthorWithCounts: 存在しないIDの場合はNotFoundErrorをスローすること", async () => {
      await expect(service.getAuthorWithCounts("non-existent")).rejects.toThrow(NotFoundError);
    });

    test("getAuthorWithVideosPlaylistsAndCounts: 著者の動画・プレイリスト・カウント情報を取得できること", async () => {
      const author = await service.getAuthorWithVideosPlaylistsAndCounts("author1");

      expect(author.id).toBe("author1");
      expect(author.name).toBe("テスト著者1");
      expect(author.followerCount).toBe(1); // フォロワー1人
      expect(author.videos.length).toBe(2); // 動画2件
      expect(author.playlists.length).toBe(2); // プレイリスト2件
      expect(author.videoCount).toBe(2); // 動画カウント2件
      expect(author.playlistCount).toBe(2); // プレイリストカウント2件
    });
  });

  // 関連データ取得メソッドのテスト
  describe("関連データ取得メソッド", () => {
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("getAuthorWithVideos: 著者に関連する動画を取得できること", async () => {
      const author = await service.getAuthorWithVideos("author1");

      expect(author.id).toBe("author1");
      expect(author.name).toBe("テスト著者1");
      expect(author.videos.length).toBe(2);
      expect(author.videos[0].id).toBeDefined();
      expect(author.videos[0].title).toBeDefined();
    });

    test("getAuthorWithPlaylists: 著者に関連するプレイリストを取得できること", async () => {
      const author = await service.getAuthorWithPlaylists("author1");

      expect(author.id).toBe("author1");
      expect(author.name).toBe("テスト著者1");
      expect(author.playlists.length).toBe(2);
      expect(author.playlists[0].id).toBeDefined();
      expect(author.playlists[0].title).toBeDefined();
    });

    test("getAuthorWithVideosAndPlaylists: 著者に関連する動画とプレイリストを取得できること", async () => {
      const author = await service.getAuthorWithVideosAndPlaylists("author1");

      expect(author.id).toBe("author1");
      expect(author.name).toBe("テスト著者1");
      expect(author.videos.length).toBe(2);
      expect(author.playlists.length).toBe(2);
    });

    test("getAuthorWithVideosPlaylistsAndBookmarks: 著者の情報とブックマークを全て取得できること", async () => {
      const author = await service.getAuthorWithVideosPlaylistsAndBookmarks("author1");

      expect(author.id).toBe("author1");
      expect(author.name).toBe("テスト著者1");
      expect(author.videos.length).toBe(2);
      expect(author.playlists.length).toBe(2);
      expect(author.bookmarkedVideos.length).toBeGreaterThanOrEqual(1);
      expect(author.bookmarkedPlaylists.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ブックマーク関連メソッドのテスト
  describe("ブックマーク関連メソッド", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createAuthorService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("getAuthorWithBookmarkedVideos: 著者がブックマークした動画を取得できること", async () => {
      const author = await service.getAuthorWithBookmarkedVideos("author1");

      expect(author.id).toBe("author1");
      expect(author.bookmarkedVideos.length).toBeGreaterThanOrEqual(1);
    });

    test("getAuthorWithBookmarkedPlaylists: 著者がブックマークしたプレイリストを取得できること", async () => {
      const author = await service.getAuthorWithBookmarkedPlaylists("author1");

      expect(author.id).toBe("author1");
      expect(author.bookmarkedPlaylists.length).toBeGreaterThanOrEqual(1);
    });

    test("bookmarkVideo: 動画をブックマークできること", async () => {
      // ブックマーク前に確認
      const hasBookmarkedBefore = await service.hasBookmarkedVideo("author2", "video1");
      expect(hasBookmarkedBefore).toBe(false);

      // ブックマーク
      await service.bookmarkVideo("author2", "video1");

      // ブックマーク後に確認
      const hasBookmarkedAfter = await service.hasBookmarkedVideo("author2", "video1");
      expect(hasBookmarkedAfter).toBe(true);
    });

    test("unbookmarkVideo: 動画のブックマークを解除できること", async () => {
      // 事前にブックマーク
      await dbClient.insert(videoBookmarks).values({
        id: "test-bookmark",
        authorId: "author2",
        videoId: "video1",
        createdAt: new Date(),
        updatedAt: new Date(), // 必須フィールド
      });

      // ブックマーク前に確認
      const hasBookmarkedBefore = await service.hasBookmarkedVideo("author2", "video1");
      expect(hasBookmarkedBefore).toBe(true);

      // ブックマーク解除
      await service.unbookmarkVideo("author2", "video1");

      // ブックマーク解除後に確認
      const hasBookmarkedAfter = await service.hasBookmarkedVideo("author2", "video1");
      expect(hasBookmarkedAfter).toBe(false);
    });

    test("bookmarkPlaylist: プレイリストをブックマークできること", async () => {
      // ブックマーク前に確認
      const hasBookmarkedBefore = await service.hasBookmarkedPlaylist("author2", "playlist1");
      expect(hasBookmarkedBefore).toBe(false);

      // ブックマーク
      await service.bookmarkPlaylist("author2", "playlist1");

      // ブックマーク後に確認
      const hasBookmarkedAfter = await service.hasBookmarkedPlaylist("author2", "playlist1");
      expect(hasBookmarkedAfter).toBe(true);
    });

    test("unbookmarkPlaylist: プレイリストのブックマークを解除できること", async () => {
      // 事前にブックマーク
      await dbClient.insert(playlistBookmarks).values({
        id: "test-bookmark",
        authorId: "author2",
        playlistId: "playlist1",
        createdAt: new Date(),
        updatedAt: new Date(), // 必須フィールド
      });

      // ブックマーク前に確認
      const hasBookmarkedBefore = await service.hasBookmarkedPlaylist("author2", "playlist1");
      expect(hasBookmarkedBefore).toBe(true);

      // ブックマーク解除
      await service.unbookmarkPlaylist("author2", "playlist1");

      // ブックマーク解除後に確認
      const hasBookmarkedAfter = await service.hasBookmarkedPlaylist("author2", "playlist1");
      expect(hasBookmarkedAfter).toBe(false);
    });

    test("hasBookmarkedVideo: 動画のブックマーク状態を確認できること", async () => {
      // author1 は video2 をブックマークしている
      const hasBookmarked1 = await service.hasBookmarkedVideo("author1", "video2");
      expect(hasBookmarked1).toBe(true);

      // author1 は video1 をブックマークしていない
      const hasBookmarked2 = await service.hasBookmarkedVideo("author1", "video1");
      expect(hasBookmarked2).toBe(false);
    });

    test("hasBookmarkedPlaylist: プレイリストのブックマーク状態を確認できること", async () => {
      // author1 は playlist2 をブックマークしている
      const hasBookmarked1 = await service.hasBookmarkedPlaylist("author1", "playlist2");
      expect(hasBookmarked1).toBe(true);

      // author1 は playlist1 をブックマークしていない
      const hasBookmarked2 = await service.hasBookmarkedPlaylist("author1", "playlist1");
      expect(hasBookmarked2).toBe(false);
    });
  });
});
