import type { PlaylistWithAuthorAndVideos } from "../playlists";
import type { BookmarkResult } from "./types";

// プレイリストブックマークサービスの基本インターフェース
export interface BasePlaylistBookmarkService {
  getBookmarksByAuthorId(authorId: string): Promise<PlaylistWithAuthorAndVideos[]>;
  getAuthorsByBookmarkedPlaylistId(playlistId: string): Promise<string[]>;
  createBookmark(authorId: string, playlistId: string): Promise<BookmarkResult>;
  deleteBookmark(authorId: string, playlistId: string): Promise<void>;
  hasBookmarked(authorId: string, playlistId: string): Promise<boolean>;
}
