import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import { cleanupTestData, insertTestAuthors, insertTestVideos, setupTestEnv } from "@/repositories/test/setup";
import { getAllVideos, getVideoById } from "../videos";

// テスト用の状態を保持する変数
let dbClient: DbClient;

describe("ビデオリポジトリのテスト", () => {
  // 各テストの前に実行するセットアップ
  beforeEach(async () => {
    // テスト環境をセットアップ
    const env = await setupTestEnv();
    dbClient = env.dbClient;

    // テストデータを挿入
    await insertTestAuthors(dbClient);
    await insertTestVideos(dbClient);
  });

  // 各テストの後に実行するクリーンアップ
  afterEach(async () => {
    await cleanupTestData(dbClient);
  });

  describe("getAllVideos", () => {
    it("ビデオ一覧を正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getAllVideos();

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const videos = result.value;

        // 正しい数のビデオが取得できていることを確認
        expect(videos.length).toBe(2);

        // 特定のプロパティが正しく含まれていることを確認
        expect(videos[0].id).toBe("video1");
        expect(videos[0].title).toBe("テストビデオ1");
        expect(videos[0].url).toBe("https://example.com/video1");
        expect(videos[0].authorId).toBe("author1");

        expect(videos[1].id).toBe("video2");
        expect(videos[1].title).toBe("テストビデオ2");
        expect(videos[1].url).toBe("https://example.com/video2");
        expect(videos[1].authorId).toBe("author2");
      }
    });
  });

  describe("getVideoById", () => {
    it("存在するビデオIDで正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await getVideoById("video1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const video = result.value;

        // 取得したビデオの情報が正しいことを確認
        expect(video.id).toBe("video1");
        expect(video.title).toBe("テストビデオ1");
        expect(video.url).toBe("https://example.com/video1");
        expect(video.start).toBe(0);
        expect(video.end).toBe(60);
        expect(video.authorId).toBe("author1");
      }
    });

    it("存在しないビデオIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await getVideoById("non-existent-id");

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
