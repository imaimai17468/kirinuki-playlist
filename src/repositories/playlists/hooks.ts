import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  getPlaylistById,
  removeVideoFromPlaylist,
  updatePlaylist,
  updatePlaylistVideo,
} from "@/repositories/playlists";
import type {
  PlaylistInsert,
  PlaylistUpdate,
  PlaylistVideoInsert,
  PlaylistVideoUpdate,
} from "@/repositories/playlists/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// プレイリスト一覧を取得するフック
export function usePlaylists() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const result = await getAllPlaylists();
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
  });
}

// 特定のプレイリストを取得するフック
export function usePlaylist(id: string) {
  return useQuery({
    queryKey: ["playlists", id],
    queryFn: async () => {
      const result = await getPlaylistById(id);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    // IDが指定されていない場合はクエリを実行しない
    enabled: !!id,
  });
}

// プレイリストを作成するフック
export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlaylistInsert) => {
      const result = await createPlaylist(data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 作成成功後にプレイリスト一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

// プレイリストを更新するフック
export function useUpdatePlaylist(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlaylistUpdate) => {
      const result = await updatePlaylist(id, data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 更新成功後に該当プレイリストとプレイリスト一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["playlists", id] });
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

// プレイリストを削除するフック
export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePlaylist(id);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 削除成功後にプレイリスト一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

// プレイリストに動画を追加するフック
export function useAddVideoToPlaylist(playlistId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PlaylistVideoInsert) => {
      const result = await addVideoToPlaylist(playlistId, data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 追加成功後に該当プレイリストを再取得
      queryClient.invalidateQueries({ queryKey: ["playlists", playlistId] });
    },
  });
}

// プレイリストから動画を削除するフック
export function useRemoveVideoFromPlaylist(playlistId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const result = await removeVideoFromPlaylist(playlistId, videoId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 削除成功後に該当プレイリストを再取得
      queryClient.invalidateQueries({ queryKey: ["playlists", playlistId] });
    },
  });
}

// プレイリスト内の動画を更新するフック
export function useUpdatePlaylistVideo(playlistId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      data,
    }: {
      videoId: string;
      data: PlaylistVideoUpdate;
    }) => {
      const result = await updatePlaylistVideo(playlistId, videoId, data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 更新成功後に該当プレイリストを再取得
      queryClient.invalidateQueries({ queryKey: ["playlists", playlistId] });
    },
  });
}
