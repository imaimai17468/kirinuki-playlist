import type { DbClient } from "@/db/config/hono";
import { authors, follows } from "@/db/models";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "@/db/utils/errors";
import { and, eq } from "drizzle-orm";

// ユーザー情報の型
export interface User {
  id: string;
  name: string;
  iconUrl: string;
}

// フォローサービスの作成関数
export const createFollowService = (dbClient: DbClient) => ({
  // ユーザーをフォローする
  async followUser(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new Error("自分自身をフォローすることはできません");
    }

    try {
      // 両方のユーザーが存在するか確認
      const follower = await dbClient.select().from(authors).where(eq(authors.id, followerId)).get();
      if (!follower) {
        throw new NotFoundError(`ID: ${followerId} のユーザーが見つかりません`);
      }

      const following = await dbClient.select().from(authors).where(eq(authors.id, followingId)).get();
      if (!following) {
        throw new NotFoundError(`ID: ${followingId} のユーザーが見つかりません`);
      }

      // すでにフォローしているか確認
      const existingFollow = await dbClient
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .get();

      if (existingFollow) {
        // すでにフォロー済みの場合は何もしない
        return;
      }

      // 現在の日時
      const now = new Date();

      // フォロー関係を作成
      await dbClient.insert(follows).values({
        followerId,
        followingId,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("すでにフォローしています");
        }
        throw new DatabaseError(`フォロー処理中にエラーが発生しました: ${error.message}`);
      }
      throw error;
    }
  },

  // フォローを解除する
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      // フォロー関係が存在するか確認
      const existingFollow = await dbClient
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .get();

      if (!existingFollow) {
        throw new NotFoundError("フォロー関係が見つかりません");
      }

      // フォロー関係を削除
      await dbClient
        .delete(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`フォロー解除中にエラーが発生しました: ${error.message}`);
      }
      throw error;
    }
  },

  // フォロワー一覧を取得
  async getFollowers(userId: string): Promise<User[]> {
    try {
      // ユーザーが存在するか確認
      const user = await dbClient.select().from(authors).where(eq(authors.id, userId)).get();
      if (!user) {
        throw new NotFoundError(`ID: ${userId} のユーザーが見つかりません`);
      }

      // このユーザーをフォローしているユーザー（フォロワー）を取得
      const result = await dbClient
        .select()
        .from(follows)
        .innerJoin(authors, eq(authors.id, follows.followerId))
        .where(eq(follows.followingId, userId))
        .all();

      // 結果をUser型に変換
      const followers: User[] = result.map((row) => ({
        id: row.authors.id,
        name: row.authors.name,
        iconUrl: row.authors.iconUrl,
      }));

      return followers;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`フォロワー取得中にエラーが発生しました: ${error.message}`);
      }
      throw error;
    }
  },

  // フォロー中のユーザー一覧を取得
  async getFollowing(userId: string): Promise<User[]> {
    try {
      // ユーザーが存在するか確認
      const user = await dbClient.select().from(authors).where(eq(authors.id, userId)).get();
      if (!user) {
        throw new NotFoundError(`ID: ${userId} のユーザーが見つかりません`);
      }

      // このユーザーがフォローしているユーザーを取得
      const result = await dbClient
        .select()
        .from(follows)
        .innerJoin(authors, eq(authors.id, follows.followingId))
        .where(eq(follows.followerId, userId))
        .all();

      // 結果をUser型に変換
      const following: User[] = result.map((row) => ({
        id: row.authors.id,
        name: row.authors.name,
        iconUrl: row.authors.iconUrl,
      }));

      return following;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`フォロー中ユーザー取得中にエラーが発生しました: ${error.message}`);
      }
      throw error;
    }
  },

  // フォロー関係を確認する
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
      const follow = await dbClient
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
        .get();

      return !!follow;
    } catch (error) {
      if (error instanceof Error) {
        throw new DatabaseError(`フォロー状態の確認中にエラーが発生しました: ${error.message}`);
      }
      throw error;
    }
  },
});
