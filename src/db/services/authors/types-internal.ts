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
} from "./types";

// 基本著者サービスの型
export interface BaseAuthorService {
  getAllAuthors(): Promise<Author[]>;
  getAuthorById(id: string): Promise<Author>;
  createAuthor(data: AuthorInsert): Promise<string>;
  updateAuthor(id: string, data: AuthorUpdate): Promise<void>;
  deleteAuthor(id: string): Promise<void>;
}

// 関連データを扱うサービスの型
export interface RelationsAuthorService {
  getAuthorWithVideos(id: string): Promise<AuthorWithVideos>;
  getAuthorWithPlaylists(id: string): Promise<AuthorWithPlaylists>;
  getAuthorWithVideosAndPlaylists(id: string): Promise<AuthorWithVideosAndPlaylists>;
  getAuthorWithVideosPlaylistsAndBookmarks(id: string): Promise<AuthorWithVideosPlaylistsAndBookmarks>;
}

// カウント情報を扱うサービスの型
export interface CountsAuthorService {
  getAllAuthorsWithCounts(): Promise<AuthorWithCounts[]>;
  getAuthorWithCounts(id: string): Promise<AuthorWithCounts>;
  getAuthorWithVideosPlaylistsAndCounts(
    id: string,
    authorWithData: AuthorWithVideosAndPlaylists,
  ): Promise<AuthorWithVideosPlaylistsAndCounts>;
}

// ブックマーク機能を扱うサービスの型
export interface BookmarksAuthorService {
  getAuthorWithBookmarkedVideos(id: string): Promise<AuthorWithBookmarkedVideos>;
  getAuthorWithBookmarkedPlaylists(id: string): Promise<AuthorWithBookmarkedPlaylists>;
  bookmarkVideo(authorId: string, videoId: string): Promise<void>;
  unbookmarkVideo(authorId: string, videoId: string): Promise<void>;
  hasBookmarkedVideo(authorId: string, videoId: string): Promise<boolean>;
  bookmarkPlaylist(authorId: string, playlistId: string): Promise<void>;
  unbookmarkPlaylist(authorId: string, playlistId: string): Promise<void>;
  hasBookmarkedPlaylist(authorId: string, playlistId: string): Promise<boolean>;
}
