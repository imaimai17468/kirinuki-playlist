import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import { getAllPlaylists, getPlaylistById } from "../playlists";
import {
  cleanupTestData,
  insertTestAuthors,
  insertTestPlaylistVideos,
  insertTestPlaylists,
  insertTestVideos,
  setupTestEnv,
} from "./setup";

// テスト用の状態を保持する変数
let dbClient: DbClient;

describe("プレイリストリポジトリのテスト", () => {
  // 各テストの前に実行するセットアップ
  beforeEach(async () => {
    // テスト環境をセットアップ
    const env = await setupTestEnv();
    dbClient = env.dbClient;

    // テストデータを挿入
    await insertTestAuthors(dbClient);
    await insertTestVideos(dbClient);
    await insertTestPlaylists(dbClient);
    await insertTestPlaylistVideos(dbClient);
  });

  // 各テストの後に実行するクリーンアップ
  afterEach(async () => {
    await cleanupTestData(dbClient);
  });

  describe("getAllPlaylists", () => {
    it("プレイリスト一覧を正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getAllPlaylists();

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const playlists = result.value;

        // 正しい数のプレイリストが取得できていることを確認
        expect(playlists.length).toBe(2);

        // 特定のプロパティが正しく含まれていることを確認
        expect(playlists[0].id).toBe("playlist1");
        expect(playlists[0].title).toBe("テストプレイリスト1");
        expect(playlists[0].authorId).toBe("author1");

        expect(playlists[1].id).toBe("playlist2");
        expect(playlists[1].title).toBe("テストプレイリスト2");
        expect(playlists[1].authorId).toBe("author2");
      }
    });
  });

  describe("getPlaylistById", () => {
    it("存在するプレイリストIDで正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getPlaylistById("playlist1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const playlist = result.value;

        // 取得したプレイリストの情報が正しいことを確認
        expect(playlist.id).toBe("playlist1");
        expect(playlist.title).toBe("テストプレイリスト1");
        expect(playlist.authorId).toBe("author1");
      }
    });

    it("存在しないプレイリストIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await getPlaylistById("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("notFound");
      }
    });

    it("プレイリストに関連する動画と動画の作者情報が正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getPlaylistById("playlist1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const playlist = result.value;

        // プレイリスト情報を確認
        expect(playlist.id).toBe("playlist1");
        expect(playlist.title).toBe("テストプレイリスト1");

        // 動画情報があることを確認
        expect(playlist.videos).toBeDefined();
        expect(Array.isArray(playlist.videos)).toBe(true);
        expect(playlist.videos?.length).toBeGreaterThan(0);

        if (playlist.videos) {
          // 関連する動画の情報を確認
          const video1 = playlist.videos.find((v) => v.id === "video1");
          expect(video1).toBeDefined();

          if (video1) {
            expect(video1.title).toBe("テストビデオ1");
            expect(video1.url).toBe("https://example.com/video1");

            // 動画の作者情報を確認
            expect(video1.author).toBeDefined();
            if (video1.author) {
              expect(video1.author.id).toBe("author1");
              expect(video1.author.name).toBe("テスト著者1");
              expect(video1.author.iconUrl).toBe("https://example.com/icon1.jpg");
            }
          }

          // 複数の動画がある場合は2つ目の動画も確認
          const video2 = playlist.videos.find((v) => v.id === "video2");
          expect(video2).toBeDefined();

          if (video2) {
            expect(video2.title).toBe("テストビデオ2");
            expect(video2.author).toBeDefined();
            if (video2.author) {
              expect(video2.author.id).toBe("author2");
              expect(video2.author.name).toBe("テスト著者2");
            }
          }
        }
      }
    });
  });
});
