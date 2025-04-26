import type { DbClient } from "@/db/config/hono";
import { playlists } from "@/db/models/playlists";
import { videos } from "@/db/models/videos";
import type {
  AuthorWithPlaylists,
  AuthorWithVideos,
  AuthorWithVideosAndPlaylists,
  AuthorWithVideosPlaylistsAndBookmarks,
} from "@/db/services/authors/types";
import type { BaseAuthorService } from "@/db/services/authors/types-internal";
import { createPlaylistBookmarkService } from "@/db/services/playlist_bookmarks";
import { createPlaylistService } from "@/db/services/playlists";
import { createVideoBookmarkService } from "@/db/services/video_bookmarks";
import { createVideoService } from "@/db/services/videos";
import { DatabaseError, NotFoundError } from "@/db/utils/errors";
import { eq } from "drizzle-orm";

export const createRelationsAuthorService = (dbClient: DbClient, baseService: BaseAuthorService) => ({
  async getAuthorWithVideos(id: string): Promise<AuthorWithVideos> {
    try {
      // 著者の情報を取得
      const author = await baseService.getAuthorById(id);

      // 著者に関連する動画を取得
      const videoService = createVideoService(dbClient);
      const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, id)).all();

      // 各動画の詳細情報（タグ情報を含む）を取得
      const videosWithDetails = await Promise.all(authorVideos.map((video) => videoService.getVideoById(video.id)));

      return {
        ...author,
        videos: videosWithDetails,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者と動画の取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAuthorWithPlaylists(id: string): Promise<AuthorWithPlaylists> {
    try {
      // 著者の情報を取得
      const author = await baseService.getAuthorById(id);

      // 著者に関連するプレイリストを取得
      const playlistService = createPlaylistService(dbClient);
      const authorPlaylists = await dbClient.select().from(playlists).where(eq(playlists.authorId, id)).all();

      // 各プレイリストの詳細情報（動画情報を含む）を取得
      const playlistsWithDetails = await Promise.all(
        authorPlaylists.map((playlist) => playlistService.getPlaylistWithVideosById(playlist.id)),
      );

      return {
        ...author,
        playlists: playlistsWithDetails,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者とプレイリストの取得中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  },

  async getAuthorWithVideosAndPlaylists(id: string): Promise<AuthorWithVideosAndPlaylists> {
    try {
      // 著者の情報を取得
      const author = await baseService.getAuthorById(id);

      // 著者に関連する動画とプレイリストを並行して取得
      const videoService = createVideoService(dbClient);
      const playlistService = createPlaylistService(dbClient);

      const authorVideos = await dbClient.select().from(videos).where(eq(videos.authorId, id)).all();
      const authorPlaylists = await dbClient.select().from(playlists).where(eq(playlists.authorId, id)).all();

      // 各動画とプレイリストの詳細情報を取得
      const [videosWithDetails, playlistsWithDetails] = await Promise.all([
        Promise.all(authorVideos.map((video) => videoService.getVideoById(video.id))),
        Promise.all(authorPlaylists.map((playlist) => playlistService.getPlaylistWithVideosById(playlist.id))),
      ]);

      return {
        ...author,
        videos: videosWithDetails,
        playlists: playlistsWithDetails,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者の動画とプレイリストの取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },

  async getAuthorWithVideosPlaylistsAndBookmarks(id: string): Promise<AuthorWithVideosPlaylistsAndBookmarks> {
    try {
      // 著者の基本情報と動画・プレイリストを取得
      const authorWithData = await this.getAuthorWithVideosAndPlaylists(id);

      // 著者がブックマークした動画を取得
      const videoBookmarkService = createVideoBookmarkService(dbClient);
      const bookmarkedVideos = await videoBookmarkService.getBookmarksByAuthorId(id);

      // 著者がブックマークしたプレイリストを取得
      const playlistBookmarkService = createPlaylistBookmarkService(dbClient);
      const bookmarkedPlaylists = await playlistBookmarkService.getBookmarksByAuthorId(id);

      return {
        ...authorWithData,
        bookmarkedVideos,
        bookmarkedPlaylists,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `著者の全データ（ブックマーク含む）の取得中にエラーが発生しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`,
      );
    }
  },
});
