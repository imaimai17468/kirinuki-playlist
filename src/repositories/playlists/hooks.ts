import { getAllPlaylists, getPlaylistById } from "@/repositories/playlists";
import { useQuery } from "@tanstack/react-query";

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
