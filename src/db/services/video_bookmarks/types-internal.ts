import type { VideoWithTagsAndAuthor } from "../videos/videos";
import type { BookmarkResult } from "./types";

// ビデオブックマークサービスの基本インターフェース
export interface BaseVideoBookmarkService {
  getBookmarksByAuthorId(authorId: string): Promise<VideoWithTagsAndAuthor[]>;
  getAuthorsByBookmarkedVideoId(videoId: string): Promise<string[]>;
  createBookmark(authorId: string, videoId: string): Promise<BookmarkResult>;
  deleteBookmark(authorId: string, videoId: string): Promise<void>;
  hasBookmarked(authorId: string, videoId: string): Promise<boolean>;
}
