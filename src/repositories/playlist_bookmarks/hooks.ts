import { useToast } from "@/hooks/use-toast";
import { bookmarkPlaylist, hasBookmarkedPlaylist, unbookmarkPlaylist } from "@/repositories/authors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * プレイリストのブックマーク状態を取得するフック
 */
export const usePlaylistBookmarkStatus = (userId: string, playlistId: string, isSignedIn: boolean) => {
  return useQuery({
    queryKey: ["playlist-bookmark", userId, playlistId],
    queryFn: async () => {
      const result = await hasBookmarkedPlaylist(userId, playlistId);
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
 * プレイリストのブックマーク追加・削除のミューテーションを管理するフック
 */
export const usePlaylistBookmarkMutations = (userId: string, playlistId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ブックマーク追加のミューテーション
  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      const result = await bookmarkPlaylist(userId, playlistId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.setQueryData(["playlist-bookmark", userId, playlistId], true);
      toast({
        title: "ブックマーク追加",
        description: "プレイリストがブックマークに追加されました",
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
      const result = await unbookmarkPlaylist(userId, playlistId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.setQueryData(["playlist-bookmark", userId, playlistId], false);
      toast({
        title: "ブックマーク削除",
        description: "プレイリストがブックマークから削除されました",
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
