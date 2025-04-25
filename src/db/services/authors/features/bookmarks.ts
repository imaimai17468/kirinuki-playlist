import type { DbClient } from "@/db/config/hono";
import type { AuthorWithBookmarkedPlaylists, AuthorWithBookmarkedVideos } from "@/db/services/authors/types";
import type { BaseAuthorService } from "@/db/services/authors/types-internal";
import { createPlaylistBookmarkService } from "@/db/services/playlist_bookmarks/playlist_bookmarks";
import { createVideoBookmarkService } from "@/db/services/video_bookmarks/video_bookmarks";
import { DatabaseError, NotFoundError, UniqueConstraintError } from "@/db/utils/errors";

export const createBookmarksAuthorService = (dbClient: DbClient, baseService: BaseAuthorService) => ({
  async getAuthorWithBookmarkedVideos(id: string): Promise<AuthorWithBookmarkedVideos> {
    try {
      // 著者の基本情報を取得
      const author = await baseService.getAuthorById(id);

      // 著者がブックマークした動画を取得
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      const bookmarkedVideos = await videoBookmarkService.getBookmarksByAuthorId(id);

      return {
        ...author,
        bookmarkedVideos,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者とブックマーク情報の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async getAuthorWithBookmarkedPlaylists(id: string): Promise<AuthorWithBookmarkedPlaylists> {
    try {
      // 著者の基本情報を取得
      const author = await baseService.getAuthorById(id);

      // 著者がブックマークしたプレイリストを取得
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      const bookmarkedPlaylists = await playlistBookmarkService.getBookmarksByAuthorId(id);

      return {
        ...author,
        bookmarkedPlaylists,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者とブックマークプレイリスト情報の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async bookmarkVideo(authorId: string, videoId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await baseService.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを作成
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      await videoBookmarkService.createBookmark(authorId, videoId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw error;
      }
      throw new DatabaseError(
        `動画のブックマーク中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async unbookmarkVideo(authorId: string, videoId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await baseService.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを削除
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      await videoBookmarkService.deleteBookmark(authorId, videoId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `動画のブックマーク解除中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async hasBookmarkedVideo(authorId: string, videoId: string): Promise<boolean> {
    try {
      // 著者の存在を確認
      await baseService.getAuthorById(authorId);

      // ブックマーク状態を確認
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      return await videoBookmarkService.hasBookmarked(authorId, videoId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `ブックマーク状態の確認中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async bookmarkPlaylist(authorId: string, playlistId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await baseService.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを作成
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      await playlistBookmarkService.createBookmark(authorId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof UniqueConstraintError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストのブックマーク中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async unbookmarkPlaylist(authorId: string, playlistId: string): Promise<void> {
    try {
      // 著者の存在を確認
      await baseService.getAuthorById(authorId);

      // ブックマークサービスを使用してブックマークを削除
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      await playlistBookmarkService.deleteBookmark(authorId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストのブックマーク解除中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async hasBookmarkedPlaylist(authorId: string, playlistId: string): Promise<boolean> {
    try {
      // 著者の存在を確認
      await baseService.getAuthorById(authorId);

      // ブックマーク状態を確認
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      return await playlistBookmarkService.hasBookmarked(authorId, playlistId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `プレイリストブックマーク状態の確認中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },
});
