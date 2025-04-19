import type { DbClient } from "@/db/config/hono";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { videoBookmarks } from "../../models/video_bookmarks";
import { videos } from "../../models/videos";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";
import type { VideoWithTagsAndAuthor } from "../videos/videos";
import { createVideoService } from "../videos/videos";

export type BookmarkResult = {
  id: string;
  videoId: string;
  authorId: string;
};

// 依存性注入パターンを使ったビデオブックマークサービスの作成関数
export const createVideoBookmarkService = (dbClient: DbClient) => ({
  // 著者のブックマーク一覧を取得
  async getBookmarksByAuthorId(authorId: string): Promise<VideoWithTagsAndAuthor[]> {
    try {
      // まず著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${authorId} の著者が見つかりません`);
      }

      // 著者のブックマーク一覧を取得
      const bookmarks = await dbClient.select().from(videoBookmarks).where(eq(videoBookmarks.authorId, authorId)).all();

      if (bookmarks.length === 0) {
        return [];
      }

      // ブックマークした動画のIDを取得
      const videoIds = bookmarks.map((bookmark) => bookmark.videoId);

      // 動画の詳細情報を取得
      const videoService = createVideoService(dbClient);
      const bookmarkedVideos = await Promise.all(videoIds.map((videoId) => videoService.getVideoById(videoId)));

      return bookmarkedVideos;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者のブックマーク取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  // 動画をブックマークした著者一覧を取得
  async getAuthorsByBookmarkedVideoId(videoId: string): Promise<string[]> {
    try {
      // まず動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, videoId)).get();
      if (!video) {
        throw new NotFoundError(`ID: ${videoId} の動画が見つかりません`);
      }

      // 動画をブックマークした著者一覧を取得
      const bookmarks = await dbClient.select().from(videoBookmarks).where(eq(videoBookmarks.videoId, videoId)).all();

      // 著者IDのリストを返す
      return bookmarks.map((bookmark) => bookmark.authorId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `動画をブックマークした著者一覧の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  // ブックマークを作成
  async createBookmark(authorId: string, videoId: string): Promise<BookmarkResult> {
    try {
      // 著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${authorId} の著者が見つかりません`);
      }

      // 動画が存在するか確認
      const video = await dbClient.select().from(videos).where(eq(videos.id, videoId)).get();
      if (!video) {
        throw new NotFoundError(`ID: ${videoId} の動画が見つかりません`);
      }

      // すでにブックマークが存在するか確認
      const existingBookmark = await dbClient
        .select()
        .from(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, authorId), eq(videoBookmarks.videoId, videoId)))
        .get();

      if (existingBookmark) {
        // すでに存在する場合は既存のブックマーク情報を返す
        return {
          id: existingBookmark.id,
          videoId: existingBookmark.videoId,
          authorId: existingBookmark.authorId,
        };
      }

      // 新しいブックマークの作成
      const now = new Date();
      const id = nanoid();

      await dbClient.insert(videoBookmarks).values({
        id,
        authorId,
        videoId,
        createdAt: now,
        updatedAt: now,
      });

      return {
        id,
        videoId,
        authorId,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          throw new UniqueConstraintError("このブックマークはすでに存在します");
        }

        throw new DatabaseError(`ブックマークの作成中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  // ブックマークを削除
  async deleteBookmark(authorId: string, videoId: string): Promise<void> {
    try {
      // ブックマークが存在するか確認
      const bookmark = await dbClient
        .select()
        .from(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, authorId), eq(videoBookmarks.videoId, videoId)))
        .get();

      if (!bookmark) {
        throw new NotFoundError(`著者ID: ${authorId} による動画ID: ${videoId} のブックマークが見つかりません`);
      }

      // ブックマークを削除
      await dbClient
        .delete(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, authorId), eq(videoBookmarks.videoId, videoId)))
        .run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`ブックマークの削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  // 特定の著者が特定の動画をブックマークしているか確認
  async hasBookmarked(authorId: string, videoId: string): Promise<boolean> {
    try {
      const bookmark = await dbClient
        .select()
        .from(videoBookmarks)
        .where(and(eq(videoBookmarks.authorId, authorId), eq(videoBookmarks.videoId, videoId)))
        .get();

      return !!bookmark;
    } catch (error) {
      throw new DatabaseError(
        `ブックマーク確認中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },
});
