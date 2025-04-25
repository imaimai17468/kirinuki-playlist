import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { authors } from "../../models/authors";
import type { PlaylistWithAuthorAndVideos } from "../playlists/playlists";
import type { VideoWithTagsAndAuthor } from "../videos/videos";

export type Author = InferSelectModel<typeof authors>;
export type AuthorInsert = Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">;
export type AuthorUpdate = Partial<Omit<InferInsertModel<typeof authors>, "id" | "createdAt" | "updatedAt">>;

// 著者と関連動画を含む拡張型
export type AuthorWithVideos = Author & {
  videos: VideoWithTagsAndAuthor[];
};

// 著者と関連プレイリストを含む拡張型
export type AuthorWithPlaylists = Author & {
  playlists: PlaylistWithAuthorAndVideos[];
};

// 著者と関連動画・プレイリストを含む拡張型
export type AuthorWithVideosAndPlaylists = Author & {
  videos: VideoWithTagsAndAuthor[];
  playlists: PlaylistWithAuthorAndVideos[];
};

// 著者とフォロワー数・投稿数を含む拡張型
export type AuthorWithCounts = Author & {
  followerCount: number;
  videoCount: number;
  playlistCount: number;
};

// 著者と関連データ＋カウント情報を含む拡張型
export type AuthorWithVideosPlaylistsAndCounts = AuthorWithVideosAndPlaylists & {
  followerCount: number;
  videoCount: number;
  playlistCount: number;
};

// 著者とブックマークした動画を含む拡張型
export type AuthorWithBookmarkedVideos = Author & {
  bookmarkedVideos: VideoWithTagsAndAuthor[];
};

// 著者とブックマークしたプレイリストを含む拡張型
export type AuthorWithBookmarkedPlaylists = Author & {
  bookmarkedPlaylists: PlaylistWithAuthorAndVideos[];
};

// 著者と動画・プレイリスト・ブックマークを含む完全拡張型
export type AuthorWithVideosPlaylistsAndBookmarks = AuthorWithVideosAndPlaylists & {
  bookmarkedVideos: VideoWithTagsAndAuthor[];
  bookmarkedPlaylists: PlaylistWithAuthorAndVideos[];
};
