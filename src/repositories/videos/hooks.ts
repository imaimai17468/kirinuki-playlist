import { createVideo, deleteVideo, getAllVideos, getVideoById, updateVideo } from "@/repositories/videos";
import type { VideoInsert, VideoUpdate } from "@/repositories/videos/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

// 動画を作成するフック
export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VideoInsert) => {
      const result = await createVideo(data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 作成成功後に動画一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// 動画を更新するフック
export function useUpdateVideo(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VideoUpdate) => {
      const result = await updateVideo(id, data);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 更新成功後に該当動画と動画一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["videos", id] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

// 動画を削除するフック
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteVideo(id);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      // 削除成功後に動画一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
