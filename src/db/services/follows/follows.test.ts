import { beforeEach, describe, expect, test } from "bun:test";
import { and, count, eq } from "drizzle-orm";
import { createTestDbClient } from "../../config/test-database";
import { authors } from "../../models/authors";
import { follows } from "../../models/follows";
import { NotFoundError } from "../../utils/errors";
import { createFollowService } from "./follows";

// 各テストで使用するテストデータ
const testAuthors = [
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
  {
    id: "author3",
    name: "テスト著者3",
    iconUrl: "https://example.com/icon3.png",
    bio: "テスト著者3の自己紹介",
  },
];

// ヘルパー関数: データベースとサービスの初期化
async function setupDatabase() {
  const dbClient = await createTestDbClient();
  const service = createFollowService(dbClient);

  // テーブルをクリア
  await dbClient.delete(follows).run();
  await dbClient.delete(authors).run();

  // テスト用著者データを挿入
  for (const author of testAuthors) {
    await dbClient.insert(authors).values({
      ...author,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // テスト用フォロー関係を挿入
  await dbClient.insert(follows).values({
    followerId: "author1",
    followingId: "author2",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { dbClient, service };
}

describe("followService", () => {
  describe("followUser", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createFollowService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("ユーザーをフォローできること", async () => {
      // author1がauthor3をフォロー
      await service.followUser("author1", "author3");

      // フォロー関係が作成されたことを確認
      const result = await dbClient
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, "author1"), eq(follows.followingId, "author3")))
        .get();

      expect(result).toBeDefined();
      expect(result?.followerId).toBe("author1");
      expect(result?.followingId).toBe("author3");
    });

    test("既にフォローしている場合は何もしないこと", async () => {
      // author1はすでにauthor2をフォロー済み
      await service.followUser("author1", "author2");

      // フォロー関係の数が変わっていないことを確認
      const result = await dbClient
        .select({ value: count() })
        .from(follows)
        .where(and(eq(follows.followerId, "author1"), eq(follows.followingId, "author2")))
        .get();

      expect(Number(result?.value)).toBe(1);
    });

    test("自分自身をフォローできないこと", async () => {
      let error: Error | undefined;
      try {
        await service.followUser("author1", "author1");
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error?.message).toBe("自分自身をフォローすることはできません");
    });

    test("存在しないユーザーをフォローするとNotFoundErrorが発生すること", async () => {
      let error: Error | undefined;
      try {
        await service.followUser("author1", "non-existent");
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe("unfollowUser", () => {
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;
    let service: ReturnType<typeof createFollowService>;

    beforeEach(async () => {
      ({ dbClient, service } = await setupDatabase());
    });

    test("フォローを解除できること", async () => {
      // フォロー解除前に関係が存在することを確認
      const beforeUnfollow = await dbClient
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, "author1"), eq(follows.followingId, "author2")))
        .get();
      expect(beforeUnfollow).toBeDefined();

      // フォロー解除実行
      await service.unfollowUser("author1", "author2");

      // フォロー関係が削除されたことを確認
      const afterUnfollow = await dbClient
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, "author1"), eq(follows.followingId, "author2")))
        .get();
      expect(afterUnfollow).toBeUndefined();
    });

    test("フォローしていないユーザーのフォロー解除でNotFoundErrorが発生すること", async () => {
      let error: Error | undefined;
      try {
        await service.unfollowUser("author2", "author3");
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error?.message).toBe("フォロー関係が見つかりません");
    });
  });

  describe("getFollowers", () => {
    let service: ReturnType<typeof createFollowService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;

      // author3がauthor2をフォロー（追加のテストデータ）
      await result.dbClient.insert(follows).values({
        followerId: "author3",
        followingId: "author2",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    test("フォロワー一覧を取得できること", async () => {
      // author2のフォロワーを取得（author1とauthor3がフォローしている）
      const followers = await service.getFollowers("author2");

      // フォロワーが2人いることを確認
      expect(followers.length).toBe(2);

      // IDでソートして順序を保証
      const sorted = followers.sort((a, b) => a.id.localeCompare(b.id));

      // フォロワーの情報が正しいことを確認
      expect(sorted[0].id).toBe("author1");
      expect(sorted[0].name).toBe("テスト著者1");
      expect(sorted[1].id).toBe("author3");
      expect(sorted[1].name).toBe("テスト著者3");
    });

    test("フォロワーがいない場合は空配列を返すこと", async () => {
      // author3にはフォロワーがいない
      const followers = await service.getFollowers("author3");
      expect(followers).toEqual([]);
    });

    test("存在しないユーザーのフォロワー取得でNotFoundErrorが発生すること", async () => {
      let error: Error | undefined;
      try {
        await service.getFollowers("non-existent");
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe("getFollowing", () => {
    let service: ReturnType<typeof createFollowService>;
    let dbClient: Awaited<ReturnType<typeof createTestDbClient>>;

    beforeEach(async () => {
      ({ service, dbClient } = await setupDatabase());

      // author2がauthor3をフォロー（追加のテストデータ）
      await dbClient.insert(follows).values({
        followerId: "author2",
        followingId: "author3",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    test("フォロー中ユーザー一覧を取得できること", async () => {
      // author2がフォローしているユーザーを取得（author3のみ）
      const following = await service.getFollowing("author2");

      // フォロー中が1人であることを確認
      expect(following.length).toBe(1);

      // フォロー中ユーザーの情報が正しいことを確認
      expect(following[0].id).toBe("author3");
      expect(following[0].name).toBe("テスト著者3");
    });

    test("フォローしているユーザーがいない場合は空配列を返すこと", async () => {
      // author3は誰もフォローしていない
      const following = await service.getFollowing("author3");
      expect(following).toEqual([]);
    });

    test("存在しないユーザーのフォロー中取得でNotFoundErrorが発生すること", async () => {
      let error: Error | undefined;
      try {
        await service.getFollowing("non-existent");
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe("isFollowing", () => {
    let service: ReturnType<typeof createFollowService>;

    beforeEach(async () => {
      const result = await setupDatabase();
      service = result.service;
    });

    test("フォロー関係が存在する場合はtrueを返すこと", async () => {
      // author1はauthor2をフォロー中
      const result = await service.isFollowing("author1", "author2");
      expect(result).toBe(true);
    });

    test("フォロー関係が存在しない場合はfalseを返すこと", async () => {
      // author2はauthor1をフォローしていない
      const result = await service.isFollowing("author2", "author1");
      expect(result).toBe(false);
    });

    test("存在しないユーザーの場合もfalseを返すこと", async () => {
      const result = await service.isFollowing("author1", "non-existent");
      expect(result).toBe(false);
    });
  });
});
