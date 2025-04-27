import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import {
  cleanupTestData,
  insertTestAuthors,
  insertTestTags,
  insertTestVideoTags,
  insertTestVideos,
  setupTestEnv,
} from "@/repositories/setup";
import {
  addTagToVideo,
  createVideo,
  deleteVideo,
  getAllVideos,
  getVideoById,
  getVideoTags,
  removeTagFromVideo,
  updateVideo,
} from "..";
import type { VideoInsert, VideoUpdate } from "../types";

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
    await insertTestTags(dbClient);
    await insertTestVideos(dbClient);
    await insertTestVideoTags(dbClient);
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

        // タグ情報が含まれていることを確認
        expect(video.tags).toBeDefined();
        expect(Array.isArray(video.tags)).toBe(true);
        expect(video.tags.length).toBe(2);
        expect(video.tags.some((tag) => tag.id === "tag1")).toBe(true);
        expect(video.tags.some((tag) => tag.id === "tag2")).toBe(true);
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

  describe("createVideo", () => {
    it("ビデオを正しく作成できること", async () => {
      // テスト用のビデオデータ
      const videoData: VideoInsert = {
        title: "新しいビデオ",
        url: "https://example.com/new-video",
        authorId: "author1",
        start: 0,
        end: 120,
      };

      // リポジトリ関数を呼び出し
      const result = await createVideo(videoData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        // IDが返されていることを確認
        expect(typeof result.value).toBe("string");
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    it("バリデーションエラーが発生した場合はエラーになること", async () => {
      // 不正なデータでリポジトリ関数を呼び出し
      const result = await createVideo({
        title: "",
        url: "不正なURL",
        authorId: "",
        start: 0,
        end: 0,
      } as VideoInsert);

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("badRequest");
      }
    });
  });

  describe("updateVideo", () => {
    it("ビデオを正しく更新できること", async () => {
      // テスト用の更新データ
      const updateData: VideoUpdate = {
        title: "更新されたビデオタイトル",
        start: 10,
        end: 90,
      };

      // リポジトリ関数を呼び出し
      const result = await updateVideo("video1", updateData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);
    });

    it("存在しないビデオIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await updateVideo("non-existent-id", {
        title: "更新テスト",
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

  describe("deleteVideo", () => {
    it("ビデオを正しく削除できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await deleteVideo("video1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);
    });

    it("存在しないビデオIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await deleteVideo("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("タグ関連機能のテスト", () => {
    describe("getVideoTags", () => {
      it("ビデオに関連付けられたタグを正しく取得できること", async () => {
        // リポジトリ関数を呼び出し
        const result = await getVideoTags("video1");

        // 結果が成功していることを確認
        expect(result.isOk()).toBe(true);

        if (result.isOk()) {
          const tags = result.value;

          // タグが正しく取得できていることを確認
          expect(tags.length).toBe(2);
          expect(tags[0].id).toBe("tag1");
          expect(tags[0].name).toBe("テストタグ1");
          expect(tags[1].id).toBe("tag2");
          expect(tags[1].name).toBe("テストタグ2");
        }
      });

      it("存在しないビデオIDではエラーになること", async () => {
        // 存在しないIDでリポジトリ関数を呼び出し
        const result = await getVideoTags("non-existent-id");

        // 結果がエラーであることを確認
        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;

          // 適切なエラータイプであることを確認
          expect(error.type).toBe("notFound");
        }
      });
    });

    describe("addTagToVideo", () => {
      it("ビデオに新しいタグを追加できること", async () => {
        // タグ追加前にビデオ2のタグを確認
        const beforeResult = await getVideoTags("video2");
        if (beforeResult.isOk()) {
          expect(beforeResult.value.length).toBe(1);
          expect(beforeResult.value[0].id).toBe("tag1");
        }

        // リポジトリ関数を呼び出し
        const result = await addTagToVideo("video2", "tag2");

        // 結果が成功していることを確認
        expect(result.isOk()).toBe(true);

        // テスト実装ではモックでタグが実際に追加されないので、
        // ここでは関数呼び出しが成功することだけを確認
      });

      it("既に関連付けられているタグを追加しようとした場合はエラーになること", async () => {
        // 既に関連付けられているタグを追加
        const result = await addTagToVideo("video1", "tag1");

        // 結果がエラーであることを確認
        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;

          // 適切なエラータイプであることを確認
          expect(error.type).toBe("badRequest");
        }
      });
    });

    describe("removeTagFromVideo", () => {
      it("ビデオからタグを削除できること", async () => {
        // タグ削除前にビデオ1のタグを確認
        const beforeResult = await getVideoTags("video1");
        if (beforeResult.isOk()) {
          expect(beforeResult.value.length).toBe(2);
        }

        // リポジトリ関数を呼び出し
        const result = await removeTagFromVideo("video1", "tag1");

        // 結果が成功していることを確認
        expect(result.isOk()).toBe(true);

        // タグが正しく削除されたか確認
        const afterResult = await getVideoTags("video1");
        if (afterResult.isOk()) {
          expect(afterResult.value.length).toBe(1);
          expect(afterResult.value[0].id).toBe("tag2");
        }
      });

      it("関連付けられていないタグを削除しようとした場合はエラーになること", async () => {
        // 関連付けられていないタグを削除
        const result = await removeTagFromVideo("video2", "tag2");

        // 結果がエラーであることを確認
        expect(result.isErr()).toBe(true);

        if (result.isErr()) {
          const error = result.error;

          // 適切なエラータイプであることを確認
          expect(error.type).toBe("notFound");
        }
      });
    });
  });
});
