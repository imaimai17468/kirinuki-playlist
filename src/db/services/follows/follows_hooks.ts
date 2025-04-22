import { useToast } from "@/hooks/use-toast";
import { followUser, isFollowing, unfollowUser } from "@/repositories/follows";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * フォローステータスを取得するフック
 */
export const useFollowStatus = (userId: string, isLoggedIn: boolean) => {
  return useQuery({
    queryKey: ["follow", "status", userId],
    queryFn: async () => {
      const result = await isFollowing(userId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    enabled: !!userId && isLoggedIn,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
  });
};

/**
 * フォロー/アンフォロー操作を管理するフック
 */
export const useFollowMutations = (userId: string, userName: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // フォローするミューテーション
  const followMutation = useMutation({
    mutationFn: async () => {
      const result = await followUser(userId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.setQueryData(["follow", "status", userId], true);
      toast({
        variant: "success",
        title: "フォロー完了",
        description: `${userName}さんをフォローしました`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "フォローに失敗しました",
      });
    },
  });

  // アンフォローするミューテーション
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const result = await unfollowUser(userId);
      if (result.isErr()) {
        throw new Error(result.error.message);
      }
      return result.value;
    },
    onSuccess: () => {
      queryClient.setQueryData(["follow", "status", userId], false);
      toast({
        variant: "success",
        title: "フォロー解除",
        description: `${userName}さんのフォローを解除しました`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "フォロー解除に失敗しました",
      });
    },
  });

  return {
    followMutation,
    unfollowMutation,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    toggleFollow: (isFollowed: boolean) => {
      if (isFollowed) {
        unfollowMutation.mutate();
      } else {
        followMutation.mutate();
      }
    },
  };
};
