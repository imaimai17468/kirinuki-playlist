import type { DbClient } from "@/db/config/hono";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { authors } from "../../models/authors";
import { playlistBookmarks } from "../../models/playlist_bookmarks";
import { playlists } from "../../models/playlists";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "../../utils/errors";
import type { PlaylistWithAuthorAndVideos } from "../playlists/playlists";
import { createPlaylistService } from "../playlists/playlists";

export type BookmarkResult = {
  id: string;
  playlistId: string;
  authorId: string;
};

// 依存性注入パターンを使ったプレイリストブックマークサービスの作成関数
export const createPlaylistBookmarkService = (dbClient: DbClient) => ({
  // 著者のブックマーク一覧を取得
  async getBookmarksByAuthorId(authorId: string): Promise<PlaylistWithAuthorAndVideos[]> {
    try {
      // まず著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${authorId} の著者が見つかりません`);
      }

      // 著者のブックマーク一覧を取得
      const bookmarks = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(eq(playlistBookmarks.authorId, authorId))
        .all();

      if (bookmarks.length === 0) {
        return [];
      }

      // ブックマークしたプレイリストのIDを取得
      const playlistIds = bookmarks.map((bookmark) => bookmark.playlistId);

      // プレイリストの詳細情報を取得
      const playlistService = createPlaylistService(dbClient);
      const bookmarkedPlaylists = await Promise.all(
        playlistIds.map((playlistId) => playlistService.getPlaylistWithVideosById(playlistId)),
      );

      return bookmarkedPlaylists;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者のプレイリストブックマーク取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  // プレイリストをブックマークした著者一覧を取得
  async getAuthorsByBookmarkedPlaylistId(playlistId: string): Promise<string[]> {
    try {
      // まずプレイリストが存在するか確認
      const playlist = await dbClient.select().from(playlists).where(eq(playlists.id, playlistId)).get();
      if (!playlist) {
        throw new NotFoundError(`ID: ${playlistId} のプレイリストが見つかりません`);
      }

      // プレイリストをブックマークした著者一覧を取得
      const bookmarks = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(eq(playlistBookmarks.playlistId, playlistId))
        .all();

      // 著者IDのリストを返す
      return bookmarks.map((bookmark) => bookmark.authorId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストをブックマークした著者一覧の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  // ブックマークを作成
  async createBookmark(authorId: string, playlistId: string): Promise<BookmarkResult> {
    try {
      // 著者が存在するか確認
      const author = await dbClient.select().from(authors).where(eq(authors.id, authorId)).get();
      if (!author) {
        throw new NotFoundError(`ID: ${authorId} の著者が見つかりません`);
      }

      // プレイリストが存在するか確認
      const playlist = await dbClient.select().from(playlists).where(eq(playlists.id, playlistId)).get();
      if (!playlist) {
        throw new NotFoundError(`ID: ${playlistId} のプレイリストが見つかりません`);
      }

      // すでにブックマークが存在するか確認
      const existingBookmark = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, authorId), eq(playlistBookmarks.playlistId, playlistId)))
        .get();

      if (existingBookmark) {
        // すでに存在する場合は既存のブックマーク情報を返す
        return {
          id: existingBookmark.id,
          playlistId: existingBookmark.playlistId,
          authorId: existingBookmark.authorId,
        };
      }

      // 新しいブックマークの作成
      const now = new Date();
      const id = nanoid();

      await dbClient.insert(playlistBookmarks).values({
        id,
        authorId,
        playlistId,
        createdAt: now,
        updatedAt: now,
      });

      return {
        id,
        playlistId,
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

        throw new DatabaseError(`プレイリストブックマークの作成中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  // ブックマークを削除
  async deleteBookmark(authorId: string, playlistId: string): Promise<void> {
    try {
      // ブックマークが存在するか確認
      const bookmark = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, authorId), eq(playlistBookmarks.playlistId, playlistId)))
        .get();

      if (!bookmark) {
        throw new NotFoundError(
          `著者ID: ${authorId} によるプレイリストID: ${playlistId} のブックマークが見つかりません`,
        );
      }

      // ブックマークを削除
      await dbClient
        .delete(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, authorId), eq(playlistBookmarks.playlistId, playlistId)))
        .run();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new DatabaseError(`プレイリストブックマークの削除中にエラーが発生しました: ${error.message}`);
      }

      throw error;
    }
  },

  // 特定の著者が特定のプレイリストをブックマークしているか確認
  async hasBookmarked(authorId: string, playlistId: string): Promise<boolean> {
    try {
      const bookmark = await dbClient
        .select()
        .from(playlistBookmarks)
        .where(and(eq(playlistBookmarks.authorId, authorId), eq(playlistBookmarks.playlistId, playlistId)))
        .get();

      return !!bookmark;
    } catch (error) {
      throw new DatabaseError(
        `プレイリストブックマーク確認中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },
});
