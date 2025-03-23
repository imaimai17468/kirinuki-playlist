import { getAllVideos, getVideoById } from "@/repositories/videos";
import { useQuery } from "@tanstack/react-query";

// ビデオ一覧を取得するフック
export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const result = await getAllVideos();
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
  });
}

// 特定のビデオを取得するフック
export function useVideo(id: string) {
  return useQuery({
    queryKey: ["videos", id],
    queryFn: async () => {
      const result = await getVideoById(id);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    // IDが指定されていない場合はクエリを実行しない
    enabled: !!id,
  });
}
