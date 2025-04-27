// 基本的なプレイリスト操作
export {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "@/repositories/playlists/base";

// プレイリスト内の動画操作
export {
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  updatePlaylistVideo,
} from "@/repositories/playlists/features/videos";

// 型定義をre-export
export type {
  PlaylistsResponse,
  PlaylistResponse,
  Playlist,
  PlaylistInsert,
  PlaylistUpdate,
  PlaylistVideo,
  PlaylistVideoInsert,
  PlaylistVideoUpdate,
  PlaylistCreateResponse,
  PlaylistUpdateDeleteResponse,
} from "./types";
