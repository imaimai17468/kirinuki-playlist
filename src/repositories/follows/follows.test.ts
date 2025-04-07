import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { DbClient } from "@/db/config/hono";
import { cleanupTestData, insertTestAuthors, insertTestFollows, setupTestEnv } from "@/repositories/test/setup";
import { followUser, getUserFollowers, getUserFollowing, isFollowing, unfollowUser } from "../follows";

// テスト用の状態を保持する変数
let dbClient: DbClient;

describe("フォローリポジトリのテスト", () => {
  // 各テストの前に実行するセットアップ
  beforeEach(async () => {
    // テスト環境をセットアップ
    const env = await setupTestEnv();
    dbClient = env.dbClient;

    // テストデータを挿入（著者データとフォロー関係）
    await insertTestAuthors(dbClient);
    await insertTestFollows(dbClient);
  });

  // 各テストの後に実行するクリーンアップ
  afterEach(async () => {
    await cleanupTestData(dbClient);
  });

  describe("followUser", () => {
    it("ユーザーを正しくフォローできること", async () => {
      // author1がまだフォローしていないauthor3をフォロー
      const result = await followUser("author3");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);
    });

    it("すでにフォロー済みの場合もエラーにならないこと", async () => {
      // author1はすでにauthor2をフォロー済み
      const result = await followUser("author2");

      // 結果が成功していることを確認（冪等性）
      expect(result.isOk()).toBe(true);
    });

    it("存在しないユーザーIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await followUser("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("unfollowUser", () => {
    it("ユーザーのフォローを正しく解除できること", async () => {
      // author1がフォロー中のauthor2のフォローを解除
      const result = await unfollowUser("author2");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);
    });

    it("存在しないユーザーIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await unfollowUser("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("serverError");
      }
    });

    it("フォローしていないユーザーのフォロー解除はエラーになること", async () => {
      // フォローしていないユーザーのフォロー解除を試みる
      const result = await unfollowUser("author3");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("getUserFollowers", () => {
    it("ユーザーのフォロワー一覧を正しく取得できること", async () => {
      // author1のフォロワーを取得（author2がフォローしているはず）
      const result = await getUserFollowers("author1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const followers = result.value;

        // 正しい数のフォロワーが取得できていることを確認
        expect(followers.length).toBe(1);

        // フォロワーの情報が正しいことを確認
        expect(followers[0].id).toBe("author2");
        expect(followers[0].name).toBe("テスト著者2");
      }
    });

    it("フォロワーがいないユーザーは空配列を返すこと", async () => {
      // フォロワーがいないユーザー（author3）のフォロワーを取得
      const result = await getUserFollowers("author3");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const followers = result.value;
        // 空配列が返されることを確認
        expect(followers.length).toBe(0);
      }
    });

    it("存在しないユーザーIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await getUserFollowers("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("getUserFollowing", () => {
    it("ユーザーがフォロー中のユーザー一覧を正しく取得できること", async () => {
      // author1がフォロー中のユーザーを取得
      const result = await getUserFollowing("author1");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const following = result.value;

        // 正しい数のフォロー中ユーザーが取得できていることを確認
        expect(following.length).toBe(1);

        // フォロー中ユーザーの情報が正しいことを確認
        expect(following[0].id).toBe("author2");
        expect(following[0].name).toBe("テスト著者2");
      }
    });

    it("フォロー中のユーザーがいない場合は空配列を返すこと", async () => {
      // フォロー中ユーザーがいないユーザー（author3）の情報を取得
      const result = await getUserFollowing("author3");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        const following = result.value;
        // 空配列が返されることを確認
        expect(following.length).toBe(0);
      }
    });

    it("存在しないユーザーIDではエラーになること", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await getUserFollowing("non-existent-id");

      // 結果がエラーであることを確認
      expect(result.isErr()).toBe(true);

      if (result.isErr()) {
        const error = result.error;
        expect(error.type).toBe("serverError");
      }
    });
  });

  describe("isFollowing", () => {
    it("フォロー関係がある場合はtrueを返すこと", async () => {
      // author1はauthor2をフォロー中
      const result = await isFollowing("author2");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe(true);
      }
    });

    it("フォロー関係がない場合はfalseを返すこと", async () => {
      // author1はauthor3をフォローしていない
      const result = await isFollowing("author3");

      // 結果が成功していることを確認
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe(false);
      }
    });

    it("存在しないユーザーIDに対してもfalseを返すこと", async () => {
      // 存在しないIDでリポジトリ関数を呼び出し
      const result = await isFollowing("non-existent-id");

      // 存在しなくてもAPIは成功し、フォロー関係なしと判断される
      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toBe(false);
      }
    });
  });
});
