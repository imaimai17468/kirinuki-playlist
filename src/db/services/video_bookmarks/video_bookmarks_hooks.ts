import { useToast } from "@/hooks/use-toast";
import { bookmarkVideo, hasBookmarkedVideo, unbookmarkVideo } from "@/repositories/authors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * ビデオのブックマーク状態を取得するフック
 */
export const useBookmarkStatus = (userId: string, videoId: string, isSignedIn: boolean) => {
  return useQuery({
    queryKey: ["bookmark", userId, videoId],
    queryFn: async () => {
      const result = await hasBookmarkedVideo(userId, videoId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    enabled: isSignedIn && !!userId,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
  });
};

/**
 * ブックマーク追加・削除のミューテーションを管理するフック
 */
export const useBookmarkMutations = (userId: string, videoId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ブックマーク追加のミューテーション
  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      const result = await bookmarkVideo(userId, videoId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.setQueryData(["bookmark", userId, videoId], true);
      toast({
        title: "ブックマーク追加",
        description: "動画がブックマークに追加されました",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message || "ブックマークの追加に失敗しました",
        variant: "destructive",
      });
    },
  });

  // ブックマーク削除のミューテーション
  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      const result = await unbookmarkVideo(userId, videoId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.setQueryData(["bookmark", userId, videoId], false);
      toast({
        title: "ブックマーク削除",
        description: "動画がブックマークから削除されました",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: error.message || "ブックマークの削除に失敗しました",
        variant: "destructive",
      });
    },
  });

  return {
    addBookmarkMutation,
    removeBookmarkMutation,
    isLoading: addBookmarkMutation.isPending || removeBookmarkMutation.isPending,
    toggleBookmark: (isCurrentlyBookmarked: boolean) => {
      if (isCurrentlyBookmarked) {
        removeBookmarkMutation.mutate();
      } else {
        addBookmarkMutation.mutate();
      }
    },
  };
};
