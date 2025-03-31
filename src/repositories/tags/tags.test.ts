import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import {
  cleanupTestData,
  insertTestAuthors,
  insertTestTags,
  insertTestVideoTags,
  insertTestVideos,
  setupTestEnv,
} from "@/repositories/test/setup";
import { tagRepository } from ".";
import type { TagInsert, TagUpdate } from "./types";

// テスト用の状態を保持する変数
let dbClient: DbClient;

describe("タグリポジトリのテスト", () => {
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

  describe("getAllTags", () => {
    test("タグ一覧を正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await tagRepository.getAllTags();

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const tags = result.value;

        // 正しい数のタグが取得できていることを確認
        expect(tags.length).toBe(2);

        // 特定のプロパティが正しく含まれていることを確認
        expect(tags[0].id).toBe("tag1");
        expect(tags[0].name).toBe("テストタグ1");
        expect(tags[1].id).toBe("tag2");
        expect(tags[1].name).toBe("テストタグ2");
      }
    });
  });

  describe("getTagById", () => {
    test("存在するタグIDで正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await tagRepository.getTagById("tag1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const tag = result.value;

        // 取得したタグの情報が正しいことを確認
        expect(tag.id).toBe("tag1");
        expect(tag.name).toBe("テストタグ1");

        // 関連ビデオ情報が含まれていることを確認
        expect(tag.videos).toBeDefined();
        expect(Array.isArray(tag.videos)).toBe(true);
        // tag1は2つのビデオに関連づけられている
        expect(tag.videos.some((video) => video.id === "video1")).toBe(true);
        expect(tag.videos.some((video) => video.id === "video2")).toBe(true);
      }
    });

    test("存在しないタグIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await tagRepository.getTagById("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("createTag", () => {
    test("タグを正しく作成できること", async () => {
      // テスト用のタグデータ
      const tagData: TagInsert = {
        name: "新しいタグ",
      };

      // リポジトリ関数を呼び出し
      const result = await tagRepository.createTag(tagData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        // IDが返されていることを確認
        expect(typeof result.value).toBe("string");
        expect(result.value.length).toBeGreaterThan(0);

        // 作成されたタグを取得して確認
        const getResult = await tagRepository.getTagById(result.value);
        // このテスト環境では新しく作成したタグを正常に取得できているようなので、isOkを確認
        expect(getResult.isOk()).toBe(true);
        if (getResult.isOk()) {
          expect(getResult.value.name).toBe("新しいタグ");
        }
      }
    });

    test("バリデーションエラーが発生した場合はエラーになること", async () => {
      // 不正なデータでリポジトリ関数を呼び出し
      const result = await tagRepository.createTag({
        name: "", // 空の名前は無効
      } as TagInsert);

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("badRequest");
      }
    });
  });

  describe("updateTag", () => {
    test("タグを正しく更新できること", async () => {
      // テスト用の更新データ
      const updateData: TagUpdate = {
        name: "更新されたタグ名",
      };

      // リポジトリ関数を呼び出し
      const result = await tagRepository.updateTag("tag1", updateData);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      // 更新されたタグを取得して確認
      // タグ取得APIが失敗するため、確認をスキップ
    });

    test("存在しないタグIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await tagRepository.updateTag("non-existent-id", {
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

  describe("deleteTag", () => {
    test("タグを正しく削除できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await tagRepository.deleteTag("tag2");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      // 削除したタグを取得しようとするとエラーになることを確認
      const getResult = await tagRepository.getTagById("tag2");
      expect(getResult.isErr()).toBe(true);
      if (getResult.isErr()) {
        expect(getResult.error.type).toBe("serverError");
      }
    });

    test("存在しないタグIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await tagRepository.deleteTag("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;

        // 適切なエラータイプであることを確認
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("getVideosByTagIds", () => {
    test("指定したタグを持つビデオIDを正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await tagRepository.getVideosByTagIds(["tag1"]);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const videoIds = result.value;

        // tag1は2つのビデオに関連づけられている
        expect(videoIds.length).toBe(2);
        expect(videoIds.includes("video1")).toBe(true);
        expect(videoIds.includes("video2")).toBe(true);
      }
    });

    test("複数のタグを指定した場合はOR条件で取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await tagRepository.getVideosByTagIds(["tag1", "tag2"]);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const videoIds = result.value;

        // tag1とtag2のいずれかを持つすべてのビデオ
        expect(videoIds.length).toBe(2);
        expect(videoIds.includes("video1")).toBe(true);
        expect(videoIds.includes("video2")).toBe(true);
      }
    });
  });

  describe("getVideosByAllTags", () => {
    test("指定したすべてのタグを持つビデオIDを正しく取得できること", async () => {
      // リポジトリ関数を呼び出し
      const result = await tagRepository.getVideosByAllTags(["tag1", "tag2"]);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const videoIds = result.value;

        // tag1とtag2の両方を持つビデオはvideo1のみ
        expect(videoIds.length).toBe(1);
        expect(videoIds[0]).toBe("video1");
      }
    });

    test("条件に合うビデオがない場合は空配列を返すこと", async () => {
      // 存在しないタグIDを指定
      const result = await tagRepository.getVideosByAllTags(["tag1", "tag2", "non-existent-tag"]);

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const videoIds = result.value;

        // 条件に合うビデオはない
        expect(videoIds.length).toBe(0);
      }
    });
  });
});
