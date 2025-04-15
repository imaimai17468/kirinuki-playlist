import type { DbClient } from "@/db/config/hono";
import { authors, follows, playlists, videos } from "@/db/models";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "@/db/utils/errors";
import { and, eq } from "drizzle-orm";

// ユーザー情報の型（UserCardコンポーネントと互換性を持つ）
export interface User {
  id: string;
  name: string;
  iconUrl: string;
  createdAt?: Date;
  bio?: string | null;
  followerCount?: number;
  videoCount?: number;
  playlistCount?: number;
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

      // 結果をUser型に変換して拡張情報を追加
      const followers = await Promise.all(
        result.map(async (row) => {
          const authorId = row.authors.id;

          // 動画数を取得
          const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, authorId)).all();
          const videoCount = authorVideos.length;

          // プレイリスト数を取得
          const authorPlaylists = await dbClient.select().from(playlists).where(eq(playlists.authorId, authorId)).all();
          const playlistCount = authorPlaylists.length;

          // フォロワー数を取得
          const followersCount = await dbClient.select().from(follows).where(eq(follows.followingId, authorId)).all();
          const followerCount = followersCount.length;

          return {
            id: row.authors.id,
            name: row.authors.name,
            iconUrl: row.authors.iconUrl,
            createdAt: row.authors.createdAt,
            bio: row.authors.bio,
            followerCount,
            videoCount,
            playlistCount,
          };
        }),
      );

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

      // 結果をUser型に変換して拡張情報を追加
      const following = await Promise.all(
        result.map(async (row) => {
          const authorId = row.authors.id;

          // 動画数を取得
          const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, authorId)).all();
          const videoCount = authorVideos.length;

          // プレイリスト数を取得
          const authorPlaylists = await dbClient.select().from(playlists).where(eq(playlists.authorId, authorId)).all();
          const playlistCount = authorPlaylists.length;

          // フォロワー数を取得
          const followersCount = await dbClient.select().from(follows).where(eq(follows.followingId, authorId)).all();
          const followerCount = followersCount.length;

          return {
            id: row.authors.id,
            name: row.authors.name,
            iconUrl: row.authors.iconUrl,
            createdAt: row.authors.createdAt,
            bio: row.authors.bio,
            followerCount,
            videoCount,
            playlistCount,
          };
        }),
      );

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
