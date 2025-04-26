import type {
  PlaylistInsert,
  PlaylistUpdate,
  PlaylistVideoInsert,
  PlaylistVideoUpdate,
  PlaylistWithAuthor,
  PlaylistWithAuthorAndVideos,
} from "./types";

// 基本プレイリストサービスの型
export interface BasePlaylistService {
  getAllPlaylists(): Promise<PlaylistWithAuthor[]>;
  getPlaylistById(id: string): Promise<PlaylistWithAuthor>;
  createPlaylist(data: PlaylistInsert): Promise<string>;
  updatePlaylist(id: string, data: PlaylistUpdate): Promise<void>;
  deletePlaylist(id: string): Promise<void>;
}

// プレイリスト - 動画関連サービスの型
export interface PlaylistVideoRelationsService {
  getPlaylistWithVideosById(id: string): Promise<PlaylistWithAuthorAndVideos>;
  getAllPlaylistsWithVideos(): Promise<PlaylistWithAuthorAndVideos[]>;
  addVideoToPlaylist(playlistId: string, videoData: PlaylistVideoInsert): Promise<void>;
  removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void>;
  updatePlaylistVideo(playlistId: string, videoId: string, data: PlaylistVideoUpdate): Promise<void>;
}
