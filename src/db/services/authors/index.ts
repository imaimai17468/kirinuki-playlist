import type { DbClient } from "@/db/config/hono";
import { createBaseAuthorService } from "@/db/services/authors/base";
import { createBookmarksAuthorService } from "@/db/services/authors/features/bookmarks";
import { createCountsAuthorService } from "@/db/services/authors/features/counts";
import { createRelationsAuthorService } from "@/db/services/authors/features/relations";
import type {
  Author,
  AuthorInsert,
  AuthorUpdate,
  AuthorWithBookmarkedPlaylists,
  AuthorWithBookmarkedVideos,
  AuthorWithCounts,
  AuthorWithPlaylists,
  AuthorWithVideos,
  AuthorWithVideosAndPlaylists,
  AuthorWithVideosPlaylistsAndBookmarks,
  AuthorWithVideosPlaylistsAndCounts,
} from "@/db/services/authors/types";

// すべてのサービスを組み合わせた著者サービスの作成関数
export const createAuthorService = (dbClient: DbClient) => {
  const baseService = createBaseAuthorService(dbClient);
  const countsService = createCountsAuthorService(dbClient, baseService);
  const relationsService = createRelationsAuthorService(dbClient, baseService);
  const bookmarksService = createBookmarksAuthorService(dbClient, baseService);

  return {
    // 基本CRUD操作
    ...baseService,

    // カウント関連メソッド
    getAllAuthorsWithCounts: countsService.getAllAuthorsWithCounts,
    getAuthorWithCounts: countsService.getAuthorWithCounts,

    // 関連データ取得メソッド
    getAuthorWithVideos: relationsService.getAuthorWithVideos,
    getAuthorWithPlaylists: relationsService.getAuthorWithPlaylists,
    getAuthorWithVideosAndPlaylists: relationsService.getAuthorWithVideosAndPlaylists,

    // ブックマーク関連メソッド
    getAuthorWithBookmarkedVideos: bookmarksService.getAuthorWithBookmarkedVideos,
    getAuthorWithBookmarkedPlaylists: bookmarksService.getAuthorWithBookmarkedPlaylists,
    bookmarkVideo: bookmarksService.bookmarkVideo,
    unbookmarkVideo: bookmarksService.unbookmarkVideo,
    hasBookmarkedVideo: bookmarksService.hasBookmarkedVideo,
    bookmarkPlaylist: bookmarksService.bookmarkPlaylist,
    unbookmarkPlaylist: bookmarksService.unbookmarkPlaylist,
    hasBookmarkedPlaylist: bookmarksService.hasBookmarkedPlaylist,

    // 複合メソッド
    async getAuthorWithVideosPlaylistsAndCounts(id: string): Promise<AuthorWithVideosPlaylistsAndCounts> {
      const authorWithData = await relationsService.getAuthorWithVideosAndPlaylists(id);
      return await countsService.getAuthorWithVideosPlaylistsAndCounts(id, authorWithData);
    },

    getAuthorWithVideosPlaylistsAndBookmarks: relationsService.getAuthorWithVideosPlaylistsAndBookmarks,
  };
};

// エクスポートする型定義
export type {
  Author,
  AuthorInsert,
  AuthorUpdate,
  AuthorWithVideos,
  AuthorWithPlaylists,
  AuthorWithVideosAndPlaylists,
  AuthorWithCounts,
  AuthorWithVideosPlaylistsAndCounts,
  AuthorWithBookmarkedVideos,
  AuthorWithBookmarkedPlaylists,
  AuthorWithVideosPlaylistsAndBookmarks,
};
