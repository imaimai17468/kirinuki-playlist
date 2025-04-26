// 基本的なAuthor操作
export {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from "@/repositories/authors/base";

// カウント関連の操作
export {
  getAllAuthorsWithCounts,
  getAuthorWithCounts,
  getAuthorWithVideosPlaylistsAndCounts,
} from "@/repositories/authors/features/counts";

// リレーション関連の操作
export {
  getAuthorWithVideos,
  getAuthorWithPlaylists,
  getAuthorWithVideosAndPlaylists,
} from "@/repositories/authors/features/relations";

// ブックマーク関連の操作
export {
  getAuthorBookmarkedVideos,
  bookmarkVideo,
  unbookmarkVideo,
  hasBookmarkedVideo,
  getAuthorBookmarkedPlaylists,
  bookmarkPlaylist,
  unbookmarkPlaylist,
  hasBookmarkedPlaylist,
  getAuthorWithVideosPlaylistsAndBookmarks,
} from "@/repositories/authors/features/bookmarks";

// 型定義をre-export
export type {
  AuthorsResponse,
  AuthorsWithCountsResponse,
  AuthorResponse,
  AuthorInsert,
  AuthorUpdate,
  AuthorWithVideos,
  AuthorWithPlaylists,
  AuthorWithVideosAndPlaylists,
  AuthorWithCounts,
  AuthorWithBookmarkedVideos,
  AuthorWithVideosPlaylistsAndCounts,
  AuthorWithBookmarkedPlaylists,
  AuthorWithVideosPlaylistsAndBookmarks,
  AuthorCreateResponse,
  AuthorUpdateDeleteResponse,
  BookmarkStatusResponse,
} from "./types";
